import { registerEnumType } from '@nestjs/graphql';

export enum QuoteStatus {
	PENDING = 'PENDING',
	ACCEPTED = 'ACCEPTED',
	REJECTED = 'REJECTED',
	EXPIRED = 'EXPIRED',
	CANCELLED = 'CANCELLED',
	DELETED = 'DELETED', // Admin: Hard deleted
}
registerEnumType(QuoteStatus, {
	name: 'QuoteStatus',
});
