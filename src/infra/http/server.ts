import { fastifyCors } from '@fastify/cors'
import fastifyMultipart from '@fastify/multipart'
import fastifySwagger from '@fastify/swagger'
import { fastify } from 'fastify'
import {
  hasZodFastifySchemaValidationErrors,
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'
import { uploadImageRoute } from './routes/upload-image'
import fastifySwaggerUi from '@fastify/swagger-ui'

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

server.register(fastifyMultipart)
server.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Upload Server',
      version: '1.0.0',
    }
  },

  transform: jsonSchemaTransform,
})

server.register(fastifySwaggerUi, {
  routePrefix: '/docs'
})

server.register(uploadImageRoute)

server.listen({ port: 3333, host: '0.0.0.0' }).then(() => {
  console.log('HTTP server runnig!!')
})
