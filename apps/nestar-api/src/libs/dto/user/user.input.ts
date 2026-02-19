import { Field, InputType, Int } from '@nestjs/graphql';
import { IsIn, IsNotEmpty, IsOptional, Length, Min, IsEmail } from 'class-validator';
import { UserRole, UserStatus, UserAuthType } from '../../enums/user.enum';
import { availableUserSorts } from '../../config';
import { Direction } from '../../enums/common.enum';

@InputType()
export class SignupInput {
	@IsNotEmpty()
	@IsEmail()
	@Field(() => String)
	userEmail: string;

	@IsNotEmpty()
	@Length(3, 12)


	
	@Field(() => String)
	userNick: string;

	@IsNotEmpty()
	@Length(5, 12)
	@Field(() => String)
	userPassword: string;

	@IsOptional()
	@Field(() => UserRole, { nullable: true })
	userRole?: UserRole;
}

@InputType()
export class UserInput {
	@IsNotEmpty()
	@Length(5, 12)
	@Field(() => String)
	userPassword: string;

	@IsNotEmpty()
	@IsEmail()
	@Field(() => String)
	userEmail: string;

	@IsOptional()
	@Length(3, 12)
	@Field(() => String, { nullable: true })
	userNick?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	userPhone?: string;

	@IsOptional()
	@Field(() => UserAuthType, { nullable: true })
	userAuthType?: UserAuthType;

	@IsOptional()
	@Field(() => UserRole)
	userRole: UserRole;

	@IsOptional()
	@Field(() => String, { nullable: true })
	userImage?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	userDescription?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	userOrganizationId?: string;

	@IsOptional()
	@Field(() => [String], { nullable: true })
	userLanguages?: string[];
}

@InputType()
export class LoginInput {
	@IsNotEmpty()
	@Length(3, 12)
	@Field(() => String)
	userNick: string;

	@IsNotEmpty()
	@Length(5, 12)
	@Field(() => String)
	userPassword: string;
}

@InputType()
class UISearch {
	@IsOptional()
	@Field(() => String, { nullable: true })
	userStatus?: UserStatus;

	@IsOptional()
	@Field(() => String, { nullable: true })
	userRole?: UserRole;

	@IsNotEmpty()
	@Field(() => String, { nullable: true })
	text?: string;
}

@InputType()
export class UsersInquiry {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number;

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit: number;

	@IsOptional()
	@IsIn(availableUserSorts)
	@Field(() => String, { nullable: true })
	sort?: string;

	@IsOptional()
	@IsIn(availableUserSorts)
	@Field(() => Direction, { nullable: true })
	direction?: Direction;

	@IsNotEmpty()
	@Field(() => UISearch)
	search: UISearch;
}

@InputType()
export class ChangePasswordInput {
	@IsNotEmpty()
	@Field(() => String)
	currentPassword: string;

	@IsNotEmpty()
	@Length(5, 12)
	@Field(() => String)
	newPassword: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	securityCode?: string; // Optional security number for verification
}
