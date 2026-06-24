import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/typeorm.config';
import { User } from '../entities/User.entity';
import { generateTokens, isRefreshTokenValid, saveHashRefreshTokenToUser } from '../helpers/user.helpers';
import { AuthTokenType, UserAuthToken } from '../entities/UserAuthToken.entity';
import { IsNull, MoreThan } from 'typeorm';
// import { sendVerificationEmail } from './mail/templates/verification';
import { user } from '@getbrevo/brevo/dist/cjs/api';
import { sendPasswordRecoveryEmail } from './mail/templates/recovery';
import { AppError, ErrorCodes } from '../types/errors';
import { withTransaction } from '../helpers/transaction.helper';
import { createFreeSubscription } from '../helpers/subscription.helper';
import { seedExampleTemplates } from '../helpers/seed-templates.helper';
import { isLocalMode } from '../helpers/general.helpers';
import { ApiKeyService } from './apiKey.service';
import { createDefaultApiKeys } from '../helpers/api-key.helper';
import { UsageCounter } from '../entities/UsageCounter.entity';
import { Subscription } from '../entities/Subscription.entity';
import { GeneratedFile } from '../entities/GeneratedFIles.entity';
import { Template } from '../models/Template.model';
import { Folder } from '../models/Folder.model';


export class UserService {
    private static userRepository = AppDataSource.getRepository(User);
    private static tokenRepository = AppDataSource.getRepository(UserAuthToken);

    static async createUser(userData: {
        email: string;
        password: string;
        name: string;
    }) {
        const result = await withTransaction(async (queryRunner) => {
            const { email, password, name } = userData;

            // Verificar si el usuario ya existe
            const existingUser = await queryRunner.manager.findOne(User, {
                where: { email }
            });

            if (existingUser) {
                throw new AppError(ErrorCodes.USER_ALREADY_EXISTS);
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 12);

            // Crear usuario
            const user = queryRunner.manager.create(User, {
                email,
                password_hash: hashedPassword,
                name
            });

            await queryRunner.manager.save(user);

            // Crear api keys dev y produccion
            await createDefaultApiKeys(queryRunner, user.id);

            // [DISABLED] Crear suscripción free (solo en producción)
            // await createFreeSubscription(queryRunner, user);

            // if (!isLocalMode()) {
            //     await this.generateEmailVerificationToken(user.id);
            // }

            // Eliminar password del objeto retornado
            const { password_hash, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });

        // Seed example templates after successful user creation
        try {
            await seedExampleTemplates(result.id);
        } catch (error) {
            console.error('Error seeding example templates:', error);
        }

        return result;
    }

    static async authenticateUser(email: string, password: string) {
        const user = await this.userRepository.findOne({
            where: { email }
        });

        if (!user) {
            throw new AppError(ErrorCodes.INVALID_CREDENTIALS);
        }

        // Primero validamos si el usuario está bloqueado por los 3 intentos (24h)
        if (user.is_blocked && user.blocked_until && user.blocked_until > new Date()) {
            // throw new Error(`Cuenta bloqueada temporalmente. Intenta después de: ${user.blocked_until.toLocaleString()}`);
            const error: any = new Error(`Cuenta bloqueada temporalmente. Intenta después de: ${user.blocked_until.toLocaleString()}`);
            error.extensions = {
                code: ErrorCodes.USER_BLOCKED,
                blockedUntil: user.blocked_until.toISOString()
            };
            throw error;
        }

        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            throw new AppError(ErrorCodes.INVALID_CREDENTIALS);
        }

        // if (!user.is_verified) {
        //     // Calculamos cuántos días faltan para borrarlo (ejemplo: 7 días desde created_at)
        //     const DAYS_TO_DELETE = 7;
        //     const expirationDate = new Date(user.created_at);
        //     expirationDate.setDate(creationDate.getDate() + DAYS_TO_DELETE);
            
        //     const now = new Date();
        //     const diffTime = expirationDate.getTime() - now.getTime();
        //     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        //     // Lado B: Si ya pasaron los 7 días y no se verificó, podrías borrarlo aquí 
        //     // o lanzar un error específico para que el Front sepa qué mostrar.
        //     if (diffDays <= 0) {
        //         // throw new Error('Tu cuenta ha expirado por falta de verificación y será eliminada.');
        //         throw new AppError(ErrorCodes.ACCOUNT_EXPIRED);
        //     }

        //     // Devolvemos una respuesta especial o un flag para que el Front muestre el Alert
        //     // Nota: Seguimos permitiendo el login (opcional) pero con la advertencia
        // }

        // Generar tokens
        const { token, refreshToken } = generateTokens(user);

        saveHashRefreshTokenToUser(user, refreshToken, this.userRepository);

        // Eliminar password del objeto retornado
        const { password_hash, ...userWithoutPassword } = user;

        return {
            token,
            refreshToken,
            user: userWithoutPassword
        };
    }

