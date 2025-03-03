const crypto = require('crypto');
require('dotenv').config();

const algorithm = process.env.CRYPTO_ALGO || 'aes-256-cbc';
let secretKey = process.env.CRYPTO_KEY;  // The secret key from the environment

// Ensure the secretKey is exactly 32 bytes
if (secretKey.length < 32) {
    secretKey = secretKey.padEnd(32, '\0');
} else if (secretKey.length > 32) {
    secretKey = secretKey.substring(0, 32);
}

const ivLength = 16; // AES block size (16 bytes for CBC mode)

// Encryption function
exports.encrypt = (text) => {
    const iv = crypto.randomBytes(ivLength); // Ensure the IV is 16 bytes
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`; // Store IV with the encrypted data
};

// Decryption function
exports.decrypt = (text) => {
    const textParts = text.split(':');  // Split IV and encrypted data
    if (textParts.length !== 2) {
        throw new Error('Invalid encrypted data format');
    }
    const ivFromText = Buffer.from(textParts[0], 'hex'); // Extract IV from the first part
    const encryptedText = textParts[1]; // The encrypted text is the second part
    if (ivFromText.length !== ivLength) {
        throw new Error('Invalid IV length');
    }

    const decipher = crypto.createDecipheriv(algorithm, Buffer.from(secretKey), ivFromText);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
};