import { BadRequestException, CanActivate, ExecutionContext, Injectable, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from '../auth.service';
import { Message } from 'apps/nestar-api/src/libs/enums/common.enum';

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(
		private reflector: Reflector,
		private authService: AuthService,
	) {}

	async canActivate(context: ExecutionContext | any): Promise<boolean> {
		const roles = this.reflector.get<string[]>('roles', context.getHandler());
		if (!roles) return true;

		console.info(`--- @guard() Authentication [RolesGuard]: ${roles} ---`);

		if (context.contextType === 'graphql') {
			const request = context.getArgByIndex(2).req;
			const bearerToken = request.headers.authorization;
			if (!bearerToken) throw new BadRequestException(Message.TOKEN_NOT_EXIST);

			const token = bearerToken.split(' ')[1];
			
			try {
				const authUser = await this.authService.verifyUserToken(token);
				
				// Convert roles array to strings for comparison (handles enum values)
				const roleStrings = roles.map(role => String(role));
				const userRoleString = String(authUser.userRole);
				
				const hasRole = roleStrings.includes(userRoleString);
				
				console.log('RolesGuard - Required roles:', roleStrings);
				console.log('RolesGuard - User role:', userRoleString);
				console.log('RolesGuard - Has permission:', hasRole);

				if (!authUser || !hasRole) {
					console.error('Token verification failed in RolesGuard: Allowed only for members with specific roles!');
					throw new ForbiddenException(Message.ONLY_SPECIFIC_ROLES_ALLOWED);
				}

				console.log('userNick[roles] =>', authUser.userNick);
				request.body.authUser = authUser;
				return true;
			} catch (err) {
				console.error('Token verification failed in RolesGuard:', err.message);
				throw new UnauthorizedException(err.message || Message.NOT_AUTHENTICATED);
			}
		}
	
		// description => http, rpc, gprs and etc are ignored
	}
}
