import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { QuoteService } from './quote.service';
import { Quote } from '../../libs/dto/quote/quote';
import { QuoteInput } from '../../libs/dto/quote/quote.input';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthUser } from '../auth/decorators/authUser.decorator';
import { UserRole } from '../../libs/enums/user.enum';
import { ObjectId } from 'mongoose';
import { shapeIntoMongoObjectId } from '../../libs/config';

@Resolver()
export class QuoteResolver {
	constructor(
		private readonly quoteService: QuoteService,
	) {}

	@Roles(UserRole.PROVIDER)
	@UseGuards(AuthGuard, RolesGuard)
	@Mutation(() => Quote)
	public async createQuote(
		@Args('orgId') orgId: string,
		@Args('input') input: QuoteInput,
		@AuthUser('_id') userId: ObjectId,
	): Promise<Quote> {
		console.log('Mutation: createQuote');
		const orgIdObj = shapeIntoMongoObjectId(orgId);
		return await this.quoteService.createQuote(orgIdObj, userId, input);
	}

	@Roles(UserRole.BUYER)
	@UseGuards(AuthGuard, RolesGuard)
	@Mutation(() => Quote)
	public async acceptQuote(
		@Args('quoteId') quoteId: string,
		@AuthUser('_id') userId: ObjectId,
	): Promise<Quote> {
		console.log('Mutation: acceptQuote');
		const quoteIdObj = shapeIntoMongoObjectId(quoteId);
		return await this.quoteService.acceptQuote(quoteIdObj, userId);
	}

	@Roles(UserRole.BUYER)
	@UseGuards(AuthGuard, RolesGuard)
	@Mutation(() => Quote)
	public async rejectQuote(
		@Args('quoteId') quoteId: string,
		@AuthUser('_id') userId: ObjectId,
	): Promise<Quote> {
		console.log('Mutation: rejectQuote');
		const quoteIdObj = shapeIntoMongoObjectId(quoteId);
		return await this.quoteService.rejectQuote(quoteIdObj, userId);
	}

	@UseGuards(AuthGuard)
	@Query(() => [Quote])
	public async getQuotesByRequest(
		@Args('requestId') requestId: string,
		@AuthUser('_id') userId: ObjectId,
	): Promise<Quote[]> {
		console.log('Query: getQuotesByRequest');
		const requestIdObj = shapeIntoMongoObjectId(requestId);
		return await this.quoteService.getQuotesByRequest(requestIdObj, userId);
	}

	@Roles(UserRole.PROVIDER)
	@UseGuards(AuthGuard, RolesGuard)
	@Query(() => [Quote])
	public async getQuotesByOrganization(
		@Args('orgId') orgId: string,
		@AuthUser('_id') userId: ObjectId,
	): Promise<Quote[]> {
		console.log('Query: getQuotesByOrganization');
		const orgIdObj = shapeIntoMongoObjectId(orgId);
		return await this.quoteService.getQuotesByOrganization(orgIdObj);
	}

}
