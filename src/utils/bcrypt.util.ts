import * as bcrypt from 'bcrypt';

export async function hashPassword(password: string) {
    return await bcrypt.hash(password, 10);
}

export async function comparePassword(p1: string, p2: string) {
    return await bcrypt.compare(p1, p2);
}
