import { BadRequestException } from '@nestjs/common';
import { ValidationError } from 'class-validator';

export class ValidationException extends BadRequestException {
    constructor(public validationErrors: ValidationError[]) {
        super({
            message: 'Dữ liệu không hợp lệ',
            errors: validationErrors.map((error) => ({
                field: error.property,
                issues: Object.values(error.constraints || {}),
            })),
        });
    }
}
