import { User } from '@prisma/client';
import bcrypt from 'bcrypt';
import config from '../../../config';
import prisma from '../../../shared/prisma';

const createUser = async (data: User): Promise<User> => {
  //hashed the user password
  data.password = await bcrypt.hash(
    data.password,
    Number(config.bycrypt_salt_rounds)
  );

  const result = await prisma.user.create({
    data,
  });
  return result;
};

export const UserService = {
  createUser,
};
