import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorator/permissions.decorator';
import { PermissionEntity } from '../entity/permission.entity';

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
            PERMISSIONS_KEY,
            [context.getHandler(), context.getClass()],
        );

        if (!requiredPermissions || requiredPermissions.length === 0) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user || !user.role) {
            return false;
        }

        // Admin has all permissions
        if (user.role.name === 'admin') {
            return true;
        }

        const userPermissions = user.role.permissions || [];
        const userPermissionNames = userPermissions.map(
            (p: any) => typeof p === 'string' ? p : p.permission_name,
        );

        return requiredPermissions.every((permission) =>
            userPermissionNames.includes(permission),
        );
    }
}
