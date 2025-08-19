// backend/middleware.js
const { verifyJwt } = require('../helpers/jwt');
const { supabaseAdmin } = require('../supabase');

/**
 * Protect /api routes.
 * Requirements:
 *  - Header: Authorization: Bearer <AES-wrapped-JWT>
 *  - JWT must be valid and not expired
 *  - (Optional) User must exist and be active in DB
 */
async function authMiddleware(req, res, next) {
  try {
    // pull out the token from header
    let token = req.header('Authorization');
    if (!token) {
      return res.status(401).json({
        status: 401,
        message: 'You need to login before accessing the resource.',
      });
    }

    // remove "Bearer " prefix if present
    token = token.replace('Bearer', '').trim();

    // Decrypt + verify (throws on invalid/expired)
    const decoded = verifyJwt(token);

    // confirm user exists / is active in Supabase
    const { data: userRow, error: dbErr } = await supabaseAdmin
      .from('users')
      .select('id, is_active')
      .eq('id', decoded.id)
      .maybeSingle();

    if (dbErr) {
      // don’t expose DB internals; keep consistent 401 to avoid info leaks
      return res.status(401).json({
        status: 401,
        message: 'You need to login before accessing the resource.',
      });
    }

    if (!userRow) {
      return res.status(401).json({
        status: 401,
        message: 'User does not exist. Please sign up.',
      });
    }

    // Attach minimal user context to request
    req.user = { id: decoded.id, email: decoded.email|| [] };
    return next();
  } catch (err) {
    return res.status(401).json({ message: "Please log in again", error: err.message });
    // const isExpired = err?.name === 'TokenExpiredError';
    // return res.status(401).json({
    //   status: 401,
    //   message: isExpired
    //     ? 'Session expired. Please log in again.'
    //     : 'Please Log in again',
    //});
  }
}

module.exports = authMiddleware;