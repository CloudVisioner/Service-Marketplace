import { registerEnumType } from '@nestjs/graphql';

export enum ServiceRequestStatus {
	DRAFT = 'DRAFT',
	PUBLISHED = 'PUBLISHED',
	OPEN = 'OPEN',
	IN_PROGRESS = 'IN_PROGRESS',
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
