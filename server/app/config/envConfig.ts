import dotenv from 'dotenv';

dotenv.config();

export const envConfig = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT) || 5000,
  APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5000',
  DATABASE_URL: process.env.DATABASE_URL || '',
  DIRECT_URL: process.env.DIRECT_URL || '',
  JWT: {
    ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'dev-access-secret-zio-tech',
    REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-zio-tech',
    ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  COOKIE_SECRET: process.env.COOKIE_SECRET || 'dev-cookie-secret-zio-tech',
  R2: {
    ACCOUNT_ID: process.env.R2_ACCOUNT_ID || '',
    ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID || '',
    SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY || '',
    BUCKET_NAME: process.env.R2_BUCKET_NAME || 'zio-tech-grc-evidence',
    PUBLIC_DOMAIN: process.env.R2_PUBLIC_DOMAIN || '',
  },
};
