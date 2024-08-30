import {
    Body, Controller, Get, Param, Patch, Post,  Query,  Req,
    ValidationPipe,
} from '@nestjs/common'
import {
    ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags
} from '@nestjs/swagger'
import {
    ConfirmDataDTO, ConfirmDataExtendedDTO, GetDataDTO,
    ReadDataDTO, ReadDataExtendedDTO
} from './core.dto'
import { sanitizeIP } from '../../shared/input-validation/shared.sanitizer'
import {
    allowedTypes, ReadDataService, standardResponse, getData
} from './core.service'

@Controller('api') 
@ApiTags('CORE') // Docs
export class CoreController {
    constructor(
        private readonly readDataService: ReadDataService,
    ) {}

    // upload image
    @Post('upload')
    @ApiResponse({
        status: 200,
        schema: {
            properties: {
                success: { type: 'boolean' },
                statusCode: { type: 'number' },
                message: { type: 'string' },
                measure_value: { type: 'integer' },
                measure_uuid: { type: 'string' },
                _links: {
                    properties: {
                        image_url: { properties: { href: { type: 'string' } } },
                        self: { properties: { href: { type: 'string' } } },
                        next: { properties: { href: { type: 'string' } } },
                        prev: { properties: { href: { type: 'string' } } },
                    }
                }
            }
        }
    })
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
    @ApiResponse({
        status: 200,
        schema: {
            properties: {
                success: { type: 'boolean' },
                statusCode: { type: 'number' },
                message: { type: 'string' },
                measure_value: { type: 'integer' },
                measure_uuid: { type: 'string' },
                _links: {
                    properties: {
                        image_url: { properties: { href: { type: 'string' } } },
                        self: { properties: { href: { type: 'string' } } },
                        next: { properties: { href: { type: 'string' } } },
                        prev: { properties: { href: { type: 'string' } } },
                    }
                }
            }
        }
    })
    @ApiBody({ type: ConfirmDataDTO })
    @ApiOperation({
        summary: 'Data Confirmation',
        description: (
            'Responsible for verifying the data read by the AI..'
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
    @ApiResponse({
        status: 200,
        description: 'Successful response',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                statusCode: { type: 'number' },
                message: { type: 'string' },
                measure_value: { type: 'integer' },
                measure_uuid: { type: 'string' },
                _links: {
                    type: 'object',
                    properties: {
                        image_url: { type: 'object', properties: { href: { type: 'string' } } },
                        self: { type: 'object', properties: { href: { type: 'string' } } },
                        next: { type: 'object', properties: { href: { type: 'string' } } },
                        prev: { type: 'object', properties: { href: { type: 'string' } } },
                    }
                }
            }
        }
    })
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
        description: 'Field to filter by measurement type (e.g., GAS).',
        enum: allowedTypes.map(str => str.toUpperCase())
    })
    async readData(
        @Req() req: any,
        @Param('customerCode') customerCode: string,
        @Query('measure_type') measure_type: string,
    ): Promise<getData> {

        const ip:string = sanitizeIP(`${req.ip}`)
        const getData: GetDataDTO = {
            customerCode,
            measure_type,
            ip
        }
        return await this.readDataService.readData(getData)

    }
}