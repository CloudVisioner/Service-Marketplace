import { registerEnumType } from '@nestjs/graphql';

export enum ServiceRequestStatus {
	DRAFT = 'DRAFT',
	OPEN = 'OPEN',
	IN_PROGRESS = 'IN_PROGRESS',
	CLOSED = 'CLOSED',
	CANCELLED = 'CANCELLED',
}
registerEnumType(ServiceRequestStatus, {
	name: 'ServiceRequestStatus',
});
