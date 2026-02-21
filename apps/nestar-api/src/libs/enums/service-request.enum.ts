import { registerEnumType } from '@nestjs/graphql';

export enum ServiceRequestStatus {
	DRAFT = 'DRAFT',        // Editing/private
	OPEN = 'OPEN',          // Published ✓ Quotes ✓ Editable
	ACTIVE = 'ACTIVE',      // Quote accepted → Work
	COMPLETED = 'COMPLETED', // Delivered
	CLOSED = 'CLOSED',      // Done/paid
	CANCELLED = 'CANCELLED', // Killed
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
