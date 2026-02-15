import { registerEnumType } from '@nestjs/graphql';

export enum Category {
	IT_AND_SOFTWARE = 'IT_AND_SOFTWARE',
	BUSINESS_SERVICES = 'BUSINESS_SERVICES',
	MARKETING_AND_SALES = 'MARKETING_AND_SALES',
	DESIGN_AND_CREATIVE = 'DESIGN_AND_CREATIVE',
}

registerEnumType(Category, {
	name: 'Category',
	description: 'Main service categories',
});

export enum SubCategory {
	// IT and Software
	WEB_APP_DEVELOPMENT = 'WEB_APP_DEVELOPMENT',
	DATA_AND_AI = 'DATA_AND_AI',
	SOFTWARE_TESTING_AND_QA = 'SOFTWARE_TESTING_AND_QA',
	INFRASTRUCTURE_AND_CLOUD = 'INFRASTRUCTURE_AND_CLOUD',

	// Business Services
	ADMIN_AND_VIRTUAL_SUPPORT = 'ADMIN_AND_VIRTUAL_SUPPORT',
	FINANCIAL_AND_LEGAL = 'FINANCIAL_AND_LEGAL',
	STRATEGY_AND_CONSULTING = 'STRATEGY_AND_CONSULTING',
	HR_AND_OPERATIONS = 'HR_AND_OPERATIONS',

	// Marketing and Sales
	DIGITAL_MARKETING = 'DIGITAL_MARKETING',
	SOCIAL_MEDIA_MANAGEMENT = 'SOCIAL_MEDIA_MANAGEMENT',
	CONTENT_AND_COPYWRITING = 'CONTENT_AND_COPYWRITING',
	SALES_AND_LEAD_GEN = 'SALES_AND_LEAD_GEN',

	// Design and Creative
	VISUAL_IDENTITY_AND_BRANDING = 'VISUAL_IDENTITY_AND_BRANDING',
	UI_UX_AND_WEB_DESIGN = 'UI_UX_AND_WEB_DESIGN',
	MOTION_AND_VIDEO = 'MOTION_AND_VIDEO',
	ILLUSTRATION_AND_PRINT = 'ILLUSTRATION_AND_PRINT',
}

registerEnumType(SubCategory, {
	name: 'SubCategory',
	description: 'Service subcategories',
});

// Helper function to get subcategories for a category
export function getSubCategoriesForCategory(category: Category): SubCategory[] {
	const subCategoryMap: Record<Category, SubCategory[]> = {
		[Category.IT_AND_SOFTWARE]: [
			SubCategory.WEB_APP_DEVELOPMENT,
			SubCategory.DATA_AND_AI,
			SubCategory.SOFTWARE_TESTING_AND_QA,
			SubCategory.INFRASTRUCTURE_AND_CLOUD,
		],
		[Category.BUSINESS_SERVICES]: [
			SubCategory.ADMIN_AND_VIRTUAL_SUPPORT,
			SubCategory.FINANCIAL_AND_LEGAL,
			SubCategory.STRATEGY_AND_CONSULTING,
			SubCategory.HR_AND_OPERATIONS,
		],
		[Category.MARKETING_AND_SALES]: [
			SubCategory.DIGITAL_MARKETING,
			SubCategory.SOCIAL_MEDIA_MANAGEMENT,
			SubCategory.CONTENT_AND_COPYWRITING,
			SubCategory.SALES_AND_LEAD_GEN,
		],
		[Category.DESIGN_AND_CREATIVE]: [
			SubCategory.VISUAL_IDENTITY_AND_BRANDING,
			SubCategory.UI_UX_AND_WEB_DESIGN,
			SubCategory.MOTION_AND_VIDEO,
			SubCategory.ILLUSTRATION_AND_PRINT,
		],
	};

	return subCategoryMap[category] || [];
}
