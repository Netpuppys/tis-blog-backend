import { z } from 'zod';

const createZodCategory = z.object({
  body: z.object({
    name: z.string({
      required_error: 'Name is required',
    }),
  }),
});

const updateZodCategory = z.object({
  body: z.object({
    name: z.string({
      required_error: 'Name is required',
    }),
  }),
});

export const CategoryValidation = {
  createZodCategory,
  updateZodCategory,
};
