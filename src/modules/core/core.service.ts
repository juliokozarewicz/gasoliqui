import {
    BadRequestException, ConflictException, Injectable,
    InternalServerErrorException, NotFoundException,
    UnauthorizedException
} from "@nestjs/common"
import { ReadDataEntity } from "./core.entity"
import { InjectRepository } from "@nestjs/typeorm"
import { Between, IntegerType, Like, Repository } from "typeorm"
import {
    ConfirmDataExtendedDTO, GetDataDTO, ReadDataExtendedDTO
} from "./core.dto"
import { logsGenerator } from "app.logs"
import { GoogleAIFileManager } from "@google/generative-ai/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { v4 as uuidv4 } from 'uuid'
import * as fs from 'fs'
import * as path from 'path'
import {
    sanitizeString, sanitizeId
} from "src/shared/input-validation/shared.sanitizer"

// Define the interface for the response
// ---------------------------------------------

// standard
export interface standardResponse {
    success: boolean,
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

// Get data
export interface getData {
    customer_code: string;
    measures: Array<{
        measure_uuid: string;
        measure_datetime: Date;
        measure_type: string;
        measure_value: number;
        has_confirmed: boolean;
        url_image: string;
    }>;
}
// ---------------------------------------------

// allowed types
export const allowedTypes = ['gas', 'water' ]

@Injectable()
export class ReadDataService {

    // -----------------------------------------------------------------------
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
    // -----------------------------------------------------------------------

    // upload image
    async uploadImage(
        readDataExtendedDTO: ReadDataExtendedDTO
    ): Promise<standardResponse> {

        // before init
        const tempDir = path.resolve('./src/staticfiles')
        let filePath: string
        const uuidSave = String(uuidv4())
        let measureValue: number
        let fileUrl: string

        try {

            // measure type 
            const allowed_measure = allowedTypes

            if (!allowed_measure.includes(
                readDataExtendedDTO.measure_type.toLocaleLowerCase()
            )) {
                throw new BadRequestException({
                    error_code: "INVALID_DATA",
                    error_description:
                        `'measure_type' must be one of the following options: ` +
                        `${allowedTypes.join(', ')}`,
                    _links: {
                        self: { href: "/api/upload" },
                        next: { href: "/api/confirm"},
                        prev: { href: "/api/{customer-code}/list" }
                    }
                })
            }

            // file path
            filePath = path.join(tempDir, `${uuidSave}.png`)

            // transaction
            await this.readDataEntity.manager.transaction(async createMeasure => {

                // measurement check this month
                const now = new Date(readDataExtendedDTO.measure_datetime)
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
                const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

                // get data
                const monthMeasureFind = await this.readDataEntity.findOne({
                    where: {
                        customer_code: sanitizeString(readDataExtendedDTO.customer_code),
                        measure_type: sanitizeString(
                            readDataExtendedDTO.measure_type.toLocaleLowerCase()
                        ),
                        measure_datetime: Between(startOfMonth, endOfMonth)
                    },
                })

                if (monthMeasureFind) {
                    throw new ConflictException({
                        error_code: "CONFLICT",
                        error_description: "a measurement for this type already exists this month",
                        _links: {
                            self: { href: "/api/upload" },
                            next: { href: "/api/confirm"},
                            prev: { href: "/api/{customer-code}/list" }
                        }
                    })
                }

                // static files dir
                if (!fs.existsSync(tempDir)) {
                    fs.mkdirSync(tempDir, { recursive: true })
                }

                // decode and save img
                const base64Data = readDataExtendedDTO.image_data.replace(/^data:image\/\w+base64,/, '')
                fs.writeFileSync(filePath, base64Data, 'base64')

                // upload image
                const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY)            

                const uploadResponse = await fileManager.uploadFile(
                    filePath, {
                        mimeType: "image/png",
                        displayName: `${uuidSave}`,
                    }
                )

                // process image
                // --------------------------------------------------------------------
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
                        text: "Get the numerical (only numbers) value for measuring " +
                        "water, gas, electricity. Make a formatted and simple " +
                        "answer, without text e.g. measurement: 123456 (only numbers)"
                    },
                ])
                // -------------------------------------------------------------------
                
                // Store result to be used after transaction
                measureValue = parseInt(
                    result.response.candidates[0].content.parts[0].text
                )
                fileUrl = `/staticfiles/${uuidSave}.png`

