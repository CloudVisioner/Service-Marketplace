import { registerEnumType } from '@nestjs/graphql';

export enum LikeGroup {
	USER = 'USER',
	ORGANIZATION = 'ORGANIZATION',
	SERVICE_REQUEST = 'SERVICE_REQUEST',
	QUOTE = 'QUOTE',
	MEMBER = 'MEMBER', // Legacy support
}
registerEnumType(LikeGroup, {
	name: 'LikeGroup',
});
