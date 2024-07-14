import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import nodemailer from 'nodemailer'
import { z } from 'zod'
import { dayjs } from '../lib/dayjs'
import { getMailerClient } from '../lib/mail'
import { prisma } from '../lib/prisma'

export async function confirmTrip(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().get('/trips/:tripId/confirm', {
        schema: {
            params: z.object({
                tripId: z.string().uuid()
            })
        }
    },
    async ( request, reply ) => {
        const { tripId } = request.params

        const trip = await prisma.trip.findUnique({
            where: {
                id: tripId,
            },
            include: {
                participants: {
                    where: {
                        is_owner: false,
                    }
                }
            }
        })

        if(! trip) {
            throw new Error('Trip not found.')
        }

        if(trip.is_confirmed) {
            return reply.redirect(`https://localhost:3000/trips/${tripId}`)
        }

        await prisma.trip.update({
            where: { id: tripId },
            data: { is_confirmed: true }
        })

        const formatedStartDate = dayjs(trip.starts_at).format('LL')
        const formatedEndDate = dayjs(trip.ends_at).format('LL')

        const mail = await getMailerClient()

        await Promise.all(
            trip.participants.map(async participant => {

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
            })
        )

        return reply.redirect(`https://localhost:3000/trips/${tripId}`)
    })
}