    static async getUserById(id: string, includeHash = false) {
        const selectFields: any[] = ['id', 'email', 'name', 'created_at', 'updated_at'];
        
        if (includeHash) {
            selectFields.push('refresh_token_hash');
        }
        
        const user = await this.userRepository.findOne({
            where: { id }
            // select: selectFields
        });
        
        if (!user) {
            // throw new Error('User not found');
            throw new AppError(ErrorCodes.USER_NOT_FOUND);
        }
        return user;
    }

    static async getCurrentUser(userId: string) {
        return await this.getUserById(userId);
    }

    static async getAllUsers() {
        return await this.userRepository.find({
            select: ['id', 'email', 'name', 'active', 'isAdmin', 'created_at', 'updated_at']
        });
    }

    static async updateUser(userId: string, updateData: {
        name?: string;
        email?: string;
    }) {
        const user = await this.userRepository.findOne({
            where: { id: userId }
        });

        if (!user) {
            // throw new Error('User not found');
            throw new AppError(ErrorCodes.USER_NOT_FOUND);
        }

        // Verificar si el email ya está en uso
        if (updateData.email && updateData.email !== user.email) {
            const existingUser = await this.userRepository.findOne({
                where: { email: updateData.email }
            });

            if (existingUser) {
                // throw new Error('Email already in use');
                throw new AppError(ErrorCodes.EMAIL_ALREADY_IN_USE);
            }
        }

        // Actualizar usuario
        Object.assign(user, updateData);
        await this.userRepository.save(user);

        // Eliminar password del objeto retornado
        const { password_hash, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    static async deleteUser(userId: string) {
        const user = await this.userRepository.findOne({
            where: { id: userId }
        });

        if (!user) {
            throw new AppError(ErrorCodes.USER_NOT_FOUND);
        }

        // PostgreSQL: transacción para limpiar entidades sin cascade
        await AppDataSource.transaction(async (manager) => {
            // 1. UsageCounter (FK: userId)
            await manager.createQueryBuilder()
                .delete()
                .from(UsageCounter)
                .where('userId = :id', { id: userId })
                .execute();

            // 2. Subscription (FK: userId)
            await manager.createQueryBuilder()
                .delete()
                .from(Subscription)
                .where('userId = :id', { id: userId })
                .execute();

            // 3. GeneratedFile (FK: user_id, nullable → null)
            await manager.createQueryBuilder()
                .update(GeneratedFile)
                .set({ user: null as any })
                .where('user_id = :id', { id: userId })
                .execute();

            // 3b. GeneratedFile (FK: api_key_id → set null antes del cascade sobre api_keys)
            await manager.createQueryBuilder()
                .update(GeneratedFile)
                .set({ apiKey: null as any })
                .where('api_key_id IN (SELECT id FROM api_keys WHERE user_id = :id)', { id: userId })
                .execute();

            // 4. Eliminar usuario (cascade: ApiKeys, UserAuthTokens; SET NULL: PdfAuditLog)
            await manager.remove(user);
        });

        // MongoDB: limpiar documents y folders del usuario
        await Template.deleteMany({ owner: userId });
        await Folder.deleteMany({ owner: userId });

        return true;
    }

    static async changePassword(userId: string, oldPassword: string, newPassword: string) {
        const user = await this.userRepository.findOne({
            where: { id: userId }
        });

        if (!user) {
            // throw new Error('User not found');
            throw new AppError(ErrorCodes.USER_NOT_FOUND);
        }

        const isValidPassword = await bcrypt.compare(oldPassword, user.password_hash);
        if (!isValidPassword) {
            // throw new Error('Invalid current password');
            throw new AppError(ErrorCodes.INVALID_CURRENT_PASSWORD);
        }

        user.password_hash = await bcrypt.hash(newPassword, 12);
        await this.userRepository.save(user);

        return true;
    }

    static async verifyToken(token: string) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
            return await this.getUserById(decoded.userId);
        } catch (err: any) {
            // throw new Error('Invalid token');
            throw new AppError(ErrorCodes.INVALID_TOKEN);
        }
    }

