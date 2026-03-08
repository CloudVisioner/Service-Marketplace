import { registerEnumType } from '@nestjs/graphql';

/**
 * Article Status Enum
 * Controls article visibility and state
 */
export enum ArticleStatus {
	DRAFT = 'DRAFT',
	PUBLISHED = 'PUBLISHED',
	ARCHIVED = 'ARCHIVED',
}
registerEnumType(ArticleStatus, {
	name: 'ArticleStatus',
});

/**
 * Dispute Type Enum
 * Types of disputes that can be created
 */
export enum DisputeType {
	ORDER = 'ORDER',
	FLAGGED_USER = 'FLAGGED_USER',
	FLAGGED_REQUEST = 'FLAGGED_REQUEST',
	FLAGGED_QUOTE = 'FLAGGED_QUOTE',
}
registerEnumType(DisputeType, {
	name: 'DisputeType',
});

/**
 * Dispute Status Enum
 * Current state of a dispute
 */
export enum DisputeStatus {
	OPEN = 'OPEN',
	IN_REVIEW = 'IN_REVIEW',
	RESOLVED = 'RESOLVED',
}
registerEnumType(DisputeStatus, {
	name: 'DisputeStatus',
});

/**
 * Audit Action Enum
 * Types of actions that can be logged in audit trail
 */
export enum AuditAction {
	USER_SUSPENDED = 'USER_SUSPENDED',
	USER_ACTIVATED = 'USER_ACTIVATED',
	ORG_APPROVED = 'ORG_APPROVED',
	ORG_REJECTED = 'ORG_REJECTED',
	ORG_SUSPENDED = 'ORG_SUSPENDED',
	ORDER_STATUS_CHANGED = 'ORDER_STATUS_CHANGED',
	ORDER_NOTES_ADDED = 'ORDER_NOTES_ADDED',
	ARTICLE_PUBLISHED = 'ARTICLE_PUBLISHED',
	ARTICLE_DELETED = 'ARTICLE_DELETED',
	ARTICLE_UPDATED = 'ARTICLE_UPDATED',
	DISPUTE_STATUS_CHANGED = 'DISPUTE_STATUS_CHANGED',
	DISPUTE_RESOLVED = 'DISPUTE_RESOLVED',
	QUOTE_FLAGGED = 'QUOTE_FLAGGED',
	REQUEST_FLAGGED = 'REQUEST_FLAGGED',
	REQUEST_CLOSED = 'REQUEST_CLOSED',
}
registerEnumType(AuditAction, {
	name: 'AuditAction',
});

/**
 * Audit Target Type Enum
 * Types of entities that can be targets of audit actions
 */
export enum AuditTargetType {
	USER = 'User',
	ORGANIZATION = 'Organization',
	ORDER = 'Order',
	ARTICLE = 'Article',
	DISPUTE = 'Dispute',
	QUOTE = 'Quote',
	SERVICE_REQUEST = 'Service Request',
}
registerEnumType(AuditTargetType, {
	name: 'AuditTargetType',
});
