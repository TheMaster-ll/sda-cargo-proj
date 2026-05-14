require('dotenv').config();

const requiredVars = [
  'PORT',
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
  'CLIENT_URL'
];

function validateEnv() {
  const missing = requiredVars.filter((v) => !process.env[v]);
  if (missing.length > 0) {
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }
}

module.exports = { validateEnv };
