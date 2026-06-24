

export type ErrorCodeType = typeof ErrorCodes[keyof typeof ErrorCodes];

export const ErrorCodes = {
    USER_ALREADY_EXISTS: 'USER_ALREADY_EXISTS',
    INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
    EMAIL_ALREADY_IN_USE: 'EMAIL_ALREADY_IN_USE',
    INVALID_CURRENT_PASSWORD: 'INVALID_CURRENT_PASSWORD',
    USER_BLOCKED: 'USER_BLOCKED',
    // ACCOUNT_EXPIRED: 'ACCOUNT_EXPIRED',
    USER_NOT_FOUND: 'USER_NOT_FOUND',
    INVALID_TOKEN: 'INVALID_TOKEN',
    INVALID_REFRESH_TOKEN: 'INVALID_REFRESH_TOKEN',
    TOO_MANY_ATTEMPTS: 'TOO_MANY_ATTEMPTS',
    TOKEN_ALREADY_USED: 'TOKEN_ALREADY_USED',
    TOKEN_EXPIRED: 'TOKEN_EXPIRED',
    // USER_ALREADY_VERIFIED: 'USER_ALREADY_VERIFIED',
    // EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
    ALTCHA_VALIDATION_FAILED: 'ALTCHA_VALIDATION_FAILED',
    FORBIDDEN: 'FORBIDDEN',
    PLAN_NOT_FOUND: 'PLAN_NOT_FOUND',
};


export class AppError extends Error {
    public readonly code: string;
    public readonly extensions: any;

    constructor(code: string, extensions: any = {}) {
        super(code);
        this.code = code;
        this.extensions = { ...extensions, code };
        Object.setPrototypeOf(this, AppError.prototype);
    }
}