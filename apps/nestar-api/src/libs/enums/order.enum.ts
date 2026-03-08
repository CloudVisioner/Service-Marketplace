import { registerEnumType } from '@nestjs/graphql';

export enum OrderStatus {
	NEW = 'NEW',
	PENDING_PAYMENT = 'PENDING_PAYMENT',
	PAID = 'PAID',
	IN_PROGRESS = 'IN_PROGRESS',
	ACTIVE = 'ACTIVE', // Alias for IN_PROGRESS (admin dashboard uses this)
	COMPLETED = 'COMPLETED',
	CANCELLED = 'CANCELLED',
	DISPUTE = 'DISPUTE', // Admin: Order in dispute
}
registerEnumType(OrderStatus, {
	name: 'OrderStatus',
});
