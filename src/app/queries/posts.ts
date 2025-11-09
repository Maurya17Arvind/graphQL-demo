import { gql } from 'apollo-angular';

export const GET_POSTS = gql`
  query GetPosts {
    posts {
      id
      title
      body
    }
  }
`;

export const CREATE_POST = gql`
  mutation CreatePost($post: CreatePostInput!) {
    createPost(post: $post) {
      id
      title
      body
      user {
        id
      }
    }
  }
`;

export const UPDATE_POST = gql`
  mutation UpdatePost($postId: Int!, $post: UpdatePostInput!) {
    updatePost(postId: $postId, post: $post) {
      id
      title
      body
    }
  }
`;

export const DELETE_POST = gql`
  mutation DeletePost($postId: Int!) {
    deletePost(postId: $postId)
  }
`;
