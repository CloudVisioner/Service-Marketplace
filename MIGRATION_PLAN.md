# Migration Plan: Current Schema → New ER Model

## Overview
This document outlines the changes needed to align the current codebase with the new ER model schema.

---

## 1. SCHEMA MODELS TO UPDATE

### 1.1 Member → Users (`Member.model.ts`)
**Current Fields:**
- `memberType`, `memberNick`, `memberStatus`, `memberAuthType`, `memberPhone`, `memberPassword`, `memberFullName`, `memberImage`, `memberAddress`, `memberDescription`, `memberProperties`, `memberArticles`, `memberFollowers`, `memberFollowings`, `memberPoints`, `memberLikes`, `memberViews`, `memberComments`, `memberRank`, `memberWarnings`, `memberBlocks`, `deletedAt`

**New ER Model Requirements:**
- `userRole` (enum, NN) - replaces `memberType`
- `userStatus` (enum, NN) - replaces `memberStatus`
- `userEmail` (string, NN) - replaces `memberPhone` (or add alongside)
- `userNick` (string, NN) - already exists as `memberNick`
- `userPassword` (string, NN) - already exists as `memberPassword`
- `userFullName` (string) - already exists
- `deletedAt` (date) - already exists
- `createdAt`, `updatedAt` - already handled by timestamps

**Action Required:**
- Rename fields: `memberType` → `userRole`, `memberStatus` → `userStatus`, `memberNick` → `userNick`, `memberPhone` → `userEmail`, `memberPassword` → `userPassword`, `memberFullName` → `userFullName`
- Remove fields not in ER model: `memberAuthType`, `memberImage`, `memberAddress`, `memberDescription`, `memberProperties`, `memberArticles`, `memberFollowers`, `memberFollowings`, `memberPoints`, `memberLikes`, `memberViews`, `memberComments`, `memberRank`, `memberWarnings`, `memberBlocks`
- Update collection name: `members` → `users` (or keep `members` if preferred)

---

### 1.2 Follow (`Follow.model.ts`)
**Current Fields:**
- `followingId` (ObjectId) - follows another member
- `followerId` (ObjectId) - the follower member

**New ER Model Requirements:**
- `followedOrgId` (ObjectId, NN) - the organization being followed
- `followerUserId` (ObjectId, NN) - the user who is following

**Action Required:**
- Change relationship: from member-to-member to user-to-organization
- Rename fields: `followingId` → `followedOrgId`, `followerId` → `followerUserId`
- Update references to use `User` and `Organization` models

---

### 1.3 Notice (`Notice.model.ts`)
**Current Fields:**
- `noticeCategory`, `noticeStatus`, `noticeTitle`, `noticeContent`, `memberId`

**New ER Model Requirements:**
- `noticeCategory` (enum, NN) - ✅ matches
- `noticeStatus` (enum, NN) - ✅ matches
- `noticeTitle` (string, NN) - ✅ matches
- `noticeContent` (string, NN) - ✅ matches
- `userId` (ObjectId, NN) - ❌ currently `memberId`

**Action Required:**
- Rename field: `memberId` → `userId`
- Update reference: `ref: 'Member'` → `ref: 'User'`

---

### 1.4 View (`View.model.ts`)
**Current Fields:**
- `viewGroup`, `viewRefId`, `memberId`

**New ER Model Requirements:**
- `viewGroup` (enum, NN) - ✅ matches
- `viewRefId` (ObjectId, NN) - ✅ matches
- `userId` (ObjectId, NN) - ❌ currently `memberId`

**Action Required:**
- Rename field: `memberId` → `userId`
- Update reference: `ref: 'Member'` → `ref: 'User'`

---

### 1.5 Like (`Like.model.ts`)
**Current Fields:**
- `likeGroup`, `likeRefId`, `memberId`

**New ER Model Requirements:**
- `likeGroup` (enum, NN) - ✅ matches
- `likeRefId` (ObjectId, NN) - ✅ matches
- `userId` (ObjectId, NN) - ❌ currently `memberId`

**Action Required:**
- Rename field: `memberId` → `userId`
- Update reference: `ref: 'Member'` → `ref: 'User'`

---

### 1.6 Notification (`Notification.model.ts`)
**Current Fields:**
- `notificationType`, `notificationStatus`, `notificationGroup`, `notificationTitle`, `notificationDesc`, `authorId`, `receiverId`, `propertyId`, `articleId`

**New ER Model Requirements:**
- `notificationType` (enum, NN) - ✅ matches
- `notificationStatus` (enum, NN) - ✅ matches
- `notificationGroup` (enum, NN) - ✅ matches
- `notificationTitle` (string, NN) - ✅ matches
- `notificationDesc` (string, NN) - ✅ matches
- `senderUserId` (ObjectId, NN) - ❌ currently `authorId`
- `receiverUserId` (ObjectId, NN) - ❌ currently `receiverId`
- `organizationId` (ObjectId, NN) - ❌ currently `propertyId` (different purpose)
- `serviceRequestId` (ObjectId, NN) - ❌ currently `articleId` (different purpose)

