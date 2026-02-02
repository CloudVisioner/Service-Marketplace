import { Mutation, Resolver, Query, Args } from '@nestjs/graphql';
import { UserService } from './user.service';
import { BadRequestException, InternalServerErrorException, UseGuards } from '@nestjs/common';
import { LoginInput, UserInput, UsersInquiry } from '../../libs/dto/user/user.input';
import { User, Users } from '../../libs/dto/user/user';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthUser } from '../auth/decorators/authUser.decorator';
import type { ObjectId } from 'mongoose';
import { UserRole } from '../../libs/enums/user.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserUpdate } from '../../libs/dto/user/user.update';
import { getSerialForImage, shapeIntoMongoObjectId, validMimeTypes } from '../../libs/config';
import { WithoutGuard } from '../auth/guards/without.guard';
import { GraphQLUpload, FileUpload } from 'graphql-upload';
import { createWriteStream } from 'fs';
import { Message } from '../../libs/enums/common.enum';

@Resolver()
export class UserResolver {
	constructor(private readonly userService: UserService) {}

	@Mutation(() => User)
	public async signup(@Args('input') input: UserInput): Promise<User> {
		console.log('Mutation: signup');
		return await this.userService.signup(input);
	}

	@Mutation(() => User)
	public async login(@Args('input') input: LoginInput): Promise<User> {
		console.log('Mutation: login');
		return await this.userService.login(input);
	}

	@UseGuards(AuthGuard)
	@Query(() => String)
	public async checkAuth(@AuthUser('userNick') userNick: string): Promise<string> {
		console.log('Query: checkAuth');
		console.log('userNick:', userNick);
		return await `Hi ${userNick}`;
	}

	@Roles(UserRole.BUYER, UserRole.PROVIDER)
	@UseGuards(RolesGuard)
	@Query(() => String)
	public async checkAuthRoles(@AuthUser() authUser: User): Promise<string> {
		console.log('Query: checkAuthRoles');
		return await `Hi ${authUser.userNick}, you are ${authUser.userRole} (userId: ${authUser._id}) `;
	}

	@UseGuards(AuthGuard)
	@Mutation(() => User)
	public async updateUser(
		@Args('input') input: UserUpdate,
		@AuthUser('_id') userId: ObjectId,
	): Promise<User> {
		console.log('Mutation: updateUser');
		delete input._id;
		return await this.userService.updateUser(userId, input);
	}

	@UseGuards(WithoutGuard)
	@Query(() => User)
	public async getUser(@Args('userId') input: string, @AuthUser('_id') userId: ObjectId): Promise<User> {
		console.log('Query: getUser');
		console.log('userId:', userId);
		const targetId = shapeIntoMongoObjectId(input);
		return await this.userService.getUser(userId, targetId);
	}

	@UseGuards(AuthGuard)
	@Mutation(() => User)
	public async likeTargetUser(
		@Args('userId') input: string,
		@AuthUser('_id') userId: ObjectId,
	): Promise<User> {
		console.log('Mutation: likeTargetUser');
		const likeRefId = shapeIntoMongoObjectId(input);
		return await this.userService.likeTargetUser(userId, likeRefId);
	}

	//** ADMIN **//
	@Roles(UserRole.ADMIN)
	@UseGuards(RolesGuard)
	@Query(() => Users)
	public async getAllUsersByAdmin(@Args('input') input: UsersInquiry): Promise<Users> {
		return await this.userService.getAllUsersByAdmin(input);
	}

	//** Authorization: ADMIN **/
	@Roles(UserRole.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation(() => User)
	public async updateUserByAdmin(@Args('input') input: UserUpdate): Promise<User> {
		console.log('Mutation: updateUserByAdmin');
		return await this.userService.updateUserByAdmin(input);
	}

	@UseGuards(AuthGuard)
	@Mutation((returns) => String)
	public async imageUploader(
		@Args({ name: 'file', type: () => GraphQLUpload })
		{ createReadStream, filename, mimetype }: FileUpload,
		@Args('target') target: String,
	): Promise<string> {
		console.log('Mutation: imageUploader');

		if (!filename) throw new BadRequestException(Message.UPLOAD_FAILED);
		const validMime = validMimeTypes.includes(mimetype);
		if (!validMime) throw new BadRequestException(Message.PROVIDE_ALLOWED_FORMAT);

		const imageName = getSerialForImage(filename);
		const url = `uploads/${target}/${imageName}`;
		const stream = createReadStream();

		const result = await new Promise((resolve, reject) => {
			stream
				.pipe(createWriteStream(url))
				.on('finish', async () => resolve(true))
				.on('error', () => reject(false));
		});
		if (!result) throw new BadRequestException(Message.UPLOAD_FAILED);

		return url;
	}

	@UseGuards(AuthGuard)
	@Mutation((returns) => [String])
	public async imagesUploader(
		@Args('files', { type: () => [GraphQLUpload] })
		files: Promise<FileUpload>[],
		@Args('target') target: String,
	): Promise<string[]> {
		console.log('Mutation: imagesUploader');

		const uploadedImages = [];
		const promisedList = files.map(async (img: Promise<FileUpload>, index: number): Promise<Promise<void>> => {
			try {
				const { filename, mimetype, createReadStream } = await img;

				const validMime = validMimeTypes.includes(mimetype);
				if (!validMime) throw new BadRequestException(Message.PROVIDE_ALLOWED_FORMAT);

				const imageName = getSerialForImage(filename);
				const url = `uploads/${target}/${imageName}`;
				const stream = createReadStream();

				const result = await new Promise((resolve, reject) => {
					stream
						.pipe(createWriteStream(url))
						.on('finish', () => resolve(true))
						.on('error', () => reject(false));
				});
				if (!result) throw new BadRequestException(Message.UPLOAD_FAILED);

				uploadedImages[index] = url;
			} catch (err) {
				console.log('Error, file missing!');
			}
		});

		await Promise.all(promisedList);
		return uploadedImages;
	}
}
