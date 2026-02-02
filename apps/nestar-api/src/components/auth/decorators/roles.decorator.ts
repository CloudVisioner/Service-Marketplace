import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../../libs/enums/user.enum';

/**
 * Type-safe roles decorator that accepts UserRole enum values
 * 
 * @example
 * @Roles(UserRole.BUYER)
 * @Roles(UserRole.PROVIDER, UserRole.ADMIN)
 */
export const Roles = (...roles: UserRole[]): ReturnType<typeof SetMetadata> => {
	// Extract string values from enum (enum values are already strings)
	const roleValues: string[] = roles.map(role => role as string);
	return SetMetadata('roles', roleValues);
};


