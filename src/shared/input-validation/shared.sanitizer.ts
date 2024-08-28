import { BadRequestException } from '@nestjs/common'
import * as sanitizeHtml from 'sanitize-html'


export function sanitizeId(input: string): string {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

    if (!uuidRegex.test(input)) {
        throw new BadRequestException('invalid user ID format, must be a valid UUID')
    }

    return input
}

export function sanitizeString(input: string): string {
    const validStringRegex = /^[a-zA-Z0-9\s]+$/

    if (!validStringRegex.test(input)) {
        throw new BadRequestException('input contains disallowed characters')
    }

    return input
}

export function sanitizeIP(input: string): string {
    const validStringRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)|^(?:[a-fA-F0-9]{1,4}:){7}(?:[a-fA-F0-9]{1,4}|:)|^(?:[a-fA-F0-9]{1,4}:){1,7}:|^(?:[a-fA-F0-9]{1,4}:){1,6}:(?:[a-fA-F0-9]{1,4}|:)|^(?:[a-fA-F0-9]{1,4}:){1,5}:(?:[a-fA-F0-9]{1,4}:){1,2}|^(?:[a-fA-F0-9]{1,4}:){1,4}:(?:[a-fA-F0-9]{1,4}:){1,3}|^(?:[a-fA-F0-9]{1,4}:){1,3}:(?:[a-fA-F0-9]{1,4}:){1,4}|^(?:[a-fA-F0-9]{1,4}:){1,2}:(?:[a-fA-F0-9]{1,4}:){1,5}|^[a-fA-F0-9]{1,4}:(?:[a-fA-F0-9]{1,4}:){1,6}|^:(?:[a-fA-F0-9]{1,4}:){1,7}|^::(?:[a-fA-F0-9]{1,4}:){1,6}|^(?:[a-fA-F0-9]{1,4}:){1,7}|^::|^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/

    if (!validStringRegex.test(input)) {
        throw new BadRequestException('input contains disallowed characters')
    }

    return input
}

export function sanitizeInteger(input: number): number {
    // Check if the input is a number and an integer
    if (!Number.isInteger(input)) {
        throw new BadRequestException('input must be a valid integer.');
    }

    return input;
}