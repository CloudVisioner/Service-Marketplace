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
        // Standardize payload structure to ensure consistency between signup and login
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
        // Remove password if present
        delete payload.userPassword;
        return await this.jwtService.signAsync(payload);
    }

    public async verifyUserToken(token: string): Promise<User> {
        const tokenUser = await this.jwtService.verifyAsync(token);
        const userId = shapeIntoMongoObjectId(tokenUser._id);
        
        // Verify the user exists in the database
        let dbUser = await this.userModel.findById(userId).exec();
        
        // If user doesn't exist by ID, try to find by userNick (in case user was recreated)
        if (!dbUser && tokenUser.userNick) {
            console.log(`User ID ${userId.toString()} from token not found. Looking up by userNick: ${tokenUser.userNick}`);
            dbUser = await this.userModel.findOne({ userNick: tokenUser.userNick }).exec();
            
            if (dbUser) {
                console.log(`Found user by userNick. Old ID: ${userId.toString()}, New ID: ${dbUser._id.toString()}`);
                // Return the database user with updated ID
                return dbUser.toObject();
            }
        }
        
        // If user still doesn't exist, throw error
        if (!dbUser) {
            throw new UnauthorizedException(`User with ID ${userId.toString()} or userNick ${tokenUser.userNick} not found in database. Please log in again.`);
        }
        
        // Return the database user to ensure we have the latest data
        return dbUser.toObject();
    }
}