import { Field, Int, ObjectType } from '@nestjs/graphql';
import mongoose from 'mongoose';
import { NotificationType, NotificationStatus, NotificationGroup } from '../../enums/notification.enum';
import { User } from '../user/user';
import { Organization } from '../organization/organization';
import { ServiceRequest } from '../service-request/service-request';
import { TotalCounter } from '../common/common';

@ObjectType()
export class Notification {
	@Field(() => String)
	_id: mongoose.ObjectId;

	@Field(() => NotificationType)
	notificationType: NotificationType;

	@Field(() => NotificationStatus)
	notificationStatus: NotificationStatus;

	@Field(() => NotificationGroup)
	notificationGroup: NotificationGroup;

	@Field(() => String)
	notificationTitle: string;

	@Field(() => String, { nullable: true })
	notificationDesc?: string;

	@Field(() => String)
	senderUserId: mongoose.ObjectId;

	@Field(() => String)
	receiverUserId: mongoose.ObjectId;

	@Field(() => String)
	organizationId: mongoose.ObjectId;

	@Field(() => String)
	serviceRequestId: mongoose.ObjectId;

	@Field(() => Date)
	createdAt: Date;

	@Field(() => Date)
	updatedAt: Date;

	/** from aggregation **/
	@Field(() => User, { nullable: true })
	senderUserData?: User;

	@Field(() => User, { nullable: true })
	receiverUserData?: User;

	@Field(() => Organization, { nullable: true })
	organizationData?: Organization;

	@Field(() => ServiceRequest, { nullable: true })
	serviceRequestData?: ServiceRequest;
}

@ObjectType()
export class Notifications {
	@Field(() => [Notification])
	list: Notification[];

	@Field(() => [TotalCounter], { nullable: true })
	metaCounter: TotalCounter[];
}
