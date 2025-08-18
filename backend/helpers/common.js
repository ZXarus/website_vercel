// backend/helpers/hash.js
const bcrypt = require('bcryptjs');

async function hashPassword(plain, rounds) {
  const salt = await bcrypt.genSalt(rounds);
  return bcrypt.hash(plain, salt);
}

async function verifyPassword(plain, hashed) {
  return bcrypt.compare(plain, hashed);
}

module.exports = { hashPassword, verifyPassword };