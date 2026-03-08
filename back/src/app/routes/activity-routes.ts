import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { ActivityController } from "../controllers/ActivityController";
import { activitySchema } from "../schemas/activitySchemas";
import { getTripDetailsSchema } from "../schemas/tripSchemas";
import { ActivitiesRepository } from "../shared/database/ActivitiesRepository";
import { TripsRepository } from "../shared/database/TripsRepository";

export async function activityRoutes(app: FastifyInstance) {
  const typed = app.withTypeProvider<ZodTypeProvider>();

  const activityRepo = new ActivitiesRepository();
  const tripRepo = new TripsRepository();
  const activityController = new ActivityController(activityRepo, tripRepo);

  typed.post(
    "/trips/:tripId/activities",
    { schema: { params: getTripDetailsSchema, body: activitySchema } },
    activityController.createActivity
  );

  typed.get(
    "/trips/:tripId/activities",
    { schema: { params: getTripDetailsSchema } },
    activityController.getActivities
  );
}