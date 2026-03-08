import z from "zod";

export const linkSchema = z.object({
  title: z.string().min(4),
  url: z.url()
})
