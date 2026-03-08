import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import DisputeSchema from '../../../schemas/Dispute.model';
import { DisputeService } from './dispute.service';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: 'Dispute', schema: DisputeSchema },
		]),
	],
	providers: [DisputeService],
	exports: [DisputeService],
})
export class DisputeModule {}
