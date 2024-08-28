import {
    Body, Controller, Post,  Req,
    ValidationPipe,
} from '@nestjs/common'
import {
    ApiBody, ApiOperation, ApiTags
} from '@nestjs/swagger'
import { ReadDataDTO, ReadDataExtendedDTO } from './core.dto'
import { sanitizeIP } from 'src/shared/input-validation/shared.sanitizer'
import { ReadDataService, standardResponse } from './core.service'

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
}