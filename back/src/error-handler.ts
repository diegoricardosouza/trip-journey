import { FastifyInstance } from "fastify";
import { hasZodFastifySchemaValidationErrors } from "fastify-type-provider-zod";
import { ZodError } from "zod";
import { ClientError } from "./errors/client-error";

type FastifyErrorHandler = FastifyInstance['errorHandler']

export const errorHandler: FastifyErrorHandler = (error, request, reply) => {
  console.log(error);

  if (hasZodFastifySchemaValidationErrors(error)) {
    return reply.status(400).send({
      message: 'Invalid input',
      errors: error.validation
    })
  }
  
  if(error instanceof ZodError) {
    return reply.status(400).send({
      message: 'Invalid input',
      errors: error.flatten().fieldErrors
    })
  }

  if(error instanceof ClientError) {
    return reply.status(400).send({
      message: error.message
    })
  }
  
  return reply.status(500).send({ message: 'Internal server error' })
}