import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const roles = this.reflector.get<string[]>(
            'roles',
            context.getHandler(),
        );
        if (!roles) {
            // Check if roles are defined at controller level
            const classRoles = this.reflector.get<string[]>(
                'roles',
                context.getClass(),
            );
            if (!classRoles) {
                return true;
            }
            return this.validateRoles(context, classRoles);
        }
        return this.validateRoles(context, roles);
    }

    validateRoles(context: ExecutionContext, roles: string[]) {
        const request = context.switchToHttp().getRequest<{
            user?: { role?: { name: string } };
        }>();
        const user = request.user;
        if (!user || !user.role) {
            return false;
        }

        return roles.includes(user.role.name);
    }
}
