import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs'
import { User } from '../../libs/dto/user/user';
import { T } from '../../libs/types/common';
import { JwtService } from '@nestjs/jwt'
import { shapeIntoMongoObjectId } from '../../libs/config';

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        @InjectModel('User') private userModel: Model<User>,
    ) {}

    public async hashPassword(password: string): Promise<string> {
        const salt = await bcrypt.genSalt();
        return await bcrypt.hash(password, salt);
    }

    public async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
        return await bcrypt.compare(password, hashedPassword);
    }

    public async createUserToken(user: User): Promise<string> {
        const userObj = user['_doc'] ? user['_doc'] : user;
        const payload: T = {
            _id: userObj._id,
            userNick: userObj.userNick,
            userEmail: userObj.userEmail,
            userRole: userObj.userRole,
            userStatus: userObj.userStatus,
            userAuthType: userObj.userAuthType,
            userOrganizationId: userObj.userOrganizationId || null,
        };
        delete payload.userPassword;
        return await this.jwtService.signAsync(payload);
    }

    public async verifyUserToken(token: string): Promise<User> {
        const tokenUser = await this.jwtService.verifyAsync(token);
        const userId = shapeIntoMongoObjectId(tokenUser._id);

        let dbUser = await this.userModel.findById(userId).exec();

        if (!dbUser && tokenUser.userNick) {
            console.log(`User ID ${userId.toString()} from token not found. Looking up by userNick: ${tokenUser.userNick}`);
            dbUser = await this.userModel.findOne({ userNick: tokenUser.userNick }).exec();

            if (dbUser) {
                console.log(`Found user by userNick. Old ID: ${userId.toString()}, New ID: ${dbUser._id.toString()}`);
                return dbUser.toObject();
            }
        }

        if (!dbUser) {
            throw new UnauthorizedException(`User with ID ${userId.toString()} or userNick ${tokenUser.userNick} not found in database. Please log in again.`);
        }

        return dbUser.toObject();
    }

    public async adminLogin(userEmail: string, password: string): Promise<User> {
        const user = await this.userModel.findOne({ userEmail }).select('+userPassword').exec();

        if (!user) {
            throw new UnauthorizedException('Invalid email or password.');
        }

        const adminRoles = ['ADMIN', 'SUPER_ADMIN', 'CONTENT_ADMIN'];
        if (!adminRoles.includes(user.userRole)) {
            throw new UnauthorizedException('Admin access required.');
        }

        if (user.userStatus !== 'ACTIVE') {
            throw new UnauthorizedException('Account is not active.');
        }

        const isPasswordValid = await this.comparePassword(password, user.userPassword);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid email or password.');
        }

        return user.toObject();
    }

    public async adminSignup(userNick: string, userEmail: string, password: string): Promise<User> {
        const existingSuperAdmin = await this.userModel.findOne({ userRole: 'SUPER_ADMIN' }).exec();
        if (existingSuperAdmin) {
            throw new UnauthorizedException('Super admin already exists. Please use login instead.');
        }

        const existingEmail = await this.userModel.findOne({ userEmail }).exec();
        if (existingEmail) {
            throw new UnauthorizedException('Email already registered.');
        }

        const existingNick = await this.userModel.findOne({ userNick }).exec();
        if (existingNick) {
            throw new UnauthorizedException('User nick already exists.');
        }

        const hashedPassword = await this.hashPassword(password);

        const newAdmin = await this.userModel.create({
            userNick,
            userEmail,
            userPassword: hashedPassword,
            userRole: 'SUPER_ADMIN',
            userStatus: 'ACTIVE',
            userAuthType: 'EMAIL',
        });

        return newAdmin.toObject();
    }
}
