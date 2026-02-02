import { Schema } from 'mongoose';
import { NotificationGroup, NotificationStatus, NotificationType } from '../libs/enums/notification.enum';

const NotificationSchema = new Schema(
	{
		notificationType: {
			type: String,
			enum: NotificationType,
			required: true,
		},

		notificationStatus: {
			type: String,
			enum: NotificationStatus,
			default: NotificationStatus.WAIT,
		},

		notificationGroup: {
			type: String,
			enum: NotificationGroup,
			required: true,
		},

		notificationTitle: {
			type: String,
			required: true,
		},

		notificationDesc: {
			type: String,
		},

		senderUserId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'User',
		},

		receiverUserId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'User',
		},

		organizationId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'Organization',
		},

		serviceRequestId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'ServiceRequest',
		},
	},
	{ timestamps: true, collection: 'notifications' },
);

export default NotificationSchema;
