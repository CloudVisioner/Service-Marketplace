import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs'
import { User } from '../../libs/dto/user/user';
import { T } from '../../libs/types/common';
import { JwtService } from '@nestjs/jwt'
import { shapeIntoMongoObjectId } from '../../libs/config';

@Injectable()
export class AuthService {
    constructor(private jwtService: JwtService) {}
    
    public async hashPassword(password: string): Promise<string> {
        const salt = await bcrypt.genSalt();
        return await bcrypt.hash(password, salt);
    }

    public async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
        return await bcrypt.compare(password, hashedPassword);
    }

    public async createUserToken(user: User): Promise<string> {
        const payload: T = {};
        Object.keys(user['_doc'] ? user['_doc'] : user).map((ele) => {
            payload[`${ele}`] = user[`${ele}`];
        });
        delete payload.userPassword;
        return await this.jwtService.signAsync(payload);
    }

    public async verifyUserToken(token: string): Promise<User> {
        const user = await this.jwtService.verifyAsync(token);
        user._id = shapeIntoMongoObjectId(user._id);
        return user;
    }
}