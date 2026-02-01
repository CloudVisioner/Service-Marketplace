import { registerEnumType } from '@nestjs/graphql';

export enum OrganizationType {
	BUYER = 'BUYER',
	SELLER = 'SELLER',
	BOTH = 'BOTH',
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
