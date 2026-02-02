import { registerEnumType } from '@nestjs/graphql';

export enum UserRole {
	BUYER = 'BUYER',
	PROVIDER = 'PROVIDER',
	ADMIN = 'ADMIN',
}
registerEnumType(UserRole, {
    name: 'UserRole',
})

export enum UserStatus {
	ACTIVE = 'ACTIVE',
	BLOCK = 'BLOCK',
	DELETE = 'DELETE',
}
registerEnumType(UserStatus, {
    name: 'UserStatus',
})
