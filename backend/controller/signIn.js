const { supabaseAdmin } = require('../supabase');
const { generateJwt } = require('../helpers/jwt');
const c = require('../helpers/common'); // has verifyPassword()

/**
 * POST /auth/sign-in
 * Body: { email, password, rememberMe? }
 * Returns: { token, expiresIn, rememberMe, user }
 */
exports.signInUser = async (req, res) => {
  try {
    const { email, password, rememberMe = false } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    // fetch user
    const { data: user, error: findErr } = await supabaseAdmin
      .from('users')
      .select('id, email, password, full_name, is_active')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (findErr) {
      console.error('signIn lookup error:', findErr);
      return res.status(500).json({ message: 'Database lookup failed.' });
    }

    // same generic message for invalid user or wrong password (security)
    if (!user || !(await c.verifyPassword(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    if (user.is_active === 0 || user.is_active === false) {
      return res.status(401).json({
        message: 'This account has been deactivated. Please contact support.',
      });
    }

    // Remember‑me controls access token TTL
    const expiresIn = rememberMe ? '30d' : '2h';

    // Issue access token (AES‑wrapped JWT via your helper)
    const payload = { id: user.id, email: user.email };
    const token = generateJwt(payload, { expiresIn });

    return res.json({
      token,
      expiresIn,
      rememberMe: !!rememberMe,
      user: { id: user.id, email: user.email, fullName: user.full_name },
    });
  } catch (e) {
    console.error('signIn error:', e);
    return res.status(500).json({ message: 'Login failed.' });
  }
};