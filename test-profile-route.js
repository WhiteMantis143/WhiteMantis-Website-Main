// Test script for profile GET route
// Run with: node test-profile-route.js

const crypto = require('crypto');

// Your encryption key from .env.local
const ENCRYPTION_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;

function encrypt(payload) {
    const KEY = Buffer.from(ENCRYPTION_KEY, 'hex');
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);

    const encrypted = Buffer.concat([
        cipher.update(JSON.stringify(payload), 'utf8'),
        cipher.final(),
    ]);

    const tag = cipher.getAuthTag();
    return Buffer.concat([iv, tag, encrypted]).toString('base64');
}

// Test email
const testEmail = 'test@example.com'; // Change this to your test email

// Encrypt the email
const encryptedEmail = encrypt({ email: testEmail });

console.log('=== Profile Route Test ===\n');
console.log('Test Email:', testEmail);
console.log('\nEncrypted Email Token:');
console.log(encryptedEmail);
console.log('\n=== Test URLs ===\n');
console.log('Local:');
console.log(`http://localhost:3000/api/website/profile/get?email=${encodeURIComponent(encryptedEmail)}`);
console.log('\nProduction (replace with your Vercel URL):');
console.log(`https://your-app.vercel.app/api/website/profile/get?email=${encodeURIComponent(encryptedEmail)}`);
console.log('\n=== cURL Command ===\n');
console.log(`curl "http://localhost:3000/api/website/profile/get?email=${encodeURIComponent(encryptedEmail)}"`);
