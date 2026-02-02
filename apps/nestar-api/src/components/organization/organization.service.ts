import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Organization, Organizations } from '../../libs/dto/organization/organization';
import { OrganizationInput, OrganizationInquiry } from '../../libs/dto/organization/organization.input';
import { Message } from '../../libs/enums/common.enum';
import { T } from '../../libs/types/common';
import { shapeIntoMongoObjectId } from '../../libs/config';

@Injectable()
export class OrganizationService {
	constructor(
		@InjectModel('Organization') private organizationModel: Model<Organization>,
		@InjectModel('User') private userModel: Model<any>,
	) {}

	public async createOrganization(userId: ObjectId, input: OrganizationInput): Promise<Organization> {
		try {
			// Remove orgOwnerUserId from input if it exists (it's set automatically from authenticated user)
			const { orgOwnerUserId, ...cleanInput } = input as any;
			
			const orgData = {
				...cleanInput,
				orgOwnerUserId: userId,
			};

			const result = await this.organizationModel.create(orgData);
			return result;
		} catch (err) {
			console.log('Error, OrganizationService.createOrganization:', err.message);
			throw new BadRequestException(err.message || Message.CREATE_FAILED);
		}
	}

	public async getOrganization(orgId: ObjectId): Promise<Organization> {
		const orgIdObj = shapeIntoMongoObjectId(orgId);

		const result = await this.organizationModel
			.aggregate([
				{ $match: { _id: orgIdObj } },
				{
					$lookup: {
						from: 'users',
						localField: 'orgOwnerUserId',
						foreignField: '_id',
						as: 'orgOwnerData',
					},
				},
				{
					$unwind: { path: '$orgOwnerData', preserveNullAndEmptyArrays: true },
				},
			])
			.exec();

		if (!result.length) {
			throw new InternalServerErrorException(Message.NO_DATA_FOUND);
		}

		return result[0];
	}

	public async getOrganizations(input: OrganizationInquiry): Promise<Organizations> {
		const match: T = {};

		if (input.text) {
			match.$or = [
				{ orgName: { $regex: input.text, $options: 'i' } },
				{ orgDescription: { $regex: input.text, $options: 'i' } },
				{ orgCountry: { $regex: input.text, $options: 'i' } },
				{ orgCity: { $regex: input.text, $options: 'i' } },
			];
		}

		const sort: T = { [input?.sort ?? 'createdAt']: -1 };

		const result = await this.organizationModel
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
									from: 'users',
									localField: 'orgOwnerUserId',
									foreignField: '_id',
									as: 'orgOwnerData',
								},
							},
							{
								$unwind: { path: '$orgOwnerData', preserveNullAndEmptyArrays: true },
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

	public async getMyOrganizations(userId: ObjectId): Promise<Organization[]> {
		const result = await this.organizationModel
			.find({
				orgOwnerUserId: userId,
			})
			.sort({ createdAt: -1 })
			.exec();

		return result;
	}

	public async updateOrganization(orgId: ObjectId, userId: ObjectId, input: any): Promise<Organization> {
		const orgIdObj = shapeIntoMongoObjectId(orgId);

		// Verify user owns the organization
		const org = await this.organizationModel
			.findOne({
				_id: orgIdObj,
				orgOwnerUserId: userId,
			})
			.exec();

		if (!org) {
			throw new BadRequestException('Organization not found or you are not the owner');
		}

		const result = await this.organizationModel
			.findByIdAndUpdate(orgIdObj, input, {
				new: true,
			})
			.exec();

		if (!result) {
			throw new InternalServerErrorException(Message.UPDATE_FAILED);
		}

		return result;
	}
}
