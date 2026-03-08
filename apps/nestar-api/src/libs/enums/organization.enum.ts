import { registerEnumType } from '@nestjs/graphql';

export enum OrganizationType {
	SERVICE_PROVIDER = 'SERVICE_PROVIDER', // Offers services, gets quotes, can be followed/liked
	BUYER = 'BUYER', // Posts ServiceRequests
	PLATFORM_ADMIN = 'PLATFORM_ADMIN', // Platform management
}
registerEnumType(OrganizationType, {
	name: 'OrganizationType',
});

export enum OrganizationStatus {
	ACTIVE = 'ACTIVE',
	INACTIVE = 'INACTIVE',
	PENDING = 'PENDING',
	PENDING_REVIEW = 'PENDING_REVIEW', // Admin-specific: awaiting admin approval
	APPROVED = 'APPROVED', // Admin-specific: approved by admin
	REJECTED = 'REJECTED', // Admin-specific: rejected by admin
	SUSPENDED = 'SUSPENDED', // Admin-specific: suspended by admin
	BLOCKED = 'BLOCKED',
	DELETED = 'DELETED',
}
registerEnumType(OrganizationStatus, {
	name: 'OrganizationStatus',
});
