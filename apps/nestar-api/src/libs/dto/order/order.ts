import { Field, ObjectType } from '@nestjs/graphql';
import mongoose from 'mongoose';
import { OrderStatus } from '../../enums/order.enum';
import { Organization } from '../organization/organization';
import { ServiceRequest } from '../service-request/service-request';
import { Quote } from '../quote/quote';
import { User } from '../user/user';

@ObjectType()
export class Order {
	@Field(() => String)
	_id: mongoose.ObjectId;

	@Field(() => String)
	orderBuyerOrgId: mongoose.ObjectId;

	@Field(() => String)
	orderProviderOrgId: mongoose.ObjectId;

	@Field(() => String)
	orderServiceReqId: mongoose.ObjectId;

	@Field(() => String)
	orderQuoteId: mongoose.ObjectId;

	@Field(() => String)
	orderCreatedByUserId: mongoose.ObjectId;

	@Field(() => OrderStatus)
	orderStatus: OrderStatus;

	@Field(() => Number)
	orderAmount: number;

	@Field(() => String, { nullable: true })
	adminNotes?: string;

	@Field(() => Date)
	createdAt: Date;

	@Field(() => Date)
	updatedAt: Date;

	/** from aggregation **/
	@Field(() => Organization, { nullable: true })
	orderBuyerOrgData?: Organization;

	@Field(() => Organization, { nullable: true })
	orderProviderOrgData?: Organization;

	@Field(() => ServiceRequest, { nullable: true })
	orderServiceReqData?: ServiceRequest;

	@Field(() => Quote, { nullable: true })
	orderQuoteData?: Quote;

	@Field(() => User, { nullable: true })
	orderCreatedByUserData?: User;
}
