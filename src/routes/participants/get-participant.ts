import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../../lib/prisma'
import { ClientError } from '../../errors/client-error'

export async function getParticipant(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().get('/participants/:paricipantId', {
        schema: {
            params: z.object({
                paricipantId: z.string().uuid()
            })
        }
    },
    async (request) => {
        const { paricipantId } = request.params

        const participant = await prisma.participant.findUnique({
            select: {
                id: true,
                name: true,
                email: true,
                is_confirmed: true
            },
            where: {
                id: paricipantId,
            }
        })

        if (!participant) {
            throw new ClientError('Participant not found.')
        }

        return {
            participant
        }
    })
}