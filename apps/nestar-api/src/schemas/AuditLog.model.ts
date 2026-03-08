import { Schema } from 'mongoose';
import { AuditAction, AuditTargetType } from '../libs/enums/admin.enum';

const AuditLogSchema = new Schema(
	{
		timestamp: {
			type: Date,
			default: Date.now,
			required: true,
		},
		adminUserId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'User',
		},
		action: {
			type: String,
			enum: AuditAction,
			required: true,
		},
		targetType: {
			type: String,
			enum: AuditTargetType,
			required: true,
		},
		targetId: {
			type: Schema.Types.ObjectId,
			required: true,
		},
		targetName: {
			type: String,
			required: true,
			trim: true,
		},
		details: {
			type: String,
			required: true,
			trim: true,
		},
		metadata: {
			type: Schema.Types.Mixed,
			required: false, // For additional context (JSON object)
		},
	},
	{ timestamps: true, collection: 'auditLogs' },
);

// Indexes
AuditLogSchema.index({ timestamp: -1 });
AuditLogSchema.index({ adminUserId: 1 });
AuditLogSchema.index({ action: 1 });
AuditLogSchema.index({ targetType: 1, targetId: 1 });
AuditLogSchema.index({ createdAt: -1 });

export default AuditLogSchema;
