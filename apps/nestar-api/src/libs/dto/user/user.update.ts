import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, Length } from 'class-validator';
import { UserStatus, UserRole } from '../../enums/user.enum';
import { ObjectId } from 'mongoose';

@InputType()
export class UserUpdate {
	@IsNotEmpty()
	@Field(() => String)
	_id: ObjectId;

	@IsOptional()
	@Field(() => UserRole, { nullable: true })
	userRole?: UserRole;

	@IsOptional()
	@Field(() => UserStatus, { nullable: true })
	userStatus?: UserStatus;

	@IsOptional()
	@Field(() => String, { nullable: true })
	userEmail?: string;

	@IsOptional()
	@Length(3, 12)
	@Field(() => String, { nullable: true })
	userNick?: string;

	@IsOptional()
	@Length(5, 12)
	@Field(() => String, { nullable: true })
	userPassword?: string;

	@IsOptional()
	@Length(3, 100)
	@Field(() => String, { nullable: true })
	userFullName?: string;

	deleteAt?: Date;
}
