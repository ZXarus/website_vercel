const { supabaseAdmin } = require('../supabase');
const { generateJwt } = require('../helpers/jwt');
const c = require("../helpers/common")


// tweak these if your actual table names differ
const TABLE_USERS = 'users';
const TABLE_ROLES = 'roles';
const TABLE_USER_HAS_ROLE = 'user_has_roles';
const DEFAULT_ROLE_TYPE = 'User'; // or use a specific role_id if you prefer

exports.createUser = async (req, res) => {
  try {
    const { fullName, email, password, confirmPassword } = req.body;

    // validate
    if (!fullName || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedName  = String(fullName).trim();

    // check existing user
    const { data: existing, error: checkErr } = await supabaseAdmin
      .from(TABLE_USERS)
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

    // split names & hash
    const [firstName, ...rest] = normalizedName.split(' ');
    const lastName = rest.join(' ') || null;
    const hashedPassword = await c.hashPassword(password, 10);

    // insert user
    const { data: newUser, error: insertErr } = await supabaseAdmin
      .from(TABLE_USERS)
      .insert([{
        full_name: normalizedName,
        first_name: firstName,
        last_name: lastName,
        email: normalizedEmail,
        password: hashedPassword,
        is_active: 1,
      }])
      .select()
      .single();

    if (insertErr) {
      console.error('insert user error:', insertErr);
      return res.status(500).json({ error: 'User could not be created' });
    }

    // fetch default role (role_type = 'User')
    const { data: roleRow, error: roleErr } = await supabaseAdmin
      .from(TABLE_ROLES)
      .select('role_id, role_type')   // if your PK/column is roleId, change to 'roleId, roleType'
      .eq('role_type', DEFAULT_ROLE_TYPE)
      .maybeSingle();

    if (roleErr || !roleRow) {
      console.error('default role error:', roleErr || 'not found');
      // Optional: you could delete the just-created user to keep things clean
      // await supabaseAdmin.from(TABLE_USERS).delete().eq('id', newUser.id);
      return res.status(500).json({ error: 'Default role not configured' });
    }

    // insert link row into user_has_role
    const { error: linkErr } = await supabaseAdmin
      .from(TABLE_USER_HAS_ROLE)
      .insert([{
        user_id: newUser.id,          // change to userId if your column is camelCase
        role_id: roleRow.role_id,     // change to roleId if your column is camelCase
        // created_at will default if column has DEFAULT now()
      }]);

    if (linkErr) {
      console.error('link user-role error:', linkErr);
      return res.status(500).json({ error: 'Failed to assign default role' });
    }

    // issue JWT
    const payload = { id: newUser.id, email: newUser.email, fullName: newUser.full_name };
    const token = generateJwt(payload);

    return res.status(201).json({ user: newUser, token });
  } catch (e) {
    console.error('createUser error:', e);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// exports.createUser = async (req, res) => {
//   try {
//     const { fullName, email, password, confirmPassword } = req.body;

//     if (!fullName || !email || !password || !confirmPassword) {
//       return res.status(400).json({ error: 'All fields are required' });
//     }
//     if (password !== confirmPassword) {
//       return res.status(400).json({ error: 'Passwords do not match' });
//     }

//     const normalizedEmail = String(email).trim().toLowerCase();
//     const normalizedName = String(fullName).trim();

//     //check if user already exists
//     const { data: existing, error: checkErr } = await supabaseAdmin
//       .from('users')
//       .select('id')
//       .eq('email', normalizedEmail)
//       .maybeSingle();

//     if (checkErr) {
//       console.error('check user error:', checkErr);
//       return res.status(500).json({ error: 'Database lookup failed' });
//     }
//     if (existing) {
//       return res.status(409).json({ error: 'User already exists. Please log in.' });
//     }

//     // split names
//     const [firstName, ...rest] = normalizedName.split(' ');
//     const lastName = rest.join(' ') || null;

//     // hash password
//     const hashedPassword = await c.hashPassword(password,10);

//     // insert into users table
//     const { data: newUser, error: insertErr } = await supabaseAdmin
//       .from('users')
//       .insert([
//         {
//           full_name: normalizedName,
//           first_name: firstName,
//           last_name: lastName,
//           email: normalizedEmail,
//           password: hashedPassword,
//           is_active:1,
//         }
//       ])
//       .select()
//       .single();

//     if (insertErr) {
//       console.error('insert user error:', insertErr);
//       return res.status(500).json({ error: 'User could not be created' });
//     }

//     // issue JWT (payload = safe user fields)
//     const payload = { id: newUser.id, email: newUser.email, fullName: newUser.full_name };
//     const token = generateJwt(payload);

//     return res.status(201).json({ user: newUser, token });
//   } catch (e) {
//     console.error('createUser error:', e);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// };



// quick DB/connection check
exports.dbHealth = async (_req, res) => {
  const { error } = await supabase.from('profiles').select('*').limit(1);
  return res.json({ ok: !error, note: error?.message ?? 'DB reachable' });
};