import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { dayjs } from "../lib/dayjs";
import { prisma } from "../lib/prisma";

export async function getActivities(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get('/trips/:tripId/activities', {
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
      include: { 
        activities: {
          orderBy: {
            occursAt: 'asc'
          }
        } 
      }
    })

    if (!trip) {
      throw new Error("Trip not found")
    }

    const differenceInDaysBettwenTripStartAndEnd = dayjs(trip.endsAt).diff(trip.startsAt, 'days')

    const activities = Array.from({ length: differenceInDaysBettwenTripStartAndEnd  + 1}).map((_, index) => {
      const date = dayjs(trip.startsAt).add(index, 'days')

      return {
        date: date.toDate(),
        activities: trip.activities.filter(activity => {
          return dayjs(activity.occursAt).isSame(date, 'day')
        })
      }
    })

    return { activities }
  })
}