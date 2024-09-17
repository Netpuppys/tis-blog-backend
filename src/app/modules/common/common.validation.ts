import { z } from "zod";

const fileUpload = z.object({
  body: z.strictObject({
    file: z.any(),
    key: z.string(),
  }),
});

export const commonValidator = { fileUpload };
