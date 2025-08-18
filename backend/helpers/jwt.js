const jwt = require('jsonwebtoken');
const CryptoJS = require('crypto-js');

/** generate a JWT with given payload */
function generateJwt(payload, options = {}) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET not configured');
  const expiresIn = options.expiresIn || '5h';
  const token = jwt.sign(payload, secret, { expiresIn });
  const secretToken = encryptAES(token);
  return secretToken;
}

/** Verify and decode a JWT */
function verifyJwt(token) {
  const secret = process.env.JWT_SECRET;
  const raw = decryptAES(token)
  return jwt.verify(raw, secret);
}

/** Encrypt data using AES (CryptoJS) */
function encryptAES(plainText) {
  const secret = process.env.CRYPTO_SECRET;
  if (!secret) throw new Error('CRYPTO_SECRET not configured');
  return CryptoJS.AES.encrypt(plainText, secret).toString();
}

/** Decrypt AES-encrypted data */
function decryptAES(cipherText) {
  const secret = process.env.CRYPTO_SECRET;
  if (!secret) throw new Error('CRYPTO_SECRET not configured');
  const bytes = CryptoJS.AES.decrypt(cipherText, secret);
  return bytes.toString(CryptoJS.enc.Utf8);
}

/** Hash data with SHA256 */
function hashSHA256(data) {
  return CryptoJS.SHA256(data).toString(CryptoJS.enc.Hex);
}

module.exports = {
  generateJwt,
  verifyJwt,
  encryptAES,
  decryptAES,
  hashSHA256,
};