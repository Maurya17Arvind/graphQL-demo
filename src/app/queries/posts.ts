import { gql } from "apollo-angular";

export const GET_POSTS = gql`
  query GetPosts {
    posts {
      id
      title
      body
    }
  }
`;
