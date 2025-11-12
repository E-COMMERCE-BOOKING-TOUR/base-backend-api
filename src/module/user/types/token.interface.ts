export interface TokenPayload {
    uuid: string;
    full_name: string;
}

export interface RefreshPayload {
    uuid: string;
}

export class JWTRefresh {
    tokenRefresh: string;
    payload: RefreshPayload;
}
