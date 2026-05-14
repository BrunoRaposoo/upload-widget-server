import { jsonSchemaTransform } from 'fastify-type-provider-zod'

type TransformSwaggerSchemaData = Parameters<typeof jsonSchemaTransform>[0]

interface SwaggerBody {
  type: string
  required: string[]
  properties: Record<string, { type: string; format?: string }>
}

export function transformSwaggerSchema(data: TransformSwaggerSchemaData) {
  const { schema, url } = jsonSchemaTransform(data)

  if (schema.consumes?.includes('multipart/form-data')) {
    if (!schema.body) {
      schema.body = {
        type: 'object',
        required: [],
        properties: {},
      } satisfies SwaggerBody
    }

    const body = schema.body as SwaggerBody
    body.properties.file = {
      type: 'string',
      format: 'binary',
    }
    body.required.push('file')
  }

  return { schema, url }
}
