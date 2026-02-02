import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, Min } from 'class-validator';
import { NotificationType, NotificationStatus, NotificationGroup } from '../../enums/notification.enum';
import { ObjectId } from 'mongoose';

@InputType()
export class NotificationInput {
	@IsNotEmpty()
	@Field(() => NotificationType)
	notificationType: NotificationType;

	@IsNotEmpty()
	@Field(() => NotificationGroup)
	notificationGroup: NotificationGroup;

	@IsNotEmpty()
	@Field(() => String)
	notificationTitle: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	notificationDesc?: string;

	@IsNotEmpty()
	@Field(() => String)
	senderUserId: ObjectId;

	@IsNotEmpty()
	@Field(() => String)
	receiverUserId: ObjectId;

	@IsNotEmpty()
	@Field(() => String)
	organizationId: ObjectId;

	@IsNotEmpty()
	@Field(() => String)
	serviceRequestId: ObjectId;
}

@InputType()
class NotificationSearch {
	@IsOptional()
	@Field(() => NotificationStatus, { nullable: true })
	notificationStatus?: NotificationStatus;

	@IsOptional()
	@Field(() => NotificationType, { nullable: true })
	notificationType?: NotificationType;
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
