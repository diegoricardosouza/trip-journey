import { FastifyReply, FastifyRequest } from "fastify";
import nodemailer from 'nodemailer';
import { env } from "process";
import z from "zod";
import { dayjs } from "../lib/dayjs";
import { getMailClient } from "../lib/mail";
import { enviteSchema, participantIdSchema } from "../schemas/participantSchemas";
import { getTripDetailsSchema } from "../schemas/tripSchemas";
import { ParticipantsRepository } from "../shared/database/ParticipantsRepository";
import { TripsRepository } from "../shared/database/TripsRepository";
import { ClientError } from "../shared/errors/client-error";

type ParticipantParams = z.infer<typeof participantIdSchema>;
type TripParams = z.infer<typeof getTripDetailsSchema>;
type InviteTripBody = z.infer<typeof enviteSchema>;

export class ParticipantController {
  constructor(
    private readonly participantRepo: ParticipantsRepository,
    private readonly tripRepo: TripsRepository,
  ) {}

  getParticipant = async (request: FastifyRequest<{ Params: ParticipantParams; }>) => {
    const { participantId } = request.params

    const participant = await this.participantRepo.findUnique({
      where: {
        id: participantId
      },
      select: {
        id: true,
        name: true,
        email: true,
        isConfirmed: true
      }
    })

    if (!participant) {
      throw new ClientError("Participant not found")
    }

    return { participant }
  }

  getParticipants = async (request: FastifyRequest<{ Params: TripParams; }>) => {
    const { tripId } = request.params

    const trip = await this.tripRepo.findUnique({
      where: {
        id: tripId
      },
      include: { 
        participants: {
          select: {
            id: true,
            name: true,
            email: true,
            isConfirmed: true
          }
        } 
      }
    })

    if (!trip) {
      throw new ClientError("Trip not found")
    }

    return { participants: trip.participants }
  }

  invite = async (request: FastifyRequest<{ Params: TripParams; Body: InviteTripBody }>) => {
    const { tripId } = request.params
    const { email } = request.body

    const trip = await this.tripRepo.findUnique({
      where: {
        id: tripId
      }
    })

    if (!trip) {
      throw new ClientError("Trip not found")
    }
    
    const participant = await this.participantRepo.create({
      data: {
        email,
        tripId
      }
    })

    const formattedStartDate = dayjs(trip.startsAt).format('LL')
    const formattedEndDate = dayjs(trip.endsAt).format('LL')

    const mail = await getMailClient()

    const confirmationLink = `${env.API_BASE_URL}/participants/${participant.id}/confirm`;

    const message = await mail.sendMail({
      from: {
        name: 'Equipe plann.er',
        address: 'noreply@plann.er',
      },
      to: participant.email,
      subject: `Confirme sua presença na viagem para ${trip.destination} em ${formattedStartDate}`,
      html: `
        <div style="font-family: sans-serif; font-size: 16px; line-height: 1.6; color: #333;">
          <p>Você foi convidado(a) para participar de uma viagem para <strong>${trip.destination}</strong> nas datas de <strong>${formattedStartDate}</strong> até <strong>${formattedEndDate}</strong>.</p>
          <p></p>
          <p>Para confirmar sua presença na viagem, clique no link abaixo:</p>
          <p></p>
          <p>
            <a href="${confirmationLink}">Confirmar viagem</a>
          </p>
          <p></p>
          <p>Caso você não saiba do que se trata esse e-mail, apenas ignore esse e-mail.</p>
        </div>
      `.trim()
    })

    console.log(nodemailer.getTestMessageUrl(message))

    return { participantId: participant.id }
  }

  confirmParticipant = async (request: FastifyRequest<{ Params: ParticipantParams; }>, reply: FastifyReply) => {
    const { participantId } = request.params

    const participant = await this.participantRepo.findUnique({
      where: {
        id: participantId
      }
    })

    if (!participant) {
      throw new ClientError("Participant not found")
    }

    if(participant.isConfirmed) {
      return reply.redirect(`${env.WEB_BASE_URL}/trips/${participant.tripId}`)
    }

    await this.participantRepo.update({
      where: { id: participantId },
      data: { isConfirmed: true }
    })

    return reply.redirect(`${env.WEB_BASE_URL}/trips/${participant.tripId}`)
  }
}