import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { Notification, Notifications } from '../../libs/dto/notification/notification';
import { NotificationInquiry } from '../../libs/dto/notification/notification.input';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthUser } from '../auth/decorators/authUser.decorator';
import { ObjectId } from 'mongoose';
import { shapeIntoMongoObjectId } from '../../libs/config';

@Resolver()
export class NotificationResolver {
	constructor(private readonly notificationService: NotificationService) {}

	@UseGuards(AuthGuard)
	@Query(() => Notifications)
	public async getMyNotifications(
		@Args('input') input: NotificationInquiry,
		@AuthUser('_id') userId: ObjectId,
	): Promise<Notifications> {
		console.log('Query: getMyNotifications');
		return await this.notificationService.getUserNotifications(userId, input);
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Notification)
	public async markNotificationAsRead(
		@Args('notificationId') notificationId: string,
		@AuthUser('_id') userId: ObjectId,
	): Promise<Notification> {
		console.log('Mutation: markNotificationAsRead');
		const notificationIdObj = shapeIntoMongoObjectId(notificationId);
		return await this.notificationService.markAsRead(notificationIdObj, userId);
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Number)
	public async markAllNotificationsAsRead(@AuthUser('_id') userId: ObjectId): Promise<number> {
		console.log('Mutation: markAllNotificationsAsRead');
		return await this.notificationService.markAllAsRead(userId);
	}

	@UseGuards(AuthGuard)
	@Query(() => Number)
	public async getUnreadNotificationCount(
		@Args('input', { nullable: true }) input: NotificationInquiry,
		@AuthUser('_id') userId: ObjectId,
	): Promise<number> {
		console.log('Query: getUnreadNotificationCount');
		return await this.notificationService.getUnreadCount(userId, input);
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Notification)
	public async deleteNotification(
		@Args('notificationId') notificationId: string,
		@AuthUser('_id') userId: ObjectId,
	): Promise<Notification> {
		console.log('Mutation: deleteNotification');
		const notificationIdObj = shapeIntoMongoObjectId(notificationId);
		return await this.notificationService.deleteNotification(notificationIdObj, userId);
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Number)
	public async deleteAllNotifications(@AuthUser('_id') userId: ObjectId): Promise<number> {
		console.log('Mutation: deleteAllNotifications');
		return await this.notificationService.deleteAllNotifications(userId);
	}
}
