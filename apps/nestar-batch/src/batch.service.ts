import { Injectable } from '@nestjs/common';

@Injectable()
export class BatchService {
	getHello(): string {
		return 'Welcome to Nestar BATCH API Server!';
	}

	public async batchRollerback(): Promise<void> {
		console.log('batchRollback');
	}

	public async batchProperties(): Promise<void> {
		console.log('batchRollback');
	}

	public async batchAgents(): Promise<void> {
		console.log('batchRollback');
	}
}
