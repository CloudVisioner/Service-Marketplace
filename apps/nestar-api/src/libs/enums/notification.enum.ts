import { registerEnumType } from '@nestjs/graphql';

export enum NotificationType {
	LIKE = 'LIKE',
	NEW_QUOTE = 'NEW_QUOTE',
	QUOTE_ACCEPTED = 'QUOTE_ACCEPTED',
	QUOTE_REJECTED = 'QUOTE_REJECTED',
	QUOTE_EXPIRED = 'QUOTE_EXPIRED',
	FOLLOW = 'FOLLOW',
}
registerEnumType(NotificationType, {
	name: 'NotificationType',
});

export enum NotificationStatus {
	WAIT = 'WAIT',
	READ = 'READ',
}
registerEnumType(NotificationStatus, {
	name: 'NotificationStatus',
});

export enum NotificationGroup {
	USER = 'USER',
	ORGANIZATION = 'ORGANIZATION',
	SERVICE_REQUEST = 'SERVICE_REQUEST',
	QUOTE = 'QUOTE',
}
registerEnumType(NotificationGroup, {
	name: 'NotificationGroup',
});
