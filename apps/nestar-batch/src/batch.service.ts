import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'apps/nestar-api/src/libs/dto/user/user';
import { Model } from 'mongoose';

@Injectable()
export class BatchService {
	constructor(
		@InjectModel('User') private readonly userModel: Model<User>,
	) {}

	// Placeholder for future batch operations
	public async batchRollerback(): Promise<void> {
		// B2B batch operations can be added here
		console.log('Batch rollerback - placeholder for B2B operations');
	}
}
