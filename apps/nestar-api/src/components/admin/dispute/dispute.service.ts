import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Dispute, GetAllDisputesResponse } from '../../../libs/dto/admin/admin.output';
import { GetAllDisputesInput, ChangeDisputeStatusInput, AddDisputeAdminNotesInput, ResolveDisputeInput } from '../../../libs/dto/admin/admin.input';
import { DisputeStatus } from '../../../libs/enums/admin.enum';
import { Message } from '../../../libs/enums/common.enum';
import { T } from '../../../libs/types/common';
import { shapeIntoMongoObjectId } from '../../../libs/config';

@Injectable()
export class DisputeService {
	constructor(
		@InjectModel('Dispute') private disputeModel: Model<Dispute>,
	) {}

	/**
	 * Get all disputes with pagination and filtering
	 */
	public async getAllDisputes(input: GetAllDisputesInput): Promise<GetAllDisputesResponse> {
		const match: T = {};

		if (input.search) {
			if (input.search.disputeType) {
				match.disputeType = input.search.disputeType;
			}
			if (input.search.disputeStatus) {
				match.disputeStatus = input.search.disputeStatus;
			}
			if (input.search.createdAtFrom || input.search.createdAtTo) {
				match.createdAt = {};
				if (input.search.createdAtFrom) {
					match.createdAt.$gte = new Date(input.search.createdAtFrom);
				}
				if (input.search.createdAtTo) {
					match.createdAt.$lte = new Date(input.search.createdAtTo);
				}
			}
		}

		const result = await this.disputeModel
			.aggregate([
				{ $match: match },
				{ $sort: { createdAt: -1 } },
				{
					$facet: {
						list: [
							{ $skip: (input.page - 1) * input.limit },
							{ $limit: input.limit },
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

	/**
	 * Get dispute by ID
	 */
	public async getDisputeById(disputeId: string): Promise<Dispute> {
		const disputeIdObj = shapeIntoMongoObjectId(disputeId);
		const dispute = await this.disputeModel.findById(disputeIdObj).exec();

		if (!dispute) {
			throw new NotFoundException('Dispute not found.');
		}

		return dispute;
	}

	/**
	 * Change dispute status
	 */
	public async changeDisputeStatus(input: ChangeDisputeStatusInput, adminId: ObjectId): Promise<Dispute> {
		const disputeIdObj = shapeIntoMongoObjectId(input.disputeId);
		const dispute = await this.disputeModel.findById(disputeIdObj).exec();

		if (!dispute) {
			throw new NotFoundException('Dispute not found.');
		}

		const result = await this.disputeModel.findByIdAndUpdate(
			disputeIdObj,
			{ disputeStatus: input.disputeStatus },
			{ new: true },
		).exec();

		if (!result) {
			throw new InternalServerErrorException(Message.UPDATE_FAILED);
		}

		return result;
	}

	/**
	 * Add admin notes to dispute
	 */
	public async addDisputeAdminNotes(input: AddDisputeAdminNotesInput, adminId: ObjectId): Promise<Dispute> {
		const disputeIdObj = shapeIntoMongoObjectId(input.disputeId);
		const dispute = await this.disputeModel.findById(disputeIdObj).exec();

		if (!dispute) {
			throw new NotFoundException('Dispute not found.');
		}

		// Append to existing notes or create new
		const existingNotes = dispute.adminNotes || '';
		const newNotes = existingNotes
			? `${existingNotes}\n\n[${new Date().toISOString()}] ${input.adminNotes}`
			: input.adminNotes;

		const result = await this.disputeModel.findByIdAndUpdate(
			disputeIdObj,
			{ adminNotes: newNotes },
			{ new: true },
		).exec();

		if (!result) {
			throw new InternalServerErrorException(Message.UPDATE_FAILED);
		}

		return result;
	}

	/**
	 * Resolve dispute
	 */
	public async resolveDispute(input: ResolveDisputeInput, adminId: ObjectId): Promise<Dispute> {
		const disputeIdObj = shapeIntoMongoObjectId(input.disputeId);
		const dispute = await this.disputeModel.findById(disputeIdObj).exec();

		if (!dispute) {
			throw new NotFoundException('Dispute not found.');
		}

		if (dispute.disputeStatus === DisputeStatus.RESOLVED) {
			throw new BadRequestException('Dispute is already resolved.');
		}

		const updateData: any = {
			disputeStatus: DisputeStatus.RESOLVED,
			resolvedAt: new Date(),
			resolvedBy: adminId,
		};

		if (input.resolutionNotes) {
			const existingNotes = dispute.adminNotes || '';
			updateData.adminNotes = existingNotes
				? `${existingNotes}\n\n[RESOLUTION - ${new Date().toISOString()}] ${input.resolutionNotes}`
				: `[RESOLUTION - ${new Date().toISOString()}] ${input.resolutionNotes}`;
		}

		const result = await this.disputeModel.findByIdAndUpdate(
			disputeIdObj,
			updateData,
			{ new: true },
		).exec();

		if (!result) {
			throw new InternalServerErrorException(Message.UPDATE_FAILED);
		}

		return result;
	}
}
