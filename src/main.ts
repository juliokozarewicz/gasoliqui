import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Logs
  app.useLogger(new Logger());

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('GASOLIQUI')
    .setDescription(
      'A Gasoliqui API é uma solução robusta e eficiente para ' +
      'leitura e monitoramento de dados de consumo de água e gás. ' +
      'Projetada para atender às necessidades de empresas e sistemas ' +
      'de gestão de utilidades, a API oferece uma interface fácil ' +
      'de usar para integrar dados de consumo em tempo real em suas aplicações.'
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  
  await app.listen(3000);
}
bootstrap();
