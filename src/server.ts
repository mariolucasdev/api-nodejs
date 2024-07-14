import cors from "@fastify/cors"
import fastify from "fastify"
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod"
import { confirmParticipant } from "./routes/confirm-participant"
import { confirmTrip } from "./routes/confirm-trip"
import { createAvticity } from "./routes/create-activity"
import { createLink } from "./routes/create-link"
import { createTrip } from "./routes/create-trip"
import { getActivities } from "./routes/get-activities"
import { getLinks } from "./routes/get-links"
import { getParticipants } from "./routes/get-participants"
import { createInvite } from "./routes/create-invite"
import { updateTrip } from "./routes/update-trip"

const app = fastify();

app.register(cors, {
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]
})

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

/* trips routes */
app.register(createTrip)
app.register(confirmTrip)
app.register(confirmParticipant)
app.register(updateTrip)

/* activities routes */
app.register(createAvticity)
app.register(getActivities)

/* links routes */
app.register(createLink)
app.register(getLinks)

/* particpants routes */
app.register(getParticipants)
app.register(createInvite)

app.listen({ port: 3333}).then(() => {
    console.log("Server running on port 3333")
})
