/**
 * Migration Script: Clean Buyer Organizations
 * 
 * This script removes all provider-specific fields from existing buyer organizations
 * to keep the database clean and minimalistic for buyers.
 * 
 * Run this script ONCE to clean up existing buyer organizations:
 * npx ts-node apps/nestar-api/scripts/clean-buyer-organizations.ts
 */

import mongoose from 'mongoose';
import { config } from 'dotenv';

// Load environment variables
config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ServiceMarketplace';

// Fields to remove from buyer organizations (provider-specific)
const FIELDS_TO_REMOVE = [
	'orgTotalProjects',
	'orgResponseTimeAvg',
	'orgVerified',
	'orgSkills',
	'orgAverageRating',
	'orgTotalLikes',
	'orgTotalViews',
	'organizationImage',
	'categoryId',
	'subCategory',
	'organizationHourlyRate',
	'organizationTeamSize',
	'organizationSpecialties',
	'industries',
	'minProjectSize',
	'badges',
	'reviewsCount',
	'organizationWebsiteUrl',
	'organizationEmail',
	'organizationPhoneNumber',
	'orgCountry',
	'orgCity',
	'orgTaxId',
	'serviceTitle',
	'establishmentYear',
	'bio',
	'avatar',
	'color',
	'flag',
	'socialLinks',
];

async function cleanBuyerOrganizations() {
	try {
		// Connect to MongoDB
		await mongoose.connect(MONGODB_URI);
		console.log('✅ Connected to MongoDB');

		const db = mongoose.connection.db;
		const organizationsCollection = db.collection('organizations');

		// Find all buyer organizations
		const buyerOrgs = await organizationsCollection.find({ orgType: 'BUYER' }).toArray();
		console.log(`📊 Found ${buyerOrgs.length} buyer organization(s) to clean`);

		if (buyerOrgs.length === 0) {
			console.log('✅ No buyer organizations to clean');
			await mongoose.disconnect();
			return;
		}

		// Build unset object
		const unsetFields = FIELDS_TO_REMOVE.reduce((acc, field) => {
			acc[field] = '';
			return acc;
		}, {} as Record<string, string>);

		// Update all buyer organizations
		const result = await organizationsCollection.updateMany(
			{ orgType: 'BUYER' },
			{ $unset: unsetFields }
		);

		console.log(`✅ Successfully cleaned ${result.modifiedCount} buyer organization(s)`);
		console.log(`📋 Removed fields: ${FIELDS_TO_REMOVE.join(', ')}`);

		// Verify cleanup
		const sampleOrg = await organizationsCollection.findOne({ orgType: 'BUYER' });
		if (sampleOrg) {
			const remainingFields = Object.keys(sampleOrg).filter(
				key => !['_id', 'orgType', 'orgStatus', 'orgOwnerUserId', 'organizationName', 'organizationIndustry', 'organizationLocation', 'organizationDescription', 'budgetRange', 'createdAt', 'updatedAt', '__v'].includes(key)
			);
			if (remainingFields.length > 0) {
				console.log(`⚠️  Warning: Some fields still remain: ${remainingFields.join(', ')}`);
			} else {
				console.log('✅ All unnecessary fields removed successfully');
			}
		}

		await mongoose.disconnect();
		console.log('✅ Migration completed');
	} catch (error) {
		console.error('❌ Error cleaning buyer organizations:', error);
		await mongoose.disconnect();
		process.exit(1);
	}
}

// Run the migration
cleanBuyerOrganizations();
