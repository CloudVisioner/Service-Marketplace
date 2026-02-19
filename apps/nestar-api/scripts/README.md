# Database Migration Scripts

## Clean Buyer Organizations

This script removes all provider-specific fields from existing buyer organizations in the database.

### What it does:
- Finds all organizations with `orgType: "BUYER"`
- Removes provider-specific fields like:
  - `orgTotalProjects`, `orgTotalViews`, `orgTotalLikes`
  - `orgAverageRating`, `orgResponseTimeAvg`
  - `categoryId`, `subCategory`, `organizationHourlyRate`
  - `organizationTeamSize`, `organizationSpecialties`
  - `badges`, `reviewsCount`, etc.
- Keeps only buyer-essential fields:
  - `_id`, `orgType`, `orgStatus`, `orgOwnerUserId`
  - `organizationName`, `organizationIndustry`, `organizationLocation`
  - `organizationDescription`, `budgetRange`
  - `createdAt`, `updatedAt`

### How to run:

```bash
# From the project root
npx ts-node apps/nestar-api/scripts/clean-buyer-organizations.ts
```

Or add to `package.json`:
```json
{
  "scripts": {
    "migrate:clean-buyers": "ts-node apps/nestar-api/scripts/clean-buyer-organizations.ts"
  }
}
```

Then run:
```bash
npm run migrate:clean-buyers
```

### Important:
- **Run this script ONCE** to clean up existing buyer organizations
- New buyer organizations created after the code update will automatically exclude these fields
- This script is **safe** - it only removes provider-specific fields from buyer organizations
- Provider organizations are **not affected**
