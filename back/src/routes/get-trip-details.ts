import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { ClientError } from "../errors/client-error";
import { prisma } from "../lib/prisma";

export async function getTripDetails(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get('/trips/:tripId', {
    schema: {
      params: z.object({
        tripId: z.uuid()
      })
    }
  } , async (request) => {
    const { tripId } = request.params

    const trip = await prisma.trip.findUnique({
      where: {
        id: tripId
      },
      select: {
        id: true,
        destination: true,
        startsAt: true,
        endsAt: true,
        isConfirmed: true
      }
    })

    if (!trip) {
      throw new ClientError("Trip not found")
    }

    return { trip }
  })
}