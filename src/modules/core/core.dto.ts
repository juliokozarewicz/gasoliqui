import { ApiProperty } from '@nestjs/swagger';
import {
    IsString, IsNotEmpty,
    IsOptional,
    IsUUID,
    IsInt
} from 'class-validator';

export class ReadDataDTO {

  @ApiProperty({ 
    example: 'Base64 Code',
  })
  @IsString()
  @IsNotEmpty()
  image_data: string;

  @ApiProperty({ 
    example: '123456789',
  })
  @IsString()
  @IsNotEmpty()
  customer_code: string;

  @ApiProperty({ 
    example: '2024-08-27T10:57:55Z',
  })
  @IsOptional() 
  measure_datetime: Date;

  @ApiProperty({ 
    example: 'gas',
  })
  @IsString()
  @IsNotEmpty()
  measure_type: string;
}

export class ReadDataExtendedDTO extends ReadDataDTO {

    @IsString()
    @IsNotEmpty()
    readonly ip: string

}

export class ConfirmDataDTO {

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsUUID()
  measure_uuid: string;

  @ApiProperty({
    example: 123,
  })
  @IsInt()
  @IsNotEmpty()
  confirmed_value: number;

}

export class ConfirmDataExtendedDTO extends ConfirmDataDTO {

  @IsString()
  @IsNotEmpty()
  readonly ip: string

}
