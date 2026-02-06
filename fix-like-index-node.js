// Node.js script to fix the Like collection index mismatch
// Run with: node fix-like-index-node.js

require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.NODE_ENV === 'production' ? process.env.MONGO_PROD : process.env.MONGO_DEV;

async function fixLikeIndex() {
	try {
		console.log('🔌 Connecting to MongoDB...');
		await mongoose.connect(MONGO_URI);
		console.log('✅ Connected to MongoDB');

		const db = mongoose.connection.db;
		const collection = db.collection('likes');

		// Step 1: List all current indexes
		console.log('\n📋 Current indexes on "likes" collection:');
		const indexes = await collection.indexes();
		indexes.forEach((index) => {
			console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`);
		});

		// Step 2: Drop the old incorrect index if it exists
		try {
			await collection.dropIndex('memberId_1_likeRefId_1');
			console.log('\n✅ Dropped old index: memberId_1_likeRefId_1');
		} catch (e) {
			if (e.code === 27 || e.message.includes('index not found')) {
				console.log('\nℹ️  Old index not found (may have been already dropped)');
			} else {
				throw e;
			}
		}

		// Step 3: Clean up any documents with null values or old field names
		const nullCleanup = await collection.deleteMany({
			$or: [
				{ userId: null },
				{ likeRefId: null },
				{ userId: { $exists: false } },
				{ likeRefId: { $exists: false } },
				{ memberId: { $exists: true } } // Remove old documents with memberId
			]
		});
		console.log(`✅ Cleaned up ${nullCleanup.deletedCount} documents with null values or old field names`);

		// Step 4: Verify the correct index exists
		const updatedIndexes = await collection.indexes();
		const correctIndex = updatedIndexes.find(
			(idx) => idx.key.userId === 1 && idx.key.likeRefId === 1,
		);

		if (correctIndex) {
			console.log(`\n✅ Correct index exists: ${correctIndex.name}`);
		} else {
			console.log('\n⚠️  Correct index not found. Creating it now...');
			await collection.createIndex(
				{ userId: 1, likeRefId: 1 },
				{ unique: true, name: 'userId_1_likeRefId_1' },
			);
			console.log('✅ Created correct index: userId_1_likeRefId_1');
		}

		// Step 5: Show final indexes
		console.log('\n📋 Final indexes on "likes" collection:');
		const finalIndexes = await collection.indexes();
		finalIndexes.forEach((index) => {
			console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`);
		});

		console.log('\n✅ Index fix complete! The like system should now work correctly.');
		console.log('🔄 Please restart your NestJS server for changes to take effect.');
	} catch (error) {
		console.error('❌ Error fixing index:', error.message);
		process.exit(1);
	} finally {
		await mongoose.disconnect();
		console.log('\n🔌 Disconnected from MongoDB');
	}
}

fixLikeIndex();
