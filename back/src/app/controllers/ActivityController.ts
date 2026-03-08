import { FastifyRequest } from "fastify";
import z from "zod";
import { dayjs } from "../lib/dayjs";
import { activitySchema } from "../schemas/activitySchemas";
import { getTripDetailsSchema } from "../schemas/tripSchemas";
import { ActivitiesRepository } from "../shared/database/ActivitiesRepository";
import { TripsRepository } from "../shared/database/TripsRepository";
import { ClientError } from "../shared/errors/client-error";

type TripParams = z.infer<typeof getTripDetailsSchema>;
type ActivityBody = z.infer<typeof activitySchema>;

export class ActivityController {
  constructor(
    private readonly activityRepo: ActivitiesRepository,
    private readonly tripRepo: TripsRepository,
  ) {}

  createActivity = async (request: FastifyRequest<{ Params: TripParams; Body: ActivityBody }>) => {
    const { tripId } = request.params
    const { title, occursAt } = request.body

    const trip = await this.tripRepo.findUnique({
      where: {
        id: tripId
      }
    })

    if (!trip) {
      throw new ClientError("Trip not found")
    }

    if(dayjs(occursAt).isBefore(trip.startsAt)) {
      throw new ClientError('Invalid activity date.')
    }

    if(dayjs(occursAt).isAfter(trip.endsAt)) {
      throw new ClientError('Invalid activity date.')
    }
    
    const activity = await this.activityRepo.create({
      data: {
        title,
        occursAt,
        tripId
      }
    })

    return { activityId: activity.id }
  }

  getActivities = async (request: FastifyRequest<{ Params: TripParams }>) => {
    const { tripId } = request.params

    const trip = await this.tripRepo.findUnique({
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
      throw new ClientError("Trip not found")
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
  }
}