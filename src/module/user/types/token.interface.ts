export interface TokenPayload {
    uuid: string;
    full_name: string;
    phone?: string;
    email?: string;
    role?: string;  // User role name (e.g., 'Admin', 'User')
}

export interface RefreshPayload {
    uuid: string;
}

export class JWTRefresh {
    tokenRefresh: string;
    payload: RefreshPayload;
}
