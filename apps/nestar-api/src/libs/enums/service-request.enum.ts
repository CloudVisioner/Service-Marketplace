import { registerEnumType } from '@nestjs/graphql';

export enum ServiceRequestStatus {
	DRAFT = 'DRAFT',
	OPEN = 'OPEN',
	ACTIVE = 'ACTIVE',
	COMPLETED = 'COMPLETED',
	CLOSED = 'CLOSED',
	CANCELLED = 'CANCELLED',
}
registerEnumType(ServiceRequestStatus, {
	name: 'ServiceRequestStatus',
});

export enum Urgency {
	NORMAL = 'NORMAL',
	URGENT = 'URGENT',
	CRITICAL = 'CRITICAL',
}
registerEnumType(Urgency, {
	name: 'Urgency',
});
