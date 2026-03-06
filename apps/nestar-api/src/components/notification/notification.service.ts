import { BadRequestException, Injectable, InternalServerErrorException, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Notification, Notifications } from '../../libs/dto/notification/notification';
import { NotificationInput, NotificationInquiry } from '../../libs/dto/notification/notification.input';
import { Message } from '../../libs/enums/common.enum';
import { NotificationType } from '../../libs/enums/notification.enum';
import { T } from '../../libs/types/common';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { SocketGateway } from '../../socket/socket.gateway';

@Injectable()
export class NotificationService {
	// Valid notification types for MongoDB queries
	private readonly validNotificationTypes = [NotificationType.QUOTE_SENT, NotificationType.QUOTE_ACCEPTED];

	constructor(
		@InjectModel('Notification') private notificationModel: Model<Notification>,
		@Inject(forwardRef(() => SocketGateway)) private socketGateway: SocketGateway,
	) {}

	public async createNotification(input: NotificationInput): Promise<Notification> {
		try {
			const notificationData = {
				...input,
				read: false,
			};

			const result = await this.notificationModel.create(notificationData);

			// Emit real-time notification via WebSocket
			try {
				this.socketGateway.emitNotification(input.receiverUserId.toString(), {
					_id: result._id,
					type: result.type,
					message: result.message,
					read: result.read,
					createdAt: result.createdAt,
				});
			} catch (err) {
				console.log('WebSocket emit error:', err.message);
			}

			return result;
		} catch (err) {
			console.log('Error, NotificationService.createNotification:', err.message);
			throw new InternalServerErrorException(Message.CREATE_FAILED);
		}
	}

