import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { Logger } from '@nestjs/common'
import * as express from 'express'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // CORS
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Authorization',
  });

  // larger size per request
  app.use(express.json({ limit: '50mb' }))

  // Logs
  app.useLogger(new Logger())

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('GASOLIQUI')
    .setDescription(
      'The Gasoliqui API is a robust and efficient solution for reading and monitoring ' +
      'water and gas consumption data. Designed to meet the needs of businesses and ' +
      'utility management systems, the API offers an easy-to-use interface for ' +
      'integrating real-time consumption data into your applications.'
    )
    .setVersion('1.0')
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api/docs', app, document)
  
  await app.listen(3000)
}
bootstrap()
