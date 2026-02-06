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
	BLOCKED = 'BLOCKED',
	DELETED = 'DELETED',
}
registerEnumType(OrganizationStatus, {
	name: 'OrganizationStatus',
});
