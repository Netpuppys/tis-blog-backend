import { Post, Prisma } from '@prisma/client';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import prisma from '../../../shared/prisma';
import { postSearchableFields } from './post.constants';
import { IPostFilterRequest } from './post.interface';

const createPost = async (data: Post): Promise<Post> => {
  const result = await prisma.post.create({
    data,
  });
  return result;
};

const getAllPost = async (
  filters: IPostFilterRequest,
  options: IPaginationOptions
): Promise<IGenericResponse<Post[]>> => {
  const { page, limit, skip } = paginationHelpers.calculatePagination(options);
  const { searchTerm } = filters;

  const andConditons = [];

  if (searchTerm) {
    andConditons.push({
      OR: postSearchableFields.map(field => ({
        [field]: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      })),
    });
  }

  const whereConditons: Prisma.PostWhereInput =
    andConditons.length > 0 ? { AND: andConditons } : {};

  const result = await prisma.post.findMany({
    skip,
    take: limit,
    where: whereConditons,
    orderBy:
      options.sortBy && options.sortOrder
        ? {
            [options.sortBy]: options.sortOrder,
          }
        : {
            created_at: 'desc',
          },
    include: {
      category: true,
    },
  });
  const total = await prisma.post.count({
    where: whereConditons,
  });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

const getSinglePost = async (id: string): Promise<Post | null> => {
  const result = await prisma.post.findUnique({
    where: {
      id,
    },
    include: {
      category: true,
    },
  });
  return result;
};

const updatePost = async (
  id: string,
  payload: Partial<Post>
): Promise<Post> => {
  const result = await prisma.post.update({
    where: {
      id,
    },
    data: payload,
  });
  return result;
};

const deletePost = async (id: string): Promise<Post> => {
  const result = await prisma.post.delete({
    where: {
      id,
    },
  });
  return result;
};

export const PostService = {
  createPost,
  getAllPost,
  getSinglePost,
  updatePost,
  deletePost,
};

