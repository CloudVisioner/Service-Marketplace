import { Field, ObjectType } from '@nestjs/graphql';
import { Quote } from './quote';
import { ServiceRequest } from '../service-request/service-request';
import { Order } from '../order/order';

@ObjectType()
export class AcceptQuoteResponse {
	@Field(() => Quote)
	quote: Quote;

	@Field(() => ServiceRequest)
	serviceRequest: ServiceRequest;

	@Field(() => Order)
	order: Order;
}
