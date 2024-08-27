import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { CoreModule } from './modules/core/core.module';

@Module({
  imports: [

    // my modules
    CoreModule,

    // database
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database.sqlite',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    } as TypeOrmModuleOptions)

  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
