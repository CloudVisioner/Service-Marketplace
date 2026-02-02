import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const AuthUser = createParamDecorator((data: string, context: ExecutionContext | any) => {
	let request: any;
	if (context.contextType === 'graphql') {
		request = context.getArgByIndex(2).req;
		if (request.body.authUser) {
			request.body.authUser.authorization = request.headers?.authorization;
		}
	} else request = context.switchToHttp().getRequest();

	const user = request.body.authUser;

	if (user) return data ? user?.[data] : user;
	else return null;
});
