import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import AuditLogSchema from '../../../schemas/AuditLog.model';
import { AuditService } from './audit.service';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: 'AuditLog', schema: AuditLogSchema },
		]),
	],
	providers: [AuditService],
	exports: [AuditService],
})
export class AuditModule {}