	/**
	 * Get user notifications (works for both BUYER and PROVIDER roles)
	 * Filters notifications by receiverUserId, which is user-based, not role-based
	 * 
	 * Notification types:
	 * - QUOTE_SENT: Sent to buyers when providers submit quotes
	 * - QUOTE_ACCEPTED: Sent to providers when buyers accept their quotes
	 */
	public async getUserNotifications(userId: ObjectId, input: NotificationInquiry): Promise<Notifications> {
		const match: T = {
			receiverUserId: userId,
		};

		// Filter by read status if provided
		if (input.search.read !== undefined && input.search.read !== null) {
			match.read = input.search.read;
		}

		// Filter by type - if specific type requested, use it; otherwise filter valid types only
		if (input.search.type && this.validNotificationTypes.includes(input.search.type)) {
			match.type = input.search.type;
		} else {
			// Filter out notifications with null or invalid type values
			match.type = { $exists: true, $ne: null, $in: this.validNotificationTypes };
		}

		const sort: T = { createdAt: -1 };
		const validTypes = this.validNotificationTypes;

		console.log('NotificationService.getUserNotifications - userId:', userId.toString());
		console.log('NotificationService.getUserNotifications - match filter:', JSON.stringify(match, null, 2));
		console.log('NotificationService.getUserNotifications - input:', JSON.stringify(input, null, 2));

		const result = await this.notificationModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						list: [
							{ $skip: (input.page - 1) * input.limit },
							{ $limit: input.limit },
							{
								// Ensure type is always valid, default to QUOTE_SENT if somehow null
								$addFields: {
									type: {
										$cond: {
											if: { $or: [{ $eq: ['$type', null] }, { $not: { $in: ['$type', validTypes] } }] },
											then: NotificationType.QUOTE_SENT,
											else: '$type',
										},
									},
								},
							},
							{
								$lookup: {
									from: 'users',
									localField: 'senderUserId',
									foreignField: '_id',
									as: 'senderUserData',
								},
							},
							{
								$unwind: { path: '$senderUserData', preserveNullAndEmptyArrays: true },
							},
							{
								$lookup: {
									from: 'users',
									localField: 'receiverUserId',
									foreignField: '_id',
									as: 'receiverUserData',
								},
							},
							{
								$unwind: { path: '$receiverUserData', preserveNullAndEmptyArrays: true },
							},
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();

		console.log('NotificationService.getUserNotifications - result count:', result.length);
		if (result.length && result[0].list) {
			console.log('NotificationService.getUserNotifications - notifications found:', result[0].list.length);
			console.log('NotificationService.getUserNotifications - total count:', result[0].metaCounter?.[0]?.total || 0);
		}

		if (!result.length) {
			return { list: [], metaCounter: [{ total: 0 }] };
		}

		return result[0];
	}

	public async markAsRead(notificationId: ObjectId, userId: ObjectId): Promise<Notification> {
		const notificationIdObj = shapeIntoMongoObjectId(notificationId);

		// First check if notification exists
		const notification = await this.notificationModel.findById(notificationIdObj).exec();
		
		if (!notification) {
			throw new BadRequestException('Notification not found.');
		}

		// Check if notification has valid type, fix if needed
		if (!notification.type || !this.validNotificationTypes.includes(notification.type as NotificationType)) {
			// Update notification with default type
			await this.notificationModel.findByIdAndUpdate(
				notificationIdObj,
				{ type: NotificationType.QUOTE_SENT },
			).exec();
			notification.type = NotificationType.QUOTE_SENT;
		}

		// Check if user is the receiver
		if (notification.receiverUserId.toString() !== userId.toString()) {
			throw new BadRequestException('You can only mark your own notifications as read.');
		}

		// Check if already read
		if (notification.read === true) {
			throw new BadRequestException('This notification is already marked as read.');
		}

		const result = await this.notificationModel
			.findByIdAndUpdate(
				notificationIdObj,
				{ read: true },
				{ new: true },
			)
			.exec();

		if (!result) {
			throw new InternalServerErrorException(Message.UPDATE_FAILED);
		}

		// Ensure result has valid type
		if (!result.type || !this.validNotificationTypes.includes(result.type as NotificationType)) {
			result.type = NotificationType.QUOTE_SENT;
		}

		return result;
	}

	public async markAllAsRead(userId: ObjectId): Promise<number> {
		const result = await this.notificationModel
			.updateMany(
				{
					receiverUserId: userId,
					read: false,
				},
				{ read: true },
			)
			.exec();

		return result.modifiedCount;
	}

	public async getUnreadCount(userId: ObjectId, input?: NotificationInquiry): Promise<number> {
		const match: T = {
			receiverUserId: userId,
			read: false,
		};

		// Filter by type - if specific type requested, use it; otherwise filter valid types only
		if (input?.search?.type && this.validNotificationTypes.includes(input.search.type)) {
			match.type = input.search.type;
		} else {
			// Filter out notifications with null or invalid type values
			match.type = { $exists: true, $ne: null, $in: this.validNotificationTypes };
		}

		console.log('NotificationService.getUnreadCount - userId:', userId.toString());
		console.log('NotificationService.getUnreadCount - match filter:', JSON.stringify(match, null, 2));

		const count = await this.notificationModel.countDocuments(match).exec();

		console.log('NotificationService.getUnreadCount - count:', count);

		return count;
	}

	/**
	 * Delete a single notification
	 * Only allows users to delete their own notifications
	 */
	public async deleteNotification(notificationId: ObjectId, userId: ObjectId): Promise<Notification> {
		const notificationIdObj = shapeIntoMongoObjectId(notificationId);

		// First check if notification exists
		const notification = await this.notificationModel.findById(notificationIdObj).exec();
		
		if (!notification) {
			throw new BadRequestException('Notification not found.');
		}

		// Check if user is the receiver (only allow deleting own notifications)
		if (notification.receiverUserId.toString() !== userId.toString()) {
			throw new BadRequestException('You can only delete your own notifications.');
		}

		// Delete the notification
		const deletedNotification = await this.notificationModel.findByIdAndDelete(notificationIdObj).exec();

		if (!deletedNotification) {
			throw new InternalServerErrorException(Message.REMOVE_FAILED);
		}

		console.log('NotificationService.deleteNotification - deleted notification ID:', deletedNotification._id.toString());

		return deletedNotification;
	}

	/**
	 * Delete all notifications for a user
	 * Only deletes notifications where the user is the receiver
	 */
	public async deleteAllNotifications(userId: ObjectId): Promise<number> {
		const result = await this.notificationModel
			.deleteMany({
				receiverUserId: userId,
			})
			.exec();

		console.log('NotificationService.deleteAllNotifications - userId:', userId.toString());
		console.log('NotificationService.deleteAllNotifications - deleted count:', result.deletedCount);

		return result.deletedCount;
	}
}
