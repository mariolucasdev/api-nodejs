import cors from "@fastify/cors"
import fastify from "fastify"
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod"
import { env } from "./env"
import { errorHandler } from "./error-handler"
import { createAvticity } from "./routes/activities/create-activity"
import { getActivities } from "./routes/activities/get-activities"
import { createLink } from "./routes/links/create-link"
import { getLinks } from "./routes/links/get-links"
import { confirmParticipant } from "./routes/participants/confirm-participant"
import { createInvite } from "./routes/participants/create-invite"
import { getParticipant } from "./routes/participants/get-participant"
import { getParticipants } from "./routes/participants/get-participants"
import { confirmTrip } from "./routes/trips/confirm-trip"
import { createTrip } from "./routes/trips/create-trip"
import { getTripDetails } from "./routes/trips/get-trip-details"
import { updateTrip } from "./routes/trips/update-trip"

const app = fastify();

app.register(cors, {
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]
})

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.setErrorHandler(errorHandler)

/* trips routes */
app.register(createTrip)
app.register(confirmTrip)
app.register(confirmParticipant)
app.register(updateTrip)
app.register(getTripDetails)

/* activities routes */
app.register(createAvticity)
app.register(getActivities)

/* links routes */
app.register(createLink)
app.register(getLinks)

/* particpants routes */
app.register(getParticipants)
app.register(getParticipant)
app.register(createInvite)

app.listen({ port: env.PORT }).then(() => {
    console.log("Server running on port 3333")
})
