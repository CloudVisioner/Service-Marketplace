import { registerEnumType } from '@nestjs/graphql';

export enum UserRole {
	BUYER = 'BUYER',
	PROVIDER = 'PROVIDER',
	ADMIN = 'ADMIN',
	SUPER_ADMIN = 'SUPER_ADMIN',
	CONTENT_ADMIN = 'CONTENT_ADMIN',
}
registerEnumType(UserRole, {
    name: 'UserRole',
})

export enum UserStatus {
	ACTIVE = 'ACTIVE',
	SUSPENDED = 'SUSPENDED',
	INACTIVE = 'INACTIVE',
	BLOCK = 'BLOCK', // Legacy - use SUSPENDED instead
	DELETE = 'DELETE', // Legacy - use INACTIVE instead
}
registerEnumType(UserStatus, {
    name: 'UserStatus',
})

export enum UserAuthType {
	EMAIL = 'EMAIL',
	PHONE = 'PHONE',
	GOOGLE = 'GOOGLE',
	LINKEDIN = 'LINKEDIN',
}
registerEnumType(UserAuthType, {
	name: 'UserAuthType',
})

export enum UserVerificationStatus {
	UNVERIFIED = 'UNVERIFIED',
	VERIFIED = 'VERIFIED',
	PREMIUM = 'PREMIUM',
}
registerEnumType(UserVerificationStatus, {
	name: 'UserVerificationStatus',
})
