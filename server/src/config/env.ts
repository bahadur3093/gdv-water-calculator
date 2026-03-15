const required = (key: string): string => {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required env var: ${key}`);
  return val;
};

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT) || 5000,
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
  MONGODB_URI: required("MONGODB_URI"),
  JWT_SECRET: required("JWT_SECRET"),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  CLOUDINARY_CLOUD_NAME: required("CLOUDINARY_CLOUD_NAME"),
  CLOUDINARY_API_KEY: required("CLOUDINARY_API_KEY"),
  CLOUDINARY_API_SECRET: required("CLOUDINARY_API_SECRET"),
  EMAIL_FROM: process.env.EMAIL_FROM || "bills@gdvsociety.in",
  RESEND_API_KEY: required('RESEND_API_KEY'),
};
