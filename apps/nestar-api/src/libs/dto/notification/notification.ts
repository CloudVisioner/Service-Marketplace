import { Field, Int, ObjectType } from '@nestjs/graphql';
import mongoose from 'mongoose';
import { NotificationType } from '../../enums/notification.enum';
import { User } from '../user/user';
import { TotalCounter } from '../common/common';

@ObjectType()
export class Notification {
	@Field(() => String)
	_id: mongoose.ObjectId;

	@Field(() => NotificationType)
	type: NotificationType;

	@Field(() => String)
	message: string;

	@Field(() => Boolean)
	read: boolean;

	@Field(() => String, { nullable: true })
	relatedQuoteId?: mongoose.ObjectId;

	@Field(() => String)
	senderUserId: mongoose.ObjectId;

	@Field(() => String)
	receiverUserId: mongoose.ObjectId;

	@Field(() => Date)
	createdAt: Date;

	@Field(() => Date)
	updatedAt: Date;

	/** from aggregation **/
	@Field(() => User, { nullable: true })
	senderUserData?: User;

	@Field(() => User, { nullable: true })
	receiverUserData?: User;
}

@ObjectType()
export class Notifications {
	@Field(() => [Notification])
	list: Notification[];

	@Field(() => [TotalCounter], { nullable: true })
	metaCounter: TotalCounter[];
}
