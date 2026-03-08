import { FastifyReply, FastifyRequest } from "fastify";
import nodemailer from 'nodemailer';
import z from "zod";
import { env } from "../../env";
import { dayjs } from "../lib/dayjs";
import { getMailClient } from "../lib/mail";
import { createTripSchema, getTripDetailsSchema, updateTripSchema } from "../schemas/tripSchemas";
import { TripsRepository } from "../shared/database/TripsRepository";
import { ClientError } from "../shared/errors/client-error";

type TripParams = z.infer<typeof getTripDetailsSchema>;
type CreateTripBody = z.infer<typeof createTripSchema>;
type updateTripBody = z.infer<typeof updateTripSchema>;

export class TripController {
  constructor(
    private readonly tripRepo: TripsRepository,
  ) {}

  create = async (request: FastifyRequest<{ Body: CreateTripBody }>) => {
    const { destination, startsAt, endsAt, ownerName, ownerEmail, emailsToInvite } = request.body

    if(dayjs(startsAt).isBefore(new Date())) {
      throw new ClientError('Invalid trip start date')
    }

    if(dayjs(endsAt).isBefore(startsAt)) {
      throw new ClientError('Invalid trip end date')
    }

    const trip = await this.tripRepo.create({
      data: {
        destination, 
        startsAt, 
        endsAt,
        participants: {
          createMany: {
            data: [
              {
                name: ownerName,
                email: ownerEmail,
                isOwner: true,
                isConfirmed: true
              },
              ...emailsToInvite.map(email => {
                return { email }
              })
            ]
          }
        }
      }
    })
    
    const formattedStartDate = dayjs(startsAt).format('LL')
    const formattedEndDate = dayjs(endsAt).format('LL')

    const confirmationLink = `${env.API_BASE_URL}/trips/${trip.id}/confirm`;

    const mail = await getMailClient()

    const message = await mail.sendMail({
      from: {
        name: 'Equipe plann.er',
        address: 'noreply@plann.er',
      },
      to: {
        name: ownerName,
        address: ownerEmail
      },
      subject: `Confirme sua viagem para ${destination} em ${formattedStartDate}`,
      html: `
        <div style="font-family: sans-serif; font-size: 16px; line-height: 1.6; color: #333;">
          <p>Você solicitou a criação de uma viagem para <strong>${destination}</strong> nas datas de <strong>${formattedStartDate}</strong> até <strong>${formattedEndDate}</strong>.</p>
          <p></p>
          <p>Para confirmar sua viagem, clique no link abaixo:</p>
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
    
    return { tripId: trip.id }
  }

  update = async (request: FastifyRequest<{ Params: TripParams; Body: updateTripBody }>) => {
    const { tripId } = request.params
    const { destination, startsAt, endsAt } = request.body

    const trip = await this.tripRepo.findUnique({
      where: {
        id: tripId
      }
    })

    if (!trip) {
      throw new ClientError("Trip not found")
    }

    if(dayjs(startsAt).isBefore(new Date())) {
      throw new ClientError('Invalid trip start date')
    }

    if(dayjs(endsAt).isBefore(startsAt)) {
      throw new ClientError('Invalid trip end date')
    }

    await this.tripRepo.update({
      where: { id: tripId },
      data: {
        destination,
        startsAt,
        endsAt
      }
    })
    
    return { tripId: trip.id }
  }

  confirm = async(request: FastifyRequest<{ Params: TripParams }>, reply: FastifyReply) => {
    const { tripId } = request.params

    const trip = await this.tripRepo.findUnique({
      where: {
        id: tripId
      },
      include: {
        participants: {
          where: {
            isOwner: false
          }
        }
      }
    })

    if(!trip) {
      throw new ClientError("Trip not found")
    }

    if(trip.isConfirmed) {
      return reply.redirect(`${env.WEB_BASE_URL}/trips/${tripId}`)
    }

    await this.tripRepo.update({
      where: { id: tripId },
      data: { isConfirmed: true }
    })

    const formattedStartDate = dayjs(trip.startsAt).format('LL')
    const formattedEndDate = dayjs(trip.endsAt).format('LL')

    const mail = await getMailClient()

    await Promise.all(
      trip.participants.map(async (participant) => {
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
      })
    )

    return reply.redirect(`${env.WEB_BASE_URL}/trips/${tripId}`)
  }

  getTripDetails = async (request: FastifyRequest<{ Params: TripParams }>) => {
    const { tripId } = request.params

    const trip = await this.tripRepo.findUnique({
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
  }
}