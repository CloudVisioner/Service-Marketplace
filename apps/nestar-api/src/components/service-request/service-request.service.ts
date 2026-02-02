import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { ServiceRequest, ServiceRequests } from '../../libs/dto/service-request/service-request';
import { ServiceRequestInput, ServiceRequestInquiry } from '../../libs/dto/service-request/service-request.input';
import { ServiceRequestStatus } from '../../libs/enums/service-request.enum';
import { Message } from '../../libs/enums/common.enum';
import { T } from '../../libs/types/common';
import { shapeIntoMongoObjectId } from '../../libs/config';

@Injectable()
export class ServiceRequestService {
	constructor(
		@InjectModel('ServiceRequest') private serviceRequestModel: Model<ServiceRequest>,
		@InjectModel('Organization') private organizationModel: Model<any>,
		@InjectModel('User') private userModel: Model<any>,
	) {}

	public async createServiceRequest(userId: ObjectId, input: ServiceRequestInput): Promise<ServiceRequest> {
		try {
			// Verify the buyer organization exists and belongs to the user
			const org = await this.organizationModel
				.findOne({
					_id: input.reqBuyerOrgId,
					orgOwnerUserId: userId,
				})
				.exec();

			if (!org) {
				throw new BadRequestException('Organization not found or you are not the owner');
			}

			const serviceRequestData = {
				...input,
				reqCreatedByUserId: userId,
				reqStatus: ServiceRequestStatus.OPEN,
				reqTotalLikes: 0,
				reqTotalViews: 0,
				reqTotalQuotes: 0,
			};

			const result = await this.serviceRequestModel.create(serviceRequestData);
			return result;
		} catch (err) {
			console.log('Error, ServiceRequestService.createServiceRequest:', err.message);
			if (err instanceof BadRequestException) throw err;
			throw new BadRequestException(Message.CREATE_FAILED);
		}
	}

	public async getMyServiceRequests(userId: ObjectId, input: ServiceRequestInquiry): Promise<ServiceRequests> {
		const match: T = {
			reqCreatedByUserId: userId,
		};

		if (input.search.reqStatus) {
			match.reqStatus = input.search.reqStatus;
		}

		if (input.search.text) {
			match.$or = [
				{ reqTitle: { $regex: input.search.text, $options: 'i' } },
				{ reqDescription: { $regex: input.search.text, $options: 'i' } },
			];
		}

		const sort: T = { [input?.sort ?? 'createdAt']: -1 };

		const result = await this.serviceRequestModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						list: [
							{ $skip: (input.page - 1) * input.limit },
							{ $limit: input.limit },
							{
								$lookup: {
									from: 'organizations',
									localField: 'reqBuyerOrgId',
									foreignField: '_id',
									as: 'reqBuyerOrgData',
								},
							},
							{
								$unwind: { path: '$reqBuyerOrgData', preserveNullAndEmptyArrays: true },
							},
							{
								$lookup: {
									from: 'users',
									localField: 'reqCreatedByUserId',
									foreignField: '_id',
									as: 'reqCreatedByUserData',
								},
							},
							{
								$unwind: { path: '$reqCreatedByUserData', preserveNullAndEmptyArrays: true },
							},
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();

		if (!result.length) {
			return { list: [], metaCounter: [{ total: 0 }] };
		}

		return result[0];
	}

	public async getServiceRequest(userId: ObjectId | null, requestId: ObjectId): Promise<ServiceRequest> {
		const requestIdObj = shapeIntoMongoObjectId(requestId);

		const result = await this.serviceRequestModel
			.aggregate([
				{ $match: { _id: requestIdObj } },
				{
					$lookup: {
						from: 'organizations',
						localField: 'reqBuyerOrgId',
						foreignField: '_id',
						as: 'reqBuyerOrgData',
					},
				},
				{
					$unwind: { path: '$reqBuyerOrgData', preserveNullAndEmptyArrays: true },
				},
				{
					$lookup: {
						from: 'users',
						localField: 'reqCreatedByUserId',
						foreignField: '_id',
						as: 'reqCreatedByUserData',
					},
				},
				{
					$unwind: { path: '$reqCreatedByUserData', preserveNullAndEmptyArrays: true },
				},
				{
					$lookup: {
						from: 'quotes',
						localField: '_id',
						foreignField: 'quoteServiceReqId',
						as: 'quotes',
						pipeline: [
							{
								$lookup: {
									from: 'organizations',
									localField: 'quoteProviderOrgId',
									foreignField: '_id',
									as: 'quoteProviderOrgData',
								},
							},
							{
								$unwind: { path: '$quoteProviderOrgData', preserveNullAndEmptyArrays: true },
							},
							{
								$lookup: {
									from: 'users',
									localField: 'quoteCreatedByUserId',
									foreignField: '_id',
									as: 'quoteCreatedByUserData',
								},
							},
							{
								$unwind: { path: '$quoteCreatedByUserData', preserveNullAndEmptyArrays: true },
							},
							{ $sort: { createdAt: -1 } },
						],
					},
				},
			])
			.exec();

		if (!result.length) {
			throw new InternalServerErrorException(Message.NO_DATA_FOUND);
		}

		return result[0];
	}

	public async getAllServiceRequests(input: ServiceRequestInquiry): Promise<ServiceRequests> {
		const match: T = {};

		if (input.search.reqStatus) {
			match.reqStatus = input.search.reqStatus;
		}

		if (input.search.reqBuyerOrgId) {
			match.reqBuyerOrgId = shapeIntoMongoObjectId(input.search.reqBuyerOrgId);
		}

		if (input.search.text) {
			match.$or = [
				{ reqTitle: { $regex: input.search.text, $options: 'i' } },
				{ reqDescription: { $regex: input.search.text, $options: 'i' } },
			];
		}

		const sort: T = { [input?.sort ?? 'createdAt']: -1 };

		const result = await this.serviceRequestModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						list: [
							{ $skip: (input.page - 1) * input.limit },
							{ $limit: input.limit },
							{
								$lookup: {
									from: 'organizations',
									localField: 'reqBuyerOrgId',
									foreignField: '_id',
									as: 'reqBuyerOrgData',
								},
							},
							{
								$unwind: { path: '$reqBuyerOrgData', preserveNullAndEmptyArrays: true },
							},
							{
								$lookup: {
									from: 'users',
									localField: 'reqCreatedByUserId',
									foreignField: '_id',
									as: 'reqCreatedByUserData',
								},
							},
							{
								$unwind: { path: '$reqCreatedByUserData', preserveNullAndEmptyArrays: true },
							},
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();

		if (!result.length) {
			return { list: [], metaCounter: [{ total: 0 }] };
		}

		return result[0];
	}

	public async updateServiceRequestStatus(requestId: ObjectId, status: ServiceRequestStatus): Promise<ServiceRequest> {
		const requestIdObj = shapeIntoMongoObjectId(requestId);

		const result = await this.serviceRequestModel
			.findByIdAndUpdate(
				requestIdObj,
				{ reqStatus: status },
				{
					new: true,
				},
			)
			.exec();

		if (!result) {
			throw new InternalServerErrorException(Message.UPDATE_FAILED);
		}

		return result;
	}
}
