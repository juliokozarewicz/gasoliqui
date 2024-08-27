import {
    BadRequestException, ConflictException, Injectable,
    InternalServerErrorException,
    NotFoundException, UnauthorizedException
} from "@nestjs/common"
import { ReadDataEntity } from "./core.entity"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { ReadDataExtendedDTO } from "./core.dto"
import { logsGenerator } from "app.logs"

// Define the interface for the response
export interface standardResponse {
    statusCode: number,
    message: string,
    _links: {
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

            console.log(readDataExtendedDTO)

            return {
                statusCode: 201,
                message: "*** teste ***",
                _links: {
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