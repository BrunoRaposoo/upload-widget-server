import { fastifyCors } from '@fastify/cors'
import { fastify } from 'fastify'
import {
  hasZodFastifySchemaValidationErrors,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'
import { env } from '@/env'

const server = fastify()

server.setValidatorCompiler(validatorCompiler)
server.setSerializerCompiler(serializerCompiler)

server.setErrorHandler((error, request, replay) => {
  if (hasZodFastifySchemaValidationErrors(error)) {
    return replay.status(400).send({
      message: 'Validation error',
      issue: error.validation,
    })
  }

  // Eviar erros para ferramenta de observabilidade (Sentry/Grafana/Datalog)

  console.log(error)

  return replay.status(500).send({ message: 'Internal server error.' })
})

server.register(fastifyCors, { origin: '*' })

console.log(env.DATABASE_URL)

server.listen({ port: 3333, host: '0.0.0.0' }).then(() => {
  console.log('HTTP server runnig!!')
})
