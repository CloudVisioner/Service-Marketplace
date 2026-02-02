import { Field, InputType, Int } from '@nestjs/graphql';
import { IsIn, IsNotEmpty, IsOptional, Length, Min } from 'class-validator';
import { UserRole, UserStatus } from '../../enums/user.enum';
import { availableUserSorts } from '../../config';
import { Direction } from '../../enums/common.enum';

@InputType()
export class UserInput {
	@IsNotEmpty()
	@Length(3, 12)
	@Field(() => String)
	userNick: string;

	@IsNotEmpty()
	@Length(5, 12)
	@Field(() => String)
	userPassword: string;

	@IsNotEmpty()
	@Field(() => String)
	userEmail: string;

	@IsOptional()
	@Field(() => UserRole, { nullable: true })
	userRole?: UserRole;
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
