import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, Min } from 'class-validator';
import { NotificationType } from '../../enums/notification.enum';
import { ObjectId } from 'mongoose';

@InputType()
export class NotificationInput {
	@IsNotEmpty()
	@Field(() => NotificationType)
	type: NotificationType;

	@IsNotEmpty()
	@Field(() => String)
	message: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	relatedQuoteId?: ObjectId;

	@IsNotEmpty()
	@Field(() => String)
	senderUserId: ObjectId;

	@IsNotEmpty()
	@Field(() => String)
	receiverUserId: ObjectId;
}

@InputType()
class NotificationSearch {
	@IsOptional()
	@Field(() => Boolean, { nullable: true })
	read?: boolean;

	@IsOptional()
	@Field(() => NotificationType, { nullable: true })
	type?: NotificationType;
}

@InputType()
export class NotificationInquiry {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number;

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit: number;

	@IsNotEmpty()
	@Field(() => NotificationSearch)
	search: NotificationSearch;
}
