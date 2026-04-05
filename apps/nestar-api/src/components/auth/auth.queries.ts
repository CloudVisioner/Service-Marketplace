import { gql } from 'graphql-tag';

export const SIGNUP = gql`
  mutation Signup($input: SignupInput!) {
    signup(input: $input) {
      accessToken
      user {
        _id
        userNick
        userEmail
        userRole
        userStatus
        userAuthType
        createdAt
      }
    }
  }
`;

export const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      _id
      userNick
      userEmail
      userRole
      userStatus
      userAuthType
      accessToken
      createdAt
    }
  }
`;
