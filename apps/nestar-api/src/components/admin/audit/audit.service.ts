import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { AuditLog, GetAuditLogsResponse } from '../../../libs/dto/admin/admin.output';
import { GetAuditLogsInput, CreateAuditLogInput } from '../../../libs/dto/admin/admin.input';
import { AuditAction, AuditTargetType } from '../../../libs/enums/admin.enum';
import { Message } from '../../../libs/enums/common.enum';
import { T } from '../../../libs/types/common';
import { shapeIntoMongoObjectId } from '../../../libs/config';

@Injectable()
export class AuditService {
	constructor(
		@InjectModel('AuditLog') private auditLogModel: Model<AuditLog>,
	) {}

	/**
	 * Get audit logs with pagination and filtering
	 */
	public async getAuditLogs(input: GetAuditLogsInput): Promise<GetAuditLogsResponse> {
		const match: T = {};

		if (input.search) {
			if (input.search.action) {
				match.action = input.search.action;
			}
			if (input.search.adminUserId) {
				match.adminUserId = shapeIntoMongoObjectId(input.search.adminUserId);
			}
			if (input.search.targetType) {
				match.targetType = input.search.targetType;
			}
			if (input.search.targetId) {
				match.targetId = shapeIntoMongoObjectId(input.search.targetId);
			}
			if (input.search.timestampFrom || input.search.timestampTo) {
				match.timestamp = {};
				if (input.search.timestampFrom) {
					match.timestamp.$gte = new Date(input.search.timestampFrom);
				}
				if (input.search.timestampTo) {
					match.timestamp.$lte = new Date(input.search.timestampTo);
				}
			}
		}

		const result = await this.auditLogModel
			.aggregate([
				{ $match: match },
				{ $sort: { timestamp: -1 } },
				{
					$facet: {
						list: [
							{ $skip: (input.page - 1) * input.limit },
							{ $limit: input.limit },
							{
								$lookup: {
									from: 'users',
									localField: 'adminUserId',
									foreignField: '_id',
									as: 'adminUser',
								},
							},
							{
								$unwind: { path: '$adminUser', preserveNullAndEmptyArrays: true },
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

	/**
	 * Create audit log entry
	 */
	public async createAuditLog(input: CreateAuditLogInput, adminId: ObjectId): Promise<AuditLog> {
		try {
			const auditData: any = {
				adminUserId: adminId,
				action: input.action,
				targetType: input.targetType,
				targetId: shapeIntoMongoObjectId(input.targetId),
				targetName: input.targetName,
				details: input.details,
				timestamp: new Date(),
			};

			if (input.metadata) {
				try {
					auditData.metadata = JSON.parse(input.metadata);
				} catch {
					auditData.metadata = { raw: input.metadata };
				}
			}

			const result = await this.auditLogModel.create(auditData);
			return result;
		} catch (err) {
			console.error('Error creating audit log:', err.message);
			throw new InternalServerErrorException(Message.CREATE_FAILED);
		}
	}

	/**
	 * Helper method to log admin actions
	 * Used by other services to automatically log actions
	 */
	public async logAction(
		action: AuditAction,
		targetType: AuditTargetType,
		targetId: ObjectId,
		targetName: string,
		details: string,
		adminId: ObjectId,
		metadata?: Record<string, any>,
	): Promise<void> {
		try {
			const auditData: any = {
				adminUserId: adminId,
				action,
				targetType,
				targetId,
				targetName,
				details,
				timestamp: new Date(),
			};

			if (metadata) {
				auditData.metadata = metadata;
			}

			await this.auditLogModel.create(auditData);
		} catch (err) {
			// Don't throw error - audit logging should not break main operations
			console.error('Error logging audit action:', err.message);
		}
	}
}
