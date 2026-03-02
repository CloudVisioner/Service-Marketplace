import { registerEnumType } from '@nestjs/graphql';

export enum NotificationType {
	QUOTE_SENT = 'QUOTE_SENT',
	QUOTE_ACCEPTED = 'QUOTE_ACCEPTED',
}
registerEnumType(NotificationType, {
	name: 'NotificationType',
});
