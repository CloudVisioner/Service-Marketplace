import { Schema } from 'mongoose';
import { NotificationType } from '../libs/enums/notification.enum';

const NotificationSchema = new Schema(
	{
		type: {
			type: String,
			enum: NotificationType,
			required: true,
		},

		message: {
			type: String,
			required: true,
		},

		read: {
			type: Boolean,
			default: false,
		},

		relatedQuoteId: {
			type: Schema.Types.ObjectId,
			ref: 'Quote',
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
	},
	{ timestamps: true, collection: 'notifications' },
);

export default NotificationSchema;