**Action Required:**
- Rename fields: `authorId` → `senderUserId`, `receiverId` → `receiverUserId`
- Replace fields: `propertyId` → `organizationId`, `articleId` → `serviceRequestId`
- Update references: `ref: 'Member'` → `ref: 'User'`, add `ref: 'Organization'`, add `ref: 'ServiceRequest'`

---

## 2. NEW SCHEMA MODELS TO CREATE

### 2.1 Organization (`Organization.model.ts`) - NEW
**Required Fields:**
- `_id` (ObjectId, NN) - Primary Key
- `orgType` (enum, NN)
- `orgStatus` (enum, NN)
- `orgCountry` (string, NN)
- `orgCity` (string, NN)
- `orgWebsiteUrl` (string, NN)
- `orgTotalProjects` (int, NN)
- `orgResponseTimeAvg` (double, NN)
- `orgVerified` (bool, NN)
- `orgSkills` (string, NN)
- `orgOwnerUserId` (ObjectId, NN) - Foreign Key to `users._id`
- `orgName` (string, NN)
- `orgDescription` (string, NN)
- `orgAverageRating` (int, NN)
- `orgTotalLikes` (int, NN)
- `orgTotalViews` (int, NN)
- `orgLogoImages` (array, NN)
- `orgTaxId` (string, NN)
- `deletedAt` (date)
- `createdAt`, `updatedAt` (timestamps)

**Indexes:**
- `ix_id` on `_id`
- Compound text index: `car_search_tags_text_car_desc_text_car_location_text` (or similar search index)

---

### 2.2 Quote (`Quote.model.ts`) - NEW
**Required Fields:**
- `_id` (ObjectId, NN) - Primary Key
- `quoteProviderOrgId` (ObjectId, NN) - Foreign Key to `organizations._id`
- `quoteServiceReqId` (ObjectId, NN) - Foreign Key to `serviceRequests._id`
- `quoteCreatedByUserId` (ObjectId, NN) - Foreign Key to `users._id`
- `quoteMessage` (string, NN)
- `quoteStatus` (enum, NN)
- `quoteTotalLikes` (int, NN)
- `quoteAmount` (double, NN)
- `quoteValidUntil` (date, NN)
- `createdAt`, `updatedAt` (timestamps)

---

### 2.3 ServiceRequest (`ServiceRequest.model.ts`) - NEW
**Required Fields:**
- `_id` (ObjectId, NN) - Primary Key
- `reqTitle` (string, NN)
- `reqDescription` (string, NN)
- `reqBuyerOrgId` (ObjectId, NN) - Foreign Key to `organizations._id`
- `reqStatus` (enum, NN)
- `reqBudgetMin` (double, NN)
- `reqBudgetMax` (double, NN)
- `reqDeadline` (date, NN)
- `reqSkillsNeeded` (array, NN)
- `reqTotalLikes` (int, NN)
- `reqTotalViews` (int, NN)
- `reqTotalQuotes` (int, NN)
- `reqCreatedByUserId` (ObjectId, NN) - Foreign Key to `users._id`
- `createdAt`, `updatedAt` (timestamps)

---

## 3. SCHEMA MODELS TO REMOVE OR DEPRECATE

### 3.1 Property (`Property.model.ts`)
**Status:** Not in new ER model
**Decision Needed:** 
- Remove completely if not needed
- OR repurpose for a different use case
- OR keep as legacy data

---

### 3.2 BoardArticle (`BoardArticle.model.ts`)
**Status:** Not in new ER model
**Decision Needed:**
- Remove completely if not needed
- OR repurpose for a different use case
- OR keep as legacy data

---

### 3.3 Comment (`Comment.model.ts`)
**Status:** Not in new ER model
**Decision Needed:**
- Remove completely if not needed
- OR repurpose for a different use case
- OR keep as legacy data

---

## 4. ENUMS TO UPDATE/CREATE

### 4.1 Member Enums → User Enums
- `MemberType` → `UserRole` (enum)
- `MemberStatus` → `UserStatus` (enum)
- Remove: `MemberAuthType` (not in new ER model)

### 4.2 New Enums Needed
- `OrganizationType` (enum) - for `orgType`
- `OrganizationStatus` (enum) - for `orgStatus`
- `QuoteStatus` (enum) - for `quoteStatus`
- `ServiceRequestStatus` (enum) - for `reqStatus`

---

## 5. DTOs TO UPDATE

### 5.1 Member DTOs → User DTOs
- `member.input.ts` → update field names
- `member.ts` → update field names
- `member.update.ts` → update field names

### 5.2 Follow DTOs
- `follow.input.ts` → update to use organization references
- `follow.ts` → update to use organization references

### 5.3 Notification DTOs
- Update to use new field names and references