    static async refreshUserToken(refreshTokenVar: string) {
        try {

            const decoded = jwt.verify(
                refreshTokenVar, 
                process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret'
            ) as any;


            const user = await this.getUserById(decoded.userId, true);

            console.log("user", user);

            const isRefreshTokenValidCheck = await isRefreshTokenValid(refreshTokenVar, user);
            if (!isRefreshTokenValidCheck) {
                // throw new Error('Invalid refresh token');
                throw new AppError(ErrorCodes.INVALID_REFRESH_TOKEN);
            }

            // Generar nuevos tokens
            const { token, refreshToken } = generateTokens(user);
            
            saveHashRefreshTokenToUser(user, refreshToken, this.userRepository);

            return {
                token   ,
                refreshToken,
                user
            };
        } catch (err: any) {
            // throw new Error('Invalid refresh token');
            throw new AppError(ErrorCodes.INVALID_REFRESH_TOKEN);
        }
    }

    static async toggleUserAdmin(targetUserId: string, isAdmin: boolean, currentUserId: string) {
        if (targetUserId === currentUserId) {
            throw new AppError(ErrorCodes.FORBIDDEN, {
                message: 'No puedes modificar tu propio rol de administrador'
            });
        }

        if (!isAdmin) {
            const adminCount = await this.userRepository.count({ where: { isAdmin: true } });
            if (adminCount <= 1) {
                throw new AppError(ErrorCodes.FORBIDDEN, {
                    message: 'Debe haber al menos un administrador en el sistema'
                });
            }
        }

        const user = await this.userRepository.findOne({ where: { id: targetUserId } });

        if (!user) {
            throw new AppError(ErrorCodes.USER_NOT_FOUND);
        }

        user.isAdmin = isAdmin;
        await this.userRepository.save(user);

        return user;
    }

    static async toggleUserStatus(userId: string, active: boolean ) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        
        if (!user) {
            // throw new Error('User not found');
            throw new AppError(ErrorCodes.USER_NOT_FOUND);
        }

        // Invertimos el estado actual
        user.active = active;
        await this.userRepository.save(user);

