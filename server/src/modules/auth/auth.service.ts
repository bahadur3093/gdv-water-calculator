import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../users/user.model";
import { env } from "../../config/env";
import { ApiError } from "../../utils/ApiError";

export const login = async (email: string, password: string) => {
  if (!email || !password)
    throw new ApiError(400, "Email and password are required");

  const user = await User.findOne({ email, isActive: true }).select(
    "+password",
  );
  if (!user) throw new ApiError(401, "Invalid credentials");

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new ApiError(401, "Invalid credentials");

  const token = jwt.sign(
    { id: user._id, role: user.role, villaId: user.villaId?.toString() },
    env.JWT_SECRET as string,
    { expiresIn: env.JWT_EXPIRES_IN as any },
  );

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      villaId: user.villaId,
    },
  };
};

export const getMe = async (userId: string) => {
  const user = await User.findById(userId).populate(
    "villaId",
    "villaNumber address",
  );
  if (!user) throw new ApiError(404, "User not found");
  return user;
};

export const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string,
) => {
  const user = await User.findById(userId).select("+password");
  if (!user) throw new ApiError(404, "User not found");
  const match = await bcrypt.compare(currentPassword, user.password);
  if (!match) throw new ApiError(400, "Current password is incorrect");
  user.password = newPassword; // pre-save hook will hash it
  await user.save();
};
