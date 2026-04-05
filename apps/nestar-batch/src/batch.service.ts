import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'apps/nestar-api/src/libs/dto/user/user';
import { Model } from 'mongoose';

@Injectable()
export class BatchService {
	constructor(
		@InjectModel('User') private readonly userModel: Model<User>,
	) {}

	public async batchRollerback(): Promise<void> {
		console.log('Batch rollerback - placeholder for B2B operations');
	}

	public async batchTopProperties(): Promise<void> {
		console.log('Batch top properties - placeholder for B2B operations');
	}

	public async batchTopAgents(): Promise<void> {
		console.log('Batch top agents - placeholder for B2B operations');
	}
}
