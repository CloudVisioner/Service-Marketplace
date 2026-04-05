import { CanActivate, ExecutionContext, Injectable, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from '../auth.service';
import { UserRole } from '../../../libs/enums/user.enum';
import { Message } from '../../../libs/enums/common.enum';

@Injectable()
export class AdminGuard implements CanActivate {
	constructor(
		private reflector: Reflector,
		private authService: AuthService,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const requiredRoles = this.reflector.get<UserRole[]>('roles', context.getHandler());
		const adminRoles = [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.CONTENT_ADMIN];

		console.info(`--- AdminGuard: Checking admin access ---`);

		const contextType = context.getType<'graphql' | 'http' | 'rpc'>();

		if (contextType === 'graphql') {
			const request = (context as any).getArgByIndex(2).req;
			const bearerToken = request.headers.authorization;

			if (!bearerToken) {
				throw new UnauthorizedException(Message.TOKEN_NOT_EXIST);
			}

			const token = bearerToken.split(' ')[1];

			try {
				const authUser = await this.authService.verifyUserToken(token);

				if (!authUser) {
					throw new UnauthorizedException(Message.NOT_AUTHENTICATED);
				}

				const userRole = authUser.userRole as UserRole;
				const hasAdminRole = adminRoles.includes(userRole);

				if (!hasAdminRole) {
					throw new ForbiddenException('Admin access required');
				}

				if (requiredRoles && requiredRoles.length > 0) {
					const hasRequiredRole = requiredRoles.includes(userRole);
					if (!hasRequiredRole) {
						throw new ForbiddenException(`Required role: ${requiredRoles.join(' or ')}`);
					}
				}

				if (requiredRoles?.includes(UserRole.SUPER_ADMIN) && userRole !== UserRole.SUPER_ADMIN) {
					throw new ForbiddenException('Super admin access required');
				}

				request.body.authUser = authUser;
				return true;
			} catch (err) {
				if (err instanceof ForbiddenException || err instanceof UnauthorizedException) {
					throw err;
				}
				throw new UnauthorizedException(err.message || Message.NOT_AUTHENTICATED);
			}
		}

		return false;
	}
}
