import bcrypt from 'bcrypt';
import httpStatus from 'http-status';
import { JwtPayload, Secret } from 'jsonwebtoken';
import config from '../../../config';
import ApiError from '../../../errors/ApiError';
import { jwtHelpers } from '../../../helpers/jwtHelpers';
import prisma from '../../../shared/prisma';
import {
  IChangePassword,
  ILoginUser,
  ILoginUserResponse,
  IRefreshTokenResponse,
} from './auth.interface';
import { isPasswordMatched } from './auth.utils';

const loginUser = async (payload: ILoginUser): Promise<ILoginUserResponse> => {
  const { email: userEmail, password } = payload;

  //check user exists
  const checkUserExist = await prisma.user.findFirst({
    where: {
      email: userEmail,
    },
  });

  if (!checkUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User does not exists');
  }
  //match password
  const isPasswordMatchedHere = await isPasswordMatched(
    password,
    checkUserExist.password
  );

  if (!isPasswordMatchedHere) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Password is incorrect');
  }

  const { name, email, role } = checkUserExist;

  //access token
  const accessToken = jwtHelpers.createToken(
    { name, email, role },
    config.jwt.secret as Secret,
    { expiresIn: config.jwt.expires_in }
  );

  //refresh token
  const refreshToken = jwtHelpers.createToken(
    { name, email, role },
    config.jwt.refresh_secret as Secret,
    { expiresIn: config.jwt.refresh_expires_in }
  );

  return {
    accessToken,
    refreshToken,
  };
};

const refreshToken = async (token: string): Promise<IRefreshTokenResponse> => {
  //verify token
  let verifiedToken = null;
  try {
    verifiedToken = jwtHelpers.verifyToken(
      token,
      config.jwt.refresh_secret as Secret
    );
    //in verifiedToken, we get user id, role, timestamps
  } catch (error) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Invalid refresh token');
  }
  const { email } = verifiedToken;
  //checking deleted user using refresh token
  //check user exists
  const checkUserExist = await prisma.user.findFirst({
    where: {
      email,
    },
  });

  if (!checkUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User does not exists');
  }

  //generate new token
  const accessToken = jwtHelpers.createToken(
    {
      name: checkUserExist?.name,
      number: checkUserExist?.email,
      role: checkUserExist?.role,
    },
    config.jwt.secret as Secret,
    { expiresIn: config.jwt.expires_in }
  );

  return {
    accessToken,
  };
};

const changePassword = async (
  user: JwtPayload | null,
  payload: IChangePassword
): Promise<string> => {
  const { email: userEmail, oldPassword, newPassword } = payload;

  const checkUserExist = await prisma.user.findFirst({
    where: {
      email: userEmail,
    },
  });

  if (!checkUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User does not exist');
  }

  const isPasswordMatchedHere = await isPasswordMatched(
    oldPassword,
    checkUserExist.password
  );

  if (!isPasswordMatchedHere) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Old password is incorrect');
  }

  const newHashedPassword = await bcrypt.hash(
    newPassword,
    Number(config.bycrypt_salt_rounds)
  );

  // Update password
  await prisma.user.update({
    where: {
      id: checkUserExist.id,
    },
    data: {
      password: newHashedPassword,
    },
  });

  return 'Password changed successfully';
};

export const AuthService = {
  loginUser,
  refreshToken,
  changePassword,
};
