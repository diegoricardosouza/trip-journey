import z from "zod";

const envSchema = z.object({
  DATABASE_URL: z.url(),
  API_BASE_URL: z.url(),
  WEB_BASE_URL: z.url(),
  PORT: z.coerce.number().default(3333),
  SMTP_HOST: z.string(),
  SMTP_USER: z.string(),
  SMTP_PASS: z.string(),
  SMTP_PORT: z.coerce.number().default(587)
})

export const env = envSchema.parse(process.env)