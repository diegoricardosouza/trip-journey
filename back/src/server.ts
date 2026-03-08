import cors from "@fastify/cors";
import fastify from "fastify";
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import { activityRoutes } from "./app/routes/activity-routes";
import { linkRoutes } from "./app/routes/link-routes";
import { participantRoutes } from "./app/routes/participant-routes";
import { tripRoutes } from "./app/routes/trip-routes";
import { env } from "./env";
import { errorHandler } from "./error-handler";

const app = fastify()

app.register(cors, {
  origin: '*'
})

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)
app.setErrorHandler(errorHandler)

app.register(tripRoutes)
app.register(participantRoutes)
app.register(activityRoutes)
app.register(linkRoutes)

app.listen({ port: env.PORT }).then(() => {
  console.log('Server running 🔥🔥🔥!');
})