        return user;
    }

    static async resetUserPassword(userId: string) {
        const user = await this.userRepository.findOne({ where: { id: userId } });

        if (!user) {
            // throw new Error('User not found');
            throw new AppError(ErrorCodes.USER_NOT_FOUND);
        }

        // "contrasena123" con el salt de 12 definido en tu servicio
        const defaultPassword = process.env.DEFAULT_USER_PASSWORD || 'contrasena123';
        user.password_hash = await bcrypt.hash(defaultPassword, 12);
        
        await this.userRepository.save(user);
        return true;
    }

    static async generateAutoAdmin() {

        const adminExists = await this.userRepository.findOne({ 
            where: { isAdmin: true } 
        });

        if (adminExists) {
            // throw new Error('Forbidden: System already has an administrator');
            throw new AppError(ErrorCodes.FORBIDDEN);
        }

        const randomHex = crypto.randomBytes(3).toString('hex');
        const tempEmail = `admin_${randomHex}@local.test`;
        const tempPass = crypto.randomBytes(12).toString('base64').replace(/[/+=]/g, 'X');

        const hashedPassword = await bcrypt.hash(tempPass, 12);

        // Solo usamos los campos presentes en tu User.entity.ts
        const admin = this.userRepository.create({
            email: tempEmail,
            password_hash: hashedPassword,
            name: 'Initial Setup Admin',
            isAdmin: true, // Campo real según tu archivo
            active: true
        });

        await this.userRepository.save(admin);

        return {
            instructions: "COPY NOW. Credential loss requires manual DB intervention.",
            email: tempEmail,
            password: tempPass
        };
    }

    static async requestPasswordRecovery(email: string): Promise<boolean> {
        // 1.1. Validación de Existencia
        const user = await this.userRepository.findOne({ where: { email } });

        if (!user) {
            return true;
        }

        // 1.2. Verificación de Bloqueo Previo 
        if (user.is_blocked) {
            if (user.blocked_until && user.blocked_until > new Date()) {
                // throw new Error(`Cuenta bloqueada. Intenta después de: ${user.blocked_until.toLocaleString()}`);
                throw new AppError(ErrorCodes.USER_BLOCKED);
            } else {
                // Si el tiempo de bloqueo ya pasó, lo desbloqueamos para este nuevo intento 
                user.is_blocked = false;
                await this.userRepository.save(user);
            }
        }

        // 1.4. Conteo de Seguridad (Ventana de 24h) 
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const recoveryAttempts = await this.tokenRepository.count({
            where: {
                user_id: user.id,
                type: AuthTokenType.PASSWORD_RECOVERY,
                created_at: MoreThan(twentyFourHoursAgo)
            }
        });

        const maxAttempts = parseInt(process.env.MAX_RECOVERY_ATTEMPTS_24H || '3');

        if (recoveryAttempts >= maxAttempts) {
            // Bloqueo por 24 horas 
            user.is_blocked = true;
            user.blocked_until = new Date(Date.now() + 24 * 60 * 60 * 1000);
            await this.userRepository.save(user);

            // *** DISPARAR CORREO DE ALERTA DE SEGURIDAD AQUÍ *** 
            console.log(`ALERTA: Correo de seguridad enviado a ${user.email}`);
            
            // throw new Error('Demasiados intentos. Tu cuenta ha sido bloqueada por 24 horas por seguridad.');
            throw new AppError(ErrorCodes.TOO_MANY_ATTEMPTS);
        }

        // 1.3. Control de Spam (Cooldown de 2 min) 
        const lastToken = await this.tokenRepository.findOne({
            where: { user_id: user.id, type: AuthTokenType.PASSWORD_RECOVERY },
            order: { created_at: 'DESC' }
        });

        if (lastToken && (Date.now() - lastToken.created_at.getTime()) < 120000) {
            // throw new Error('Debes esperar 2 minutos para solicitar un nuevo token.'); // 
            throw new AppError(ErrorCodes.TOO_MANY_ATTEMPTS);
        }

        // 1.9. Generación del Token 
        const rawToken = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex'); // 

        const expirationDate = new Date();
        expirationDate.setMinutes(expirationDate.getMinutes() + 20); // Expiración de 20 min 

        const newToken = this.tokenRepository.create({
            token_hash: tokenHash,
            type: AuthTokenType.PASSWORD_RECOVERY,
            expires_at: expirationDate,
            user_id: user.id
        });

        await this.tokenRepository.save(newToken);

        // 1.21. Envío de Correo 
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const recoveryLink = `${frontendUrl}/reset-password?token=${rawToken}`;
        
        console.log(`DEBUG: Link enviado -> ${recoveryLink}`);
        await sendPasswordRecoveryEmail({
            toEmail: user.email,
            toName: user.name,
            link: recoveryLink,
            expiresInMinutes: 20
        });

        return true;
    }

    static async resetPasswordWithToken(rawToken: string, newPassword: string): Promise<boolean> {
        // 2.1. Búsqueda del Token: Generamos el hash del token recibido para buscarlo
        const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex'); 

        const tokenRecord = await this.tokenRepository.findOne({
            where: { 
                token_hash: tokenHash,
                type: AuthTokenType.PASSWORD_RECOVERY 
            },
            relations: ['user'] // Traemos al usuario asociado
        });

        // 2.3. Validación de Vigencia
        if (!tokenRecord) {
            // throw new Error('Token inválido o inexistente.'); 
            throw new AppError(ErrorCodes.INVALID_TOKEN);
        }

        if (tokenRecord.used_at) {
            // throw new Error('Este token ya ha sido utilizado.'); 
            throw new AppError(ErrorCodes.TOKEN_ALREADY_USED);
        }

        if (tokenRecord.expires_at < new Date()) {
            // throw new Error('El token ha expirado (límite de 20 minutos).'); 
            throw new AppError(ErrorCodes.TOKEN_EXPIRED);
        }

        // 2.5. Procesamiento
        const user = await this.userRepository.findOne({ where: { id: tokenRecord.user_id } });
        if (!user) {
            // throw new Error('Usuario no encontrado.');
            throw new AppError(ErrorCodes.USER_NOT_FOUND);
        }

        // Hasheamos la nueva contraseña (usando el salt de 12 de tu servicio)
        user.password_hash = await bcrypt.hash(newPassword, 12); 
        
        // Si estaba bloqueado, lo desbloqueamos al cambiar exitosamente la clave
        user.is_blocked = false;
        user.blocked_until = null as any;

        await this.userRepository.save(user); 

        // 2.6. Invalidadación: Marcamos el token actual como usado
        tokenRecord.used_at = new Date(); 
        await this.tokenRepository.save(tokenRecord);

        // Opcional: Invalidar todos los demás tokens pendientes del mismo tipo para este usuario
        await this.tokenRepository.update(
            { 
                user_id: user.id, 
                type: AuthTokenType.PASSWORD_RECOVERY, 
                used_at: IsNull() 
            },
            { used_at: new Date() } // O podrías usar una columna 'revoked'
        ); 

        return true;
    }

    // private static async generateEmailVerificationToken(userId: string) {

    //     const user = await this.userRepository.findOne({ where: { id: userId } });
    //     if (!user) return;

    //     const rawToken = crypto.randomBytes(32).toString('hex');
    //     const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    //     const newToken = this.tokenRepository.create({
    //         token_hash: tokenHash,
    //         type: AuthTokenType.EMAIL_VERIFICATION, // Usamos el tipo correspondiente
    //         expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas para verificar
    //         user_id: userId
    //     });

    //     await this.tokenRepository.save(newToken);
        
    //     // 2. Construir la liga usando variables de entorno 
    //     const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    //     const verificationLink = `${frontendUrl}/verify-email?token=${rawToken}`;

    //     console.log(verificationLink);

    //     // 3. ENVIAR EL CORREO REAL
    //     await sendVerificationEmail({
    //         toEmail: user.email,
    //         toName: user.name,
    //         link: verificationLink,
    //         expiresInMinutes: 1440 // 24 horas en minutos
    //     });
    // }


    // static async verifyEmail(rawToken: string): Promise<boolean> {
    //     const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    //     const tokenRecord = await this.tokenRepository.findOne({
    //         where: { 
    //             token_hash: tokenHash,
    //             type: AuthTokenType.EMAIL_VERIFICATION,
    //             used_at: IsNull() // Usamos IsNull() para evitar el error de tipos previo
    //         },
    //         relations: ['user']
    //     });

    //     if (!tokenRecord || tokenRecord.expires_at < new Date()) {
    //         // throw new Error('Token inválido o expirado.');
    //         throw new AppError(ErrorCodes.INVALID_TOKEN);
    //     }

    //     const user = tokenRecord.user;
        
    //     // Acción Final: Cambiar is_verified a true 
    //     user.is_verified = true;
    //     user.active = true; // Aseguramos que la cuenta esté activa
    //     await this.userRepository.save(user);

    //     // Marcar token como usado 
    //     tokenRecord.used_at = new Date();
    //     await this.tokenRepository.save(tokenRecord);

    //     return true;
    // }

    // static async resendVerificationEmail(email: string): Promise<boolean> {
    //     const user = await this.userRepository.findOne({ where: { email } });
    //     if (!user) {
    //         throw new AppError(ErrorCodes.USER_NOT_FOUND);
    //     }

    //     if (user.is_verified) {
    //         throw new AppError(ErrorCodes.USER_ALREADY_VERIFIED);
    //     }

    //     // Opcional: Verificar cooldown (no permitir reenvío si se envió hace menos de 2 min)
    //     const lastToken = await this.tokenRepository.findOne({
    //         where: { 
    //             user_id: user.id,
    //             type: AuthTokenType.EMAIL_VERIFICATION
    //         },
    //         order: { created_at: 'DESC' }
    //     });

    //     if (lastToken && (Date.now() - lastToken.created_at.getTime()) < 120000) {
    //         throw new AppError(ErrorCodes.TOO_MANY_ATTEMPTS);
    //     }

    //     // Generar nuevo token y enviar correo
    //     await this.generateEmailVerificationToken(user.id);
        
    //     return true;
    // }

    
}