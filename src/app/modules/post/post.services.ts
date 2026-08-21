import { Post, Prisma } from '@prisma/client';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import prisma from '../../../shared/prisma';
import { postSearchableFields } from './post.constants';
import { IPostFilterRequest } from './post.interface';

const normalizeSlug = (slug: string): string => slug.trim().replace(/\/+$/, '');

const createPost = async (data: Post): Promise<Post> => {
  if (data.slug) {
    data.slug = normalizeSlug(data.slug);
  }
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

const getSinglePost = async (slug: string): Promise<Post | null> => {
  const cleanSlug = normalizeSlug(slug);
  // Match either a clean slug or one that was saved with a trailing slash
  // (legacy bad data), so already-broken posts resolve without a DB fix.
  let result = await prisma.post.findFirst({
    where: {
      OR: [{ slug: cleanSlug }, { slug: `${cleanSlug}/` }],
    },
    include: {
      category: true,
    },
  });

  // Fallback: some legacy posts have stray internal/leading/trailing
  // whitespace baked into the slug (e.g. "vm cm "). Scan and compare
  // normalized values so these still resolve instead of 404ing forever.
  //
  // IMPORTANT: this scan must stay CHEAP.
  //
  // It previously ran `findMany({ include: { category: true } })`, which
  // loaded every post -- including each post's full `content` HTML -- and
  // every category into memory on EVERY slug miss. Because /:slug is a
  // public endpoint, each 404 dumped the whole database. Vulnerability
  // scanners probing /api/v1/post/.env, /wp-login.php, /graphql etc.
  // generated hundreds of those a day, each running until the 15s Vercel
  // timeout. That was ~50% of all function duration and the bulk of the
  // Fast Origin Transfer bill.
  //
  // Now we select only { id, slug } -- kilobytes rather than megabytes --
  // and re-fetch just the one matching post in full. Same behaviour,
  // bounded cost.
  if (!result) {
    const candidates = await prisma.post.findMany({
      select: { id: true, slug: true },
    });

    const match = candidates.find(
      post => normalizeSlug(post.slug) === cleanSlug
    );

    result = match
      ? await prisma.post.findUnique({
          where: { id: match.id },
          include: { category: true },
        })
      : null;
  }

  return result;
};

const updatePost = async (
  id: string,
  payload: Partial<Post>
): Promise<Post> => {
  if (payload.slug) {
    payload.slug = normalizeSlug(payload.slug);
  }
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
