import z from "zod";

export const activitySchema = z.object({
  title: z.string().min(4),
  occursAt: z.coerce.date()
})
