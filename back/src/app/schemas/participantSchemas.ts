import z from "zod";

export const participantIdSchema = z.object({ participantId: z.uuid() });

export const enviteSchema = z.object({
  email: z.email()
})