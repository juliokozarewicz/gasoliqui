import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { CoreModule } from './modules/core/core.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [

    // configs
    ConfigModule.forRoot(),

    // my modules
    CoreModule,

    // database
    TypeOrmModule.forRoot({
      type: process.env.DB_TYPE,
      database: process.env.DB_NAME,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    } as TypeOrmModuleOptions)

  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
