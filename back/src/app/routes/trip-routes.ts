import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { TripController } from "../controllers/TripController";
import { createTripSchema, getTripDetailsSchema, updateTripSchema } from "../schemas/tripSchemas";
import { TripsRepository } from "../shared/database/TripsRepository";

export async function tripRoutes(app: FastifyInstance) {
  const typed = app.withTypeProvider<ZodTypeProvider>();

  const tripRepo = new TripsRepository();
  const tripController = new TripController(tripRepo);

  typed.get(
    "/trips/:tripId",
    { schema: { params: getTripDetailsSchema } },
    tripController.getTripDetails
  );

  typed.post(
    "/trips",
    { schema: { body: createTripSchema } },
    tripController.create
  );

  typed.put(
    "/trips/:tripId",
    { schema: { params: getTripDetailsSchema, body: updateTripSchema } },
    tripController.update
  );

  typed.get(
    "/trips/:tripId/confirm",
    { schema: { params: getTripDetailsSchema } },
    tripController.confirm
  );
}