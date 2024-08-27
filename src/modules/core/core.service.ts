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

import { GoogleAIFileManager } from "@google/generative-ai/server";
import { GoogleGenerativeAI } from "@google/generative-ai";



// Define the interface for the response
export interface standardResponse {
    data: any,
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


    // insert new user
    async uploadImage(
        readDataExtendedDTO: ReadDataExtendedDTO
    ): Promise<standardResponse> {

        try {

            // upload image
            // --------------------------------------------------------------------------
            const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);            

            const uploadResponse = await fileManager.uploadFile("./src/1_media/luz.jpg", {
                mimeType: "image/jpeg",
                displayName: "Jetpack drawing",
            });
            // --------------------------------------------------------------------------

            // process image #####
            // --------------------------------------------------------------------------

            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

            const model = genAI.getGenerativeModel({
                model: "gemini-1.5-pro",
            });

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
            ]);
            // -------------------------------------------------------------------------

            return {
                data: result,
                statusCode: 200,
                message: 'leitura realizada com sucesso',
                measure_value: parseInt(result.response.candidates[0].content.parts[0].text),
                measure_uuid: 'UUID string',
                _links: {
                    image_url: { href: "/api/upload" },
                    self: { href: "/api/upload" },
                    next: { href: `/api/confirm`},
                    prev: { href: "/api/{customer code}/list" }
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
                    message: 'ocorreu um erro inesperado, tente novamente mais tarde',
                    _links: {
                        self: { href: "/api/accounts/signup" },
                        next: { href: "/api/accounts/login" },
                        prev: { href: "/api/accounts/login" }
                    }
                })
            }
        }
    }
}