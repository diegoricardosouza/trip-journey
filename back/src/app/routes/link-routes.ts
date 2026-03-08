import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { LinkController } from "../controllers/LinkController";
import { linkSchema } from "../schemas/linkSchemas";
import { getTripDetailsSchema } from "../schemas/tripSchemas";
import { LinksRepository } from "../shared/database/LinksRepository";
import { TripsRepository } from "../shared/database/TripsRepository";

export async function linkRoutes(app: FastifyInstance) {
  const typed = app.withTypeProvider<ZodTypeProvider>();

  const linkRepo = new LinksRepository();
  const tripRepo = new TripsRepository();
  const linkController = new LinkController(linkRepo, tripRepo);

  typed.post(
    "/trips/:tripId/links",
    { schema: { params: getTripDetailsSchema, body: linkSchema } },
    linkController.createLink
  );

  typed.get(
    "/trips/:tripId/links",
    { schema: { params: getTripDetailsSchema } },
    linkController.getLinks
  );
}