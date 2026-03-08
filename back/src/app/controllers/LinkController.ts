import { FastifyRequest } from "fastify";
import z from "zod";
import { linkSchema } from "../schemas/linkSchemas";
import { getTripDetailsSchema } from "../schemas/tripSchemas";
import { LinksRepository } from "../shared/database/LinksRepository";
import { TripsRepository } from "../shared/database/TripsRepository";
import { ClientError } from "../shared/errors/client-error";

type TripParams = z.infer<typeof getTripDetailsSchema>;
type LinkBody = z.infer<typeof linkSchema>;

export class LinkController {
  constructor(
    private readonly linkRepo: LinksRepository,
    private readonly tripRepo: TripsRepository,
  ) {}

  createLink = async (request: FastifyRequest<{ Params: TripParams; Body: LinkBody }>) => {
    const { tripId } = request.params
    const { title, url } = request.body

    const trip = await this.tripRepo.findUnique({
      where: {
        id: tripId
      }
    })

    if (!trip) {
      throw new ClientError("Trip not found")
    }
    
    const link = await this.linkRepo.create({
      data: {
        title,
        url,
        tripId
      }
    })

    return { linkId: link.id }
  }

  getLinks = async (request: FastifyRequest<{ Params: TripParams }>) => {
    const { tripId } = request.params
    
    const trip = await this.tripRepo.findUnique({
      where: {
        id: tripId
      },
      include: { 
        links: true 
      }
    })

    if (!trip) {
      throw new ClientError("Trip not found")
    }

    return { links: trip.links }
  }
}