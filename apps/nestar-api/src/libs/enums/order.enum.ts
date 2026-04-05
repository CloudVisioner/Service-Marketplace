import { registerEnumType } from '@nestjs/graphql';

export enum OrderStatus {
	NEW = 'NEW',
	PENDING_PAYMENT = 'PENDING_PAYMENT',
	PAID = 'PAID',
	IN_PROGRESS = 'IN_PROGRESS',
	ACTIVE = 'ACTIVE',
	COMPLETED = 'COMPLETED',
	CANCELLED = 'CANCELLED',
	DISPUTE = 'DISPUTE',
}
registerEnumType(OrderStatus, {
	name: 'OrderStatus',
});
