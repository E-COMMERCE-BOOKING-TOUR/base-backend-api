import { BadRequestException } from '@nestjs/common';
import { ValidationError } from 'class-validator';

export class ValidationException extends BadRequestException {
    constructor(public validationErrors: ValidationError[]) {
        const formatErrors = (errors: ValidationError[]) => {
            return errors.map((error) => {
                const issues = Object.values(error.constraints || {});
                const children = error.children && error.children.length > 0
                    ? formatErrors(error.children)
                    : [];

                return {
                    field: error.property,
                    issues: issues,
                    ...(children.length > 0 ? { errors: children } : {}),
                };
            });
        };

        super({
            message: 'Dữ liệu không hợp lệ',
            errors: formatErrors(validationErrors),
        });
    }
}
