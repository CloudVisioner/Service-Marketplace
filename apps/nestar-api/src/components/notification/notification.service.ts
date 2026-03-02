import { BadRequestException, Injectable, InternalServerErrorException, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Notification, Notifications } from '../../libs/dto/notification/notification';
import { NotificationInput, NotificationInquiry } from '../../libs/dto/notification/notification.input';
import { Message } from '../../libs/enums/common.enum';
import { T } from '../../libs/types/common';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { SocketGateway } from '../../socket/socket.gateway';

@Injectable()
export class NotificationService {
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

	public async getUserNotifications(userId: ObjectId, input: NotificationInquiry): Promise<Notifications> {
		const match: T = {
			receiverUserId: userId,
		};

		if (input.search.read !== undefined) {
			match.read = input.search.read;
		}

		if (input.search.type) {
			match.type = input.search.type;
		}

		const sort: T = { createdAt: -1 };

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

		// Apply search filters if provided
		if (input?.search) {
			if (input.search.type) {
				match.type = input.search.type;
			}
		}

		const count = await this.notificationModel.countDocuments(match).exec();

		return count;
	}
}
