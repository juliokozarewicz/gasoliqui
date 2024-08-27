import {
    Entity, PrimaryGeneratedColumn, Column,
    CreateDateColumn, UpdateDateColumn,
    Unique,
} from 'typeorm'

@Entity()
export class ReadDataEntity {

    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ type: 'varchar', length: 255, nullable: false })
    image_data: string

    @Column({ type: 'varchar', length: 255, nullable: false })
    customer_code: string

    @UpdateDateColumn()
    measure_datetime: Date

    @Column({ type: 'varchar', length: 255, nullable: false })
    measure_type: string

}