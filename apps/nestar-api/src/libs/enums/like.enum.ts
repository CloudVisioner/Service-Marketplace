import { registerEnumType } from '@nestjs/graphql';

export enum LikeGroup {
	ORGANIZATION = 'ORGANIZATION',
}
registerEnumType(LikeGroup, {
	name: 'LikeGroup',
});
