import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export const signToken = (payload: object): string => {
  return jwt.sign(payload, env.JWT_SECRET as string, { expiresIn: env.JWT_EXPIRES_IN as any });
};

export const verifyToken = <T>(token: string): T => {
  return jwt.verify(token, env.JWT_SECRET) as T;
};
