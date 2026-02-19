/**
 * Migration Script: Fix User Service Request Counts
 * 
 * This script recalculates userTotalServiceRequests for all users
 * based on actual service requests in the database.
 * 
 * Run this script ONCE to fix existing user counters:
 * npx ts-node apps/nestar-api/scripts/fix-user-service-request-counts.ts
 */

import mongoose from 'mongoose';
import { config } from 'dotenv';

// Load environment variables
config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ServiceMarketplace';

async function fixUserServiceRequestCounts() {
	try {
		// Connect to MongoDB
		await mongoose.connect(MONGODB_URI);
		console.log('✅ Connected to MongoDB');

		const db = mongoose.connection.db;
		const usersCollection = db.collection('users');
		const serviceRequestsCollection = db.collection('serviceRequests');

		// Get all users
		const users = await usersCollection.find({}).toArray();
		console.log(`📊 Found ${users.length} user(s) to update`);

		if (users.length === 0) {
			console.log('✅ No users to update');
			await mongoose.disconnect();
			return;
		}

		let updatedCount = 0;

		// For each user, count their actual service requests
		for (const user of users) {
			const actualCount = await serviceRequestsCollection.countDocuments({
				reqCreatedByUserId: user._id,
			});

			// Update user's counter if it doesn't match
			if (user.userTotalServiceRequests !== actualCount) {
				await usersCollection.updateOne(
					{ _id: user._id },
					{ $set: { userTotalServiceRequests: actualCount } }
				);
				console.log(`✅ Updated user ${user._id}: ${user.userTotalServiceRequests} → ${actualCount}`);
				updatedCount++;
			}
		}

		console.log(`\n✅ Successfully updated ${updatedCount} user(s)`);
		console.log(`📋 Total users checked: ${users.length}`);

		await mongoose.disconnect();
		console.log('✅ Migration completed');
	} catch (error) {
		console.error('❌ Error fixing user service request counts:', error);
		await mongoose.disconnect();
		process.exit(1);
	}
}

// Run the migration
fixUserServiceRequestCounts();
