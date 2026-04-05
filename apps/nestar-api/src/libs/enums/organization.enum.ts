import { registerEnumType } from '@nestjs/graphql';

export enum OrganizationType {
	SERVICE_PROVIDER = 'SERVICE_PROVIDER',
	BUYER = 'BUYER',
	PLATFORM_ADMIN = 'PLATFORM_ADMIN',
}
registerEnumType(OrganizationType, {
	name: 'OrganizationType',
});

export enum OrganizationStatus {
	ACTIVE = 'ACTIVE',
	INACTIVE = 'INACTIVE',
	PENDING = 'PENDING',
	PENDING_REVIEW = 'PENDING_REVIEW',
	APPROVED = 'APPROVED',
	REJECTED = 'REJECTED',
	SUSPENDED = 'SUSPENDED',
	BLOCKED = 'BLOCKED',
	DELETED = 'DELETED',
}
registerEnumType(OrganizationStatus, {
	name: 'OrganizationStatus',
});
