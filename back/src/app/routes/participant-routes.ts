import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { ParticipantController } from "../controllers/ParticipantController";
import { enviteSchema, participantIdSchema } from "../schemas/participantSchemas";
import { getTripDetailsSchema } from "../schemas/tripSchemas";
import { ParticipantsRepository } from "../shared/database/ParticipantsRepository";
import { TripsRepository } from "../shared/database/TripsRepository";

export async function participantRoutes(app: FastifyInstance) {
  const typed = app.withTypeProvider<ZodTypeProvider>();

  const tripRepo = new TripsRepository();
  const participantRepo = new ParticipantsRepository();
  const participantController = new ParticipantController(participantRepo, tripRepo);

  typed.get(
    "/participants/:participantId",
    { schema: { params: participantIdSchema } },
    participantController.getParticipant
  );

  typed.get(
    "/trips/:tripId/participants",
    { schema: { params: getTripDetailsSchema } },
    participantController.getParticipants
  );

  typed.post(
    "/trips/:tripId/invites",
    { schema: { params: getTripDetailsSchema, body: enviteSchema } },
    participantController.invite
  );

  typed.get(
    "/participants/:participantId/confirm",
    { schema: { params: participantIdSchema } },
    participantController.confirmParticipant
  );
}