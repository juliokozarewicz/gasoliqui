import {
    Body, Controller, Get, Param, Patch, Post,  Query,  Req,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common'
import {
    ApiBody, ApiOperation, ApiParam, ApiQuery, ApiTags
} from '@nestjs/swagger'
import { ConfirmDataDTO, ConfirmDataExtendedDTO, GetDataDTO, ReadDataDTO, ReadDataExtendedDTO } from './core.dto'
import { sanitizeIP } from 'src/shared/input-validation/shared.sanitizer'
import { allowedTypes, ReadDataService, standardResponse } from './core.service'

@Controller('api') 
@ApiTags('CORE') // Docs
export class CoreController {
    constructor(
        private readonly readDataService: ReadDataService,
    ) {}

    // upload image
    @Post('upload')
    @ApiBody({ type: ReadDataDTO })
    @ApiOperation({
        summary: 'Image Measurement',
        description: (
            'Responsible for receiving an image in base64 format, ' +
            'querying Gemini, and returning the measurement read by the API.'
        )
    })
    async uploadImage(
        @Req() req: any,
        @Body(new ValidationPipe({ transform: true })) readDataDto: ReadDataDTO
    ): Promise<standardResponse> {

        const ip = sanitizeIP(`${req.ip}`)
        const readDataExtendedDTO: ReadDataExtendedDTO = {
            ...readDataDto,
            ip
        }
        return await this.readDataService.uploadImage(readDataExtendedDTO)

    }

    // confirm data
    @Patch('confirm')
    @ApiBody({ type: ConfirmDataDTO })
    @ApiOperation({
        summary: 'Image Measurement',
        description: (
            'Responsible for receiving an image in base64 format, ' +
            'querying Gemini, and returning the measurement read by the API.'
        )
    })
    async confirmData(
        @Req() req: any,
        @Body(new ValidationPipe({ transform: true })) confirmDataDTO: ConfirmDataDTO
    ): Promise<standardResponse> {

        const ip = sanitizeIP(`${req.ip}`)
        const confirmDataExtendedDTO: ConfirmDataExtendedDTO = {
            ...confirmDataDTO,
            ip
        }
        return await this.readDataService.confirmData(confirmDataExtendedDTO)

    }

    // read measure
    @Get(':customerCode/list')
    @ApiOperation({
        summary: 'Get Customer Data',
        description: (
            'Retrieves detailed information about a specific customer. ' +
            'By providing the unique customer identifier, you will ' +
            'receive all data associated with that customer.'
        )
    })
    @ApiParam({
        name: 'customerCode',
        required: true,
        description: 'Client code to get the information.'
    })
    @ApiQuery({
        name: 'measure_type',
        required: false,
        description: 'Field to filter by measurement type (e.g., gas).',
        enum: allowedTypes
    })
    async readData(
        @Req() req: any,
        @Param('customerCode') customerCode: string,
        @Query('measure_type') measure_type: string,
    ): Promise<any> {

        const ip:string = sanitizeIP(`${req.ip}`)
        const getData: GetDataDTO = {
            customerCode,
            measure_type,
            ip
        }
        return await this.readDataService.readData(getData)

    }    
}