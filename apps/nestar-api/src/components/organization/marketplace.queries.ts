import { gql } from 'graphql-tag';

export const GET_PROVIDERS_BY_CATEGORY = gql`
  query GetProvidersByCategory($input: ProviderCategoryInput!) {
    getProvidersByCategory(input: $input) {
      list {
        _id
        organizationName
        organizationDescription
        organizationImage
        organizationCountry
        orgCountry
        orgCity
        categoryId
        subCategory
        orgAverageRating
        reviewsCount
        budgetRange
        organizationHourlyRate
        createdAt
        updatedAt
      }
      metaCounter {
        total
      }
    }
  }
`;

export const GET_PROVIDER_DETAIL = gql`
  query GetProviderDetail($orgId: String!) {
    getProviderDetail(orgId: $orgId) {
      _id
      organizationName
      organizationDescription
      organizationCountry
      orgCity
      organizationImage
      organizationWebsiteUrl
      organizationHourlyRate
      organizationTeamSize
      organizationSpecialties
      categoryId
      subCategory
      orgAverageRating
      orgTotalProjects
      orgTotalLikes
      orgTotalViews
      orgResponseTimeAvg
      orgVerified
      orgSkills
      establishmentYear
      minProjectSize
      budgetRange
      bio
      avatar
      badges
      color
      organizationLocation
      flag
      reviewsCount
      myRating
      organizationContactEmail
      organizationPhoneNumber
      linkedIn
      twitter
      github
      orgOwnerData {
        _id
        userNick
        userEmail
        userPhone
        userDescription
        userRole
        userStatus
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_PROVIDERS_SORTED = gql`
  query GetProvidersSorted($input: ProviderSortInput!) {
    getProvidersSorted(input: $input) {
      list {
        _id
        organizationName
        organizationDescription
        organizationCountry
        orgCity
        organizationImage
        organizationWebsiteUrl
        organizationHourlyRate
        organizationTeamSize
        organizationSpecialties
        categoryId
        subCategory
        orgAverageRating
        orgTotalProjects
        orgTotalLikes
        orgTotalViews
        orgResponseTimeAvg
        orgVerified
        orgSkills
        establishmentYear
        minProjectSize
        budgetRange
        bio
        avatar
        badges
        color
        organizationLocation
        flag
        reviewsCount
        organizationContactEmail
        organizationPhoneNumber
        linkedIn
        twitter
        github
        orgOwnerData {
          _id
          userNick
          userEmail
          userPhone
          userDescription
          userRole
          userStatus
        }
        createdAt
        updatedAt
      }
      metaCounter {
        total
      }
    }
  }
`;
