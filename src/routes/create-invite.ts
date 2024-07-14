import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import nodemailer from 'nodemailer'
import { z } from 'zod'
import { dayjs } from '../lib/dayjs'
import { getMailerClient } from '../lib/mail'
import { prisma } from '../lib/prisma'
import { ClientError } from '../errors/client-error'

export async function createInvite(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().post('/trips/:tripId/invite', {
        schema: {
            params: z.object({
                tripId: z.string().uuid()
            }),
            body: z.object({
                email: z.string().email(),
            })
        }
    },
        async (request) => {
            const { tripId } = request.params
            const { email } = request.body

            const trip = await prisma.trip.findUnique({
                where: {
                    id: tripId,
                }
            })

            if (!trip) {
                throw new ClientError('Trip not found.')
            }

            const participant = await prisma.participant.create({
                data: {
                    email,
                    trip_id: tripId
                }
            })

            const formatedStartDate = dayjs(trip.starts_at).format('LL')
            const formatedEndDate = dayjs(trip.ends_at).format('LL')

            const mail = await getMailerClient()


            const confirmationLink = `http://localhost:3333/participants/${participant.id}/confirm`

            const message = await mail.sendMail({
                from: {
                    name: "Equipe Plann.er",
                    address: "oi@plann.er"
                },
                to: participant.email,
                subject: `Confirme sua presença na viagem para ${trip.destination} em ${formatedStartDate}`,
                html: `
                    <div style="font-family: sans-serif; font-size: 16px; line-height: 1.6;">
                        <p>Você foi convidado para pariticipar de uma viagem para <strong>${trip.destination}</strong> nas datas de <strong>${formatedStartDate}</strong> a <strong>${formatedEndDate}</strong>.</p>
                        <p></p>
                        <p>Para confirmar sua viajem, clique no link abaixo:</p>
                        <p></p>
                        <p>
                            <a href="${confirmationLink}">Confirmar viajem</a>
                        </p>
                        <p></p>
                        <p> Caso você não tenha solicitado essa viajem, por favor, ignore esse e-mail.</p>
                    </div>
                `.trim()
            })
            
            console.log(nodemailer.getTestMessageUrl(message))

            return {
                participant: participant.id
            }
        })
}