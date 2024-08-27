import {
    BadRequestException, ConflictException, Injectable,
    InternalServerErrorException,
    NotFoundException, UnauthorizedException
} from "@nestjs/common"
import { ReadDataEntity } from "./core.entity"
import { InjectRepository } from "@nestjs/typeorm"
import { IntegerType, Repository } from "typeorm"
import { ReadDataExtendedDTO } from "./core.dto"
import { logsGenerator } from "app.logs"
import { GoogleAIFileManager } from "@google/generative-ai/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { v4 as uuidv4 } from 'uuid'
import * as fs from 'fs'
import * as path from 'path'

// Define the interface for the response
export interface standardResponse {
    statusCode: number,
    message: string,
    measure_value: IntegerType,
    measure_uuid: string,
    _links: {
        image_url: { href: string },
        self: { href: string },
        next: { href: string },
        prev: { href: string }
    }
}

@Injectable()
export class ReadDataService {

    // ---------------------------------------------------------------------------------
    constructor(
        @InjectRepository(ReadDataEntity)
        private readonly readDataEntity: Repository<ReadDataEntity>,
    ) {}

    // exception handling
    private readonly knownExceptions = [
        ConflictException,
        BadRequestException,
        UnauthorizedException,
        NotFoundException,
    ]
    // ---------------------------------------------------------------------------------


    // upload image
    async uploadImage(
        readDataExtendedDTO: ReadDataExtendedDTO
    ): Promise<standardResponse> {

        try {

            // dir
            const tempDir = path.resolve('./src/static')
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true })
            }

            // UUID
            const uuidSave = String(uuidv4())

            // decode ans save img
            const base64Data = readDataExtendedDTO.image_data.replace(/^data:image\/\w+base64,/, '')
            const filePath = path.join(tempDir, `${uuidSave}.png`)
            fs.writeFileSync(filePath, base64Data, 'base64')

            // upload image
            const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY)            

            const uploadResponse = await fileManager.uploadFile(`./src/static/${uuidSave}.png`, {
                mimeType: "image/png",
                displayName: `${uuidSave}`,
            })

            // process image
            // --------------------------------------------------------------------------
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

            const model = genAI.getGenerativeModel({
                model: "gemini-1.5-pro",
            })

            const result = await model.generateContent([
                {
                  fileData: {
                    mimeType: uploadResponse.file.mimeType,
                    fileUri: uploadResponse.file.uri
                  }
                },
                {
                    text: "Get the numerical (only numbers) value for measuring water, gas, electricity. " +
                    "Make a formatted and simple answer, without text e.g. measurement: 123456 (only numbers)"
                },
            ])
            // -------------------------------------------------------------------------

            return {
                statusCode: 200,
                message: 'read successfully completed',
                measure_value: parseInt(result.response.candidates[0].content.parts[0].text),
                measure_uuid: uuidSave,
                _links: {
                    image_url: { href: `/static/${uuidSave}.png` },
                    self: { href: "/api/upload" },
                    next: { href: `/api/confirm`},
                    prev: { href: "/api/{customer-code}/list" }
                }
            }

        } catch (error) {

            if (this.knownExceptions.some(exc => error instanceof exc)) {

                throw error

            } else {

                // logs
                logsGenerator(
                    'error',
                    `read image error [uploadImage()]: ${error}`,
                    `${readDataExtendedDTO.ip}`
                )

                // return server error
                throw new InternalServerErrorException({
                    statusCode: 500,
                    message: 'an unexpected error occurred, please try again later.',
                    _links: {
                        self: { href: "/api/upload" },
                        next: { href: `/api/confirm`},
                        prev: { href: "/api/{customer-code}/list" }
                    }
                })
            }
        }
    }
}