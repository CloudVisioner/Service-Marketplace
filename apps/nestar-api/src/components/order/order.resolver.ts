import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { OrderService } from './order.service';
import { Order } from '../../libs/dto/order/order';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthUser } from '../auth/decorators/authUser.decorator';
import { UserRole } from '../../libs/enums/user.enum';
import { ObjectId } from 'mongoose';
import { shapeIntoMongoObjectId } from '../../libs/config';

@Resolver()
export class OrderResolver {
	constructor(
		private readonly orderService: OrderService,
	) {}

	@Roles(UserRole.BUYER)
	@UseGuards(AuthGuard, RolesGuard)
	@Mutation(() => Order)
	public async cancelOrder(
		@Args('orderId') orderId: string,
		@AuthUser('_id') userId: ObjectId,
	): Promise<Order> {
		console.log('Mutation: cancelOrder');
		const orderIdObj = shapeIntoMongoObjectId(orderId);
		return await this.orderService.cancelOrder(orderIdObj, userId);
	}
}
