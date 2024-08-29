import { MiddlewareConsumer, Module } from '@nestjs/common'
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm'
import { CoreModule } from './modules/core/core.module'
import { ConfigModule } from '@nestjs/config'
import { ServeStaticModule } from '@nestjs/serve-static'
import { join } from 'path'

@Module({
  imports: [

    // configs
    ConfigModule.forRoot(),

    // static files
    ServeStaticModule.forRoot({
      rootPath: join('./src/staticfiles'),
      serveRoot: '/staticfiles',
    }),

    // my modules
    CoreModule,

    // database
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: './app/database.sqlite',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    } as TypeOrmModuleOptions)

  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