### 5.4 New DTOs Needed
- `organization/` - organization.input.ts, organization.ts, organization.update.ts
- `quote/` - quote.input.ts, quote.ts, quote.update.ts
- `service-request/` - service-request.input.ts, service-request.ts, service-request.update.ts

---

## 6. SERVICES TO UPDATE

### 6.1 Member Service → User Service
- Update all field references from `member*` to `user*`
- Update authentication logic if `userEmail` replaces `memberPhone`

### 6.2 Follow Service
- Change from member-to-member to user-to-organization following

### 6.3 Notice, View, Like Services
- Update field references from `memberId` to `userId`

### 6.4 Notification Service
- Update field references and add organization/serviceRequest logic

### 6.5 New Services Needed
- `organization/` - organization.service.ts, organization.resolver.ts, organization.module.ts
- `quote/` - quote.service.ts, quote.resolver.ts, quote.module.ts
- `service-request/` - service-request.service.ts, service-request.resolver.ts, service-request.module.ts

---

## 7. FILES TO MODIFY - SUMMARY

### Schema Files (Priority 1)
1. ✅ `schemas/Member.model.ts` → Update to match `users` schema
2. ✅ `schemas/Follow.model.ts` → Update to follow organizations
3. ✅ `schemas/Notice.model.ts` → Change `memberId` to `userId`
4. ✅ `schemas/View.model.ts` → Change `memberId` to `userId`
5. ✅ `schemas/Like.model.ts` → Change `memberId` to `userId`
6. ✅ `schemas/Notification.model.ts` → Update all field names
7. 🆕 `schemas/Organization.model.ts` → CREATE NEW
8. 🆕 `schemas/Quote.model.ts` → CREATE NEW
9. 🆕 `schemas/ServiceRequest.model.ts` → CREATE NEW
10. ❓ `schemas/Property.model.ts` → DECIDE: Remove or keep?
11. ❓ `schemas/BoardArticle.model.ts` → DECIDE: Remove or keep?
12. ❓ `schemas/Comment.model.ts` → DECIDE: Remove or keep?

### Enum Files (Priority 1)
1. ✅ `libs/enums/member.enum.ts` → Update to user enums
2. 🆕 `libs/enums/organization.enum.ts` → CREATE NEW
3. 🆕 `libs/enums/quote.enum.ts` → CREATE NEW
4. 🆕 `libs/enums/service-request.enum.ts` → CREATE NEW

### DTO Files (Priority 2)
1. ✅ `libs/dto/member/` → Update all field names
2. ✅ `libs/dto/follow/` → Update to organization references
3. ✅ `libs/dto/notification/` → Update field names
4. 🆕 `libs/dto/organization/` → CREATE NEW
5. 🆕 `libs/dto/quote/` → CREATE NEW
6. 🆕 `libs/dto/service-request/` → CREATE NEW

### Service/Resolver Files (Priority 2)
1. ✅ `components/member/` → Update to user logic
2. ✅ `components/follow/` → Update to organization following
3. ✅ `components/notice/` → Update field references
4. ✅ `components/view/` → Update field references
5. ✅ `components/like/` → Update field references
6. ✅ `components/notification/` → Update field references
7. 🆕 `components/organization/` → CREATE NEW
8. 🆕 `components/quote/` → CREATE NEW
9. 🆕 `components/service-request/` → CREATE NEW

### Auth Files (Priority 2)
1. ✅ `components/auth/decorators/authMember.decorator.ts` → Update to authUser
2. ✅ `components/auth/guards/` → Update references

---

## 8. MIGRATION ORDER (Recommended)

### Phase 1: Core Schema Updates
1. Update Member → User schema and enums
2. Create Organization schema and enums
3. Update Follow schema
4. Update Notice, View, Like schemas (memberId → userId)

### Phase 2: New Schemas
5. Create Quote schema and enums
6. Create ServiceRequest schema and enums
7. Update Notification schema

### Phase 3: DTOs
8. Update all DTOs to match new schemas

### Phase 4: Services & Resolvers
9. Update all services and resolvers
10. Create new services and resolvers

### Phase 5: Cleanup
11. Decide on Property, BoardArticle, Comment (remove or keep)
12. Update all references throughout codebase
13. Test all endpoints

---

## 9. BREAKING CHANGES

⚠️ **IMPORTANT:** This migration will break existing functionality:
- All `member*` field names will change to `user*`
- Follow relationships change from member-to-member to user-to-organization
- Property, BoardArticle, Comment may be removed
- Notification structure completely changes
- Database collection names may change

**Recommendation:** 
- Create a migration script to transform existing data
- Or run this in a new branch and test thoroughly before merging

---

## 10. QUESTIONS TO RESOLVE

1. **Collection Names:** Keep `members` collection or rename to `users`?
2. **Property/BoardArticle/Comment:** Remove completely or keep for legacy?
3. **UserEmail vs MemberPhone:** Replace phone auth with email auth, or support both?
4. **Migration Strategy:** Data migration script needed? Or fresh start?
5. **Backward Compatibility:** Need to support old field names temporarily?
