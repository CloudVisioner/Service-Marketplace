import { BadRequestException, CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { Message } from 'apps/nestar-api/src/libs/enums/common.enum';

@Injectable()
export class AuthGuard implements CanActivate {
	constructor(private authService: AuthService) {}

	async canActivate(context: ExecutionContext | any): Promise<boolean> {
		console.info('--- @guard() Authentication [AuthGuard] ---');

		const contextType = context.getType();

		// Support both GraphQL and HTTP endpoints
		let request: any;
		if (contextType === 'graphql') {
			request = context.getArgByIndex(2).req;
		} else if (contextType === 'http') {
			request = context.switchToHttp().getRequest();
		} else {
			// For other transport types, skip auth by this guard
			return true;
		}

		const bearerToken = request.headers.authorization;
		console.log('AuthGuard - Authorization header:', bearerToken);

		if (!bearerToken) {
			throw new BadRequestException(Message.TOKEN_NOT_EXIST);
		}

		const token = bearerToken.split(' ')[1];

		try {
			const authUser = await this.authService.verifyUserToken(token);
			if (!authUser) {
				throw new UnauthorizedException(Message.NOT_AUTHENTICATED);
			}

			console.log('userNick[auth] =>', authUser.userNick);
			request.body.authUser = authUser;

			return true;
		} catch (err) {
			console.error('Token verification failed:', err.message);
			throw new UnauthorizedException(err.message || Message.NOT_AUTHENTICATED);
		}
	}
}
