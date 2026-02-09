import { registerEnumType } from '@nestjs/graphql';

export enum OrderStatus {
	NEW = 'NEW',
	PENDING_PAYMENT = 'PENDING_PAYMENT',
	PAID = 'PAID',
	IN_PROGRESS = 'IN_PROGRESS',
	COMPLETED = 'COMPLETED',
	CANCELLED = 'CANCELLED',
}
registerEnumType(OrderStatus, {
	name: 'OrderStatus',
});
