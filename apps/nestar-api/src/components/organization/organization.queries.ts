import { gql } from 'graphql-tag';

export const CREATE_BUYER_ORGANIZATION = gql`
  mutation CreateOrUpdateBuyerOrganization($input: BuyerOrganizationInput!) {
    createOrUpdateBuyerOrganization(input: $input) {
      _id
      organizationType
      organizationStatus
      orgOwnerUserId
      organizationName
      organizationIndustry
      organizationLocation
      organizationCountry
      organizationDescription
      budgetRange
      organizationImage
      createdAt
      updatedAt
    }
  }
`;

export const GET_BUYER_ORGANIZATION = gql`
  query GetBuyerOrganization {
    getBuyerOrganization {
      _id
      organizationType
      organizationStatus
      orgOwnerUserId
      organizationName
      organizationIndustry
      organizationLocation
      organizationCountry
      organizationDescription
      budgetRange
      organizationImage
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_ORGANIZATION = gql`
  mutation UpdateOrganization($input: OrganizationUpdate!) {
    updateOrganization(input: $input) {
      _id
      organizationName
      organizationIndustry
      organizationLocation
      organizationDescription
      organizationSpecialties
      organizationHourlyRate
      organizationTeamSize
      organizationWebsiteUrl
      organizationContactEmail
      organizationPhoneNumber
      organizationImage
      budgetRange
      orgOwnerUserId
      orgType
      orgStatus
      deletedAt
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_PROVIDER_ORG_PROF = gql`
  mutation CreateProviderOrgProf($input: ProviderOrganizationInput!) {
    createProviderOrgProf(input: $input) {
      _id
      orgType
      orgStatus
      organizationName
      organizationDescription
      organizationContactEmail
      organizationCountry
      categoryId
      subCategory
      orgOwnerUserId
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_PROVIDER_ORG_PROF = gql`
  mutation UpdateProviderOrgProf($input: UpdateProviderOrganizationInput!) {
    updateProviderOrgProf(input: $input) {
      _id
      orgType
      orgStatus
      organizationName
      organizationDescription
      organizationContactEmail
      organizationCountry
      orgCountry
      categoryId
      subCategory
      organizationImage
      budgetRange
      orgOwnerUserId
      createdAt
      updatedAt
    }
  }
`;

export const GET_PROVIDER_ORGANIZATION = gql`
  query GetProviderOrganization {
    getProviderOrganization {
      _id
      orgType
      orgStatus
      organizationName
      organizationDescription
      organizationContactEmail
      organizationCountry
      orgCountry
      categoryId
      subCategory
      organizationImage
      budgetRange
      orgAverageRating
      reviewsCount
      orgOwnerUserId
      createdAt
      updatedAt
    }
  }
`;

export const RATE_ORGANIZATION = gql`
  mutation RateOrganization($input: RateOrganizationInput!) {
    rateOrganization(input: $input) {
      _id
      orgAverageRating
      reviewsCount
      totalRatingValue
    }
  }
`;

export const UPDATE_PROVIDER_PROFILE = gql`
  mutation UpdateProviderProfile($input: UpdateProviderProfileInput!) {
    updateProviderProfile(input: $input) {
      _id
      userNick
      userEmail
      userPhone
      userDescription
      userRole
      userStatus
      createdAt
      updatedAt
    }
  }
`;