                // commit db
                const new_measure = new ReadDataEntity()
                new_measure.id = uuidSave
                new_measure.customer_code = readDataExtendedDTO.customer_code
                new_measure.measure_datetime = readDataExtendedDTO.measure_datetime
                new_measure.measure_type = readDataExtendedDTO.measure_type.toLocaleLowerCase()
                new_measure.measure_value = measureValue
                new_measure.url_image = `/staticfiles/${uuidSave}.png`
                new_measure.has_confirmed = false
                await createMeasure.save(new_measure)
            })

            return {
                success: true,
                statusCode: 201,
                message: 'read successfully completed',
                measure_value: measureValue,
                measure_uuid: uuidSave,
                _links: {
                    image_url: { href:  fileUrl},
                    self: { href: "/api/upload" },
                    next: { href: `/api/confirm`},
                    prev: { href: "/api/{customer-code}/list" }
                }
            }

        } catch (error) {

            // delete absolete img
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }

            // errors
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
                    error_code: "SERVER_ERROR",
                    error_description: "an unexpected error occurred, please try again later.",
                    _links: {
                        self: { href: "/api/upload" },
                        next: { href: "/api/confirm"},
                        prev: { href: "/api/{customer-code}/list" }
                    }
                })
            }
        }
    }

    // upload image
    async confirmData(
        confirmDataExtendedDTO: ConfirmDataExtendedDTO
    ): Promise<standardResponse> {

        try {

            // transaction
            await this.readDataEntity.manager.transaction(async confirmMeasure => {

                // get data
                const beforeConfirmFind = await this.readDataEntity.findOne({
                    where: {
                        id: sanitizeId(confirmDataExtendedDTO.measure_uuid)
                    },
                })

                if (!beforeConfirmFind) {
                    throw new NotFoundException({
                        error_code: "NOT_FOUND",
                        error_description: "no records were found for this data",
                        _links: {
                            self: { href: "/api/upload" },
                            next: { href: "/api/confirm"},
                            prev: { href: "/api/{customer-code}/list" }
                        }
                    })
                }

                if (beforeConfirmFind.has_confirmed) {
                    throw new ConflictException({
                        error_code: "CONFLICT",
                        error_description: "the reading data has already been confirmed",
                        _links: {
                            self: { href: "/api/upload" },
                            next: { href: "/api/confirm"},
                            prev: { href: "/api/{customer-code}/list" }
                        }
                    })
                }

                // commit db
                const update_measure = new ReadDataEntity()
                update_measure.id = confirmDataExtendedDTO.measure_uuid
                update_measure.measure_value = confirmDataExtendedDTO.confirmed_value
                update_measure.has_confirmed = true
                await confirmMeasure.save(update_measure)

            })

            return {
                success: true,
                statusCode: 200,
                message: 'data confirmed successfully',
                measure_value: confirmDataExtendedDTO.confirmed_value,
                measure_uuid: confirmDataExtendedDTO.measure_uuid,
                _links: {
                    image_url: {
                        href: `/staticfiles/${confirmDataExtendedDTO.measure_uuid}.png`
                    },
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
                    `confirm value error [confirmData()]: ${error}`,
                    `${confirmDataExtendedDTO.ip}`
                )

                // return server error
                throw new InternalServerErrorException({
                    error_code: "SERVER_ERROR",
                    error_description: "an unexpected error occurred, please try again later.",
                    _links: {
                        self: { href: "/api/upload" },
                        next: { href: "/api/confirm"},
                        prev: { href: "/api/{customer-code}/list" }
                    }
                })
            }
        }
    }

    // read measure
    async readData(
        getData: GetDataDTO
    ): Promise<getData> {

        try {

            // veify measure type
            const allowedUpper = allowedTypes.map(str => str.toUpperCase())

            if (
                getData.measure_type &&
                !allowedUpper.includes(getData.measure_type)
            ) {
                throw new BadRequestException({
                    error_code: "INVALID_DATA",
                    error_description: 
                        `'measure_type' must be one of the following options: ` +
                        `${allowedTypes.join(', ').toUpperCase()}`,
                    _links: {
                        self: { href: "/api/{customer-code}/list" },
                        next: { href: "/api/upload"},
                        prev: { href: "/api/upload" }
                    }
                })
            }

            // find by measure type
            const measureType = getData.measure_type;
            const measureTypeCond = measureType ? measureType : '%';
            const measureTypeValid = Like(`%${measureTypeCond}%`)

            // get data
            const afterConfirmFind = await this.readDataEntity.find({
                where: {
                    customer_code: sanitizeString(getData.customerCode),
                    measure_type: measureTypeValid
                },
            })

            if (afterConfirmFind.length === 0) {
                throw new NotFoundException({
                    error_code: 'NOT_FOUND',
                    error_description: "no records were found for this customer",
                    _links: {
                        self: { href: "/api/{customer-code}/list" },
                        next: { href: "/api/upload"},
                        prev: { href: "/api/upload" }
                    }
                })
            }

            return {
                "customer_code": getData.customerCode,            
                "measures": afterConfirmFind.map(item => ({
                    measure_uuid: item.id,
                    measure_datetime: item.measure_datetime,
                    measure_type: item.measure_type,
                    measure_value: item.measure_value,
                    has_confirmed: item.has_confirmed,
                    url_image: item.url_image
                }))
            }

        } catch (error) {

            if (this.knownExceptions.some(exc => error instanceof exc)) {

                throw error

            } else {

                // logs
                logsGenerator(
                    'error',
                    `read data error [readData()]: ${error}`,
                    `${getData.ip}`
                )

                // return server error
                throw new InternalServerErrorException({
                    error_code: "SERVER_ERROR",
                    error_description: "an unexpected error occurred, please try again later.",
                    _links: {
                        self: { href: "/api/upload" },
                        next: { href: "/api/confirm"},
                        prev: { href: "/api/{customer-code}/list" }
                    }
                })
            }
        }
    }
}