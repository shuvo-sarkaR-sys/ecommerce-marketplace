import { User, type IUser } from "../models/User";
import crypto from "node:crypto";
import { hashPassword, verifyPassword } from "../utils/password";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt";
import { ApiError } from "../utils/http";
import type {
  RegisterInput,
  LoginInput,
  AdminRegisterInput,
} from "../validators/auth.validators";

function toPublicUser(user: IUser) {
  return { id: user._id, name: user.name, email: user.email, role: user.role };
}

export async function registerUser(input: RegisterInput) {
  const existing = await User.findOne({ email: input.email });
  if (existing) throw new ApiError("Email already registered", 409);

  const passwordHash = await hashPassword(input.password);
  const user = await User.create({
    name: input.name,
    email: input.email,
    phone: input.phone,
    passwordHash,
    role: "customer",
  });

  const accessToken = signAccessToken({ sub: user._id.toString(), role: user.role });
  const refreshToken = signRefreshToken({
    sub: user._id.toString(),
    tokenVersion: user.refreshTokenVersion,
  });

  return { user: toPublicUser(user), accessToken, refreshToken };
}

export async function registerAdminUser(input: AdminRegisterInput) {
  const setupKey = process.env.ADMIN_SETUP_KEY;
  if (!setupKey || input.setupKey !== setupKey) {
    throw new ApiError("Invalid admin setup key", 403);
  }

  const existing = await User.findOne({ email: input.email });
  if (existing) throw new ApiError("Email already registered", 409);

  const passwordHash = await hashPassword(input.password);
  const user = await User.create({
    name: input.name,
    email: input.email,
    passwordHash,
    role: "admin",
    emailVerified: true,
  });

  const accessToken = signAccessToken({ sub: user._id.toString(), role: user.role });
  const refreshToken = signRefreshToken({
    sub: user._id.toString(),
    tokenVersion: user.refreshTokenVersion,
  });

  return { user: toPublicUser(user), accessToken, refreshToken };
}

export async function loginUser(input: LoginInput) {
  const user = await User.findOne({ email: input.email }).select("+passwordHash");
  if (!user) throw new ApiError("Invalid email or password", 401);

  const valid = await verifyPassword(input.password, user.passwordHash);
  if (!valid) throw new ApiError("Invalid email or password", 401);

  const accessToken = signAccessToken({ sub: user._id.toString(), role: user.role });
  const refreshToken = signRefreshToken({
    sub: user._id.toString(),
    tokenVersion: user.refreshTokenVersion,
  });

  return { user: toPublicUser(user), accessToken, refreshToken };
}

export async function loginWithGoogle(input: { email: string; name: string }) {
  let user = await User.findOne({ email: input.email });

  if (!user) {
    user = await User.create({
      name: input.name,
      email: input.email,
      passwordHash: await hashPassword(crypto.randomBytes(32).toString("hex")),
      role: "customer",
      emailVerified: true,
    });
  }

  const accessToken = signAccessToken({ sub: user._id.toString(), role: user.role });
  const refreshToken = signRefreshToken({
    sub: user._id.toString(),
    tokenVersion: user.refreshTokenVersion,
  });

  return { user: toPublicUser(user), accessToken, refreshToken };
}

export async function rotateSession(refreshToken: string) {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new ApiError("Invalid or expired session", 401);
  }

  const user = await User.findById(payload.sub);
  // tokenVersion mismatch means this refresh token was rotated out already,
  // or the user logged out everywhere -- reject even though the JWT is valid.
  if (!user || user.refreshTokenVersion !== payload.tokenVersion) {
    throw new ApiError("Invalid or expired session", 401);
  }

  const accessToken = signAccessToken({ sub: user._id.toString(), role: user.role });
  const newRefreshToken = signRefreshToken({
    sub: user._id.toString(),
    tokenVersion: user.refreshTokenVersion,
  });

  return { accessToken, refreshToken: newRefreshToken };
}

export async function getCurrentUser(userId: string) {
  const user = await User.findById(userId);
  if (!user) throw new ApiError("Not authenticated", 401);
  return toPublicUser(user);
}
