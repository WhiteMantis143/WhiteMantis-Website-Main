// Server-side environment validation helper
type Env = {
  NEXTAUTH_URL: string;
  NEXTAUTH_SECRET: string;
  WP_URL: string;
  WC_CONSUMER_KEY: string;
  WC_CONSUMER_SECRET: string;
  WP_JWT_URL?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
};

const required = [
  "NEXTAUTH_URL",
  "NEXTAUTH_SECRET",
  "WP_URL",
  "WC_CONSUMER_KEY",
  "WC_CONSUMER_SECRET",
];

// Lazy validation - only validate when accessed
function validateEnv(key: string) {
  if (required.includes(key) && !process.env[key]) {
    throw new Error(
      `Missing required environment variable: ${key}. Please add it to your .env file or deployment platform.`
    );
  }
}

// Use Proxy for lazy validation
const env = new Proxy({} as Env, {
  get(target, prop: string) {
    validateEnv(prop);

    if (prop === 'WP_URL' && process.env.WP_URL) {
      return process.env.WP_URL.replace(/\/$/, "");
    }

    return process.env[prop];
  }
});

export default env;
export { env };
