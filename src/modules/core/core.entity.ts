import {
    Entity, PrimaryGeneratedColumn, Column,
    UpdateDateColumn,
} from 'typeorm'

@Entity()
export class ReadDataEntity {

    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ type: 'varchar', length: 255, nullable: false })
    customer_code: string

    @UpdateDateColumn()
    measure_datetime: Date

    @Column({ type: 'varchar', length: 255, nullable: false })
    measure_type: string

    @Column({ type: 'int', nullable: false })
    measure_value: number;

    @Column({ type: 'varchar', length: 255, nullable: false })
    url_image: string

    @Column({ type: 'boolean', default: false, nullable: false })
    has_confirmed: boolean

}