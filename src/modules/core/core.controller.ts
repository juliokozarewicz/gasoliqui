import {
    Body,
    Controller,
    Post,
    Req,
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

    // create user
    @Post('upload')
    @ApiBody({ type: ReadDataDTO })
    @ApiOperation({
        summary: 'Medição de Imagem',
        description: (
            'Responsável por receber uma imagem em base 64, '+
            'consultar o Gemini e retornar a medida lida pela API'
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