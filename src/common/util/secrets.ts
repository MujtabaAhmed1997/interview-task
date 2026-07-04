import dotenv from 'dotenv';
import { Environment } from '../enums/environment.enum';

dotenv.config();

const required = (key: string): string => {
  const value = process.env[key];
  if (value === undefined || value === '') {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

const optional = (key: string, fallback: string): string => {
  const value = process.env[key];
  return value === undefined || value === '' ? fallback : value;
};

const asNumber = (value: string, key: string): number => {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    throw new Error(`Environment variable ${key} must be a number`);
  }
  return parsed;
};

export const secrets = {
  env: optional('NODE_ENV', Environment.DEVELOPMENT),
  port: asNumber(optional('PORT', '3000'), 'PORT'),
  apiPrefix: optional('API_PREFIX', '/api/v1'),
  db: {
    host: required('DB_HOST'),
    port: asNumber(optional('DB_PORT', '5432'), 'DB_PORT'),
    name: required('DB_NAME'),
    user: required('DB_USER'),
    password: required('DB_PASSWORD'),
  },
  redis: {
    host: required('REDIS_HOST'),
    port: asNumber(optional('REDIS_PORT', '6379'), 'REDIS_PORT'),
    password: optional('REDIS_PASSWORD', ''),
  },
  jwt: {
    secret: required('JWT_SECRET'),
    expiresIn: optional('JWT_EXPIRES_IN', '1d'),
  },
  bcryptSaltRounds: asNumber(optional('BCRYPT_SALT_ROUNDS', '10'), 'BCRYPT_SALT_ROUNDS'),
  admin: {
    email: required('ADMIN_EMAIL'),
    password: required('ADMIN_PASSWORD'),
    name: optional('ADMIN_NAME', 'System Admin'),
  },
  cacheTtlSeconds: asNumber(optional('CACHE_TTL_SECONDS', '60'), 'CACHE_TTL_SECONDS'),
  rateLimitStore: optional('RATE_LIMIT_STORE', 'redis'),
} as const;

export const isDevelopment = (): boolean => secrets.env === Environment.DEVELOPMENT;

export const isStaging = (): boolean => secrets.env === Environment.STAGING;

export const isProduction = (): boolean => secrets.env === Environment.PRODUCTION;

export const isTest = (): boolean => secrets.env === Environment.TEST;
