import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ReadDataEntity } from './core.entity'
import { CoreController } from './core.controller'
import { ReadDataService } from './core.service'

@Module({
    imports: [

        // TypeORM (database)
        TypeOrmModule.forFeature([
            ReadDataEntity,
        ]),

    ],
    controllers: [CoreController],
    providers: [ReadDataService],
    exports: [ReadDataService],
})
export class CoreModule {}