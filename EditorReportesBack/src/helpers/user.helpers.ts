import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { Repository } from 'typeorm';
import { User } from "../entities/User.entity";

const saltRounds = 12;

const expiresTokens = {
    access: { expiresIn: '1d' } as SignOptions,
    refresh: { expiresIn: '30d' } as SignOptions
};

export const saveHashRefreshTokenToUser = async ( 
    user: User, 
    refreshToken: string, 
    userRepository: Repository<User>
) => {
    const refreshTokenHash = await bcrypt.hash(refreshToken, saltRounds); 
    user.refresh_token_hash = refreshTokenHash;
    await userRepository.save(user);
}

export const isRefreshTokenValid = async (refreshToken: string, user: User) => {
    if (!user.refresh_token_hash) return false;
    const isRefreshTokenValid = await bcrypt.compare(refreshToken, user.refresh_token_hash);
    return isRefreshTokenValid;
}


export const generateTokens = (user: User) => {
    const token = jwt.sign(
        { 
            userId: user.id, 
            email: user.email,
            type: 'access'
        },
        process.env.JWT_SECRET || 'fallback-secret',
        expiresTokens.access
    );

    const refreshToken = jwt.sign(
        { 
            userId: user.id,
            type: 'refresh'
        },
        process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret',
        expiresTokens.refresh
    );
    return { token, refreshToken };
}