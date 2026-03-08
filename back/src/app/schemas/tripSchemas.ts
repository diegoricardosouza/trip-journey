import z from "zod";

export const getTripDetailsSchema = z.object({ tripId: z.uuid() });

export const createTripSchema = z.object({
  destination: z.string().min(4),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date(),
  ownerName: z.string(),
  ownerEmail: z.email(),
  emailsToInvite: z.array(z.email()),
});

export const updateTripSchema = z.object({
  destination: z.string().min(4),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date(),
})