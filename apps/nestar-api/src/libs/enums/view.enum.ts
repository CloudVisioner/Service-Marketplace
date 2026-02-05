import { registerEnumType } from '@nestjs/graphql';

export enum ViewGroup {
	USER = 'USER',
	ORGANIZATION = 'ORGANIZATION',
	SERVICE_REQUEST = 'SERVICE_REQUEST',
	QUOTE = 'QUOTE',
}
registerEnumType(ViewGroup, {
	name: 'ViewGroup',
});
