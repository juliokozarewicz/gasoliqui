import { ApiProperty } from '@nestjs/swagger';
import {
    IsString, IsNotEmpty,
    IsOptional
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

