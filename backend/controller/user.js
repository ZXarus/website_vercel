const { supabaseAdmin } = require('../supabase');
const { generateJwt } = require('../helpers/jwt');
const c = require("../helpers/common")

exports.createUser = async (req, res) => {
  try {
    const { fullName, email, password, confirmPassword } = req.body;

    if (!fullName || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedName = String(fullName).trim();

    //check if user already exists
    const { data: existing, error: checkErr } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (checkErr) {
      console.error('check user error:', checkErr);
      return res.status(500).json({ error: 'Database lookup failed' });
    }
    if (existing) {
      return res.status(409).json({ error: 'User already exists. Please log in.' });
    }

    // split names
    const [firstName, ...rest] = normalizedName.split(' ');
    const lastName = rest.join(' ') || null;

    // hash password
    const hashedPassword = await c.hashPassword(password,10);

    // insert into users table
    const { data: newUser, error: insertErr } = await supabaseAdmin
      .from('users')
      .insert([
        {
          full_name: normalizedName,
          first_name: firstName,
          last_name: lastName,
          email: normalizedEmail,
          password: hashedPassword,
          is_active:1,
        }
      ])
      .select()
      .single();

    if (insertErr) {
      console.error('insert user error:', insertErr);
      return res.status(500).json({ error: 'User could not be created' });
    }

    // issue JWT (payload = safe user fields)
    const payload = { id: newUser.id, email: newUser.email, fullName: newUser.full_name };
    const token = generateJwt(payload);

    return res.status(201).json({ user: newUser, token });
  } catch (e) {
    console.error('createUser error:', e);
    return res.status(500).json({ error: 'Internal server error' });
  }
};



// quick DB/connection check
exports.dbHealth = async (_req, res) => {
  const { error } = await supabase.from('profiles').select('*').limit(1);
  return res.json({ ok: !error, note: error?.message ?? 'DB reachable' });
};