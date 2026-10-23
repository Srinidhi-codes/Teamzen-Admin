import { gql } from "@apollo/client";
import { useQuery, useMutation } from "@apollo/client/react";

export const GET_REPORTED_POSTS = gql`
  query GetReportedPosts($page: Int!, $pageSize: Int!) {
    reportedPosts(page: $page, pageSize: $pageSize) {
      results {
        id
        title
        content
        createdAt
        isReported
        reportReason
        author {
          id
          firstName
          lastName
          email
          profilePictureUrl
        }
        reportedBy {
          id
          firstName
          lastName
          email
        }
      }
      total
      page
      pageSize
    }
  }
`;

export const GET_REPORTED_COMMENTS = gql`
  query GetReportedComments($page: Int!, $pageSize: Int!) {
    reportedComments(page: $page, pageSize: $pageSize) {
      results {
        id
        content
        createdAt
        isReported
        reportReason
        postId
        author {
          id
          firstName
          lastName
          email
          profilePictureUrl
        }
        reportedBy {
          id
          firstName
          lastName
          email
        }
      }
      total
      page
      pageSize
    }
  }
`;

export const DISMISS_REPORT = gql`
  mutation DismissReport($postId: String!) {
    dismissReport(postId: $postId)
  }
`;

export const DELETE_POST = gql`
  mutation DeletePost($id: String!) {
    deletePost(id: $id)
  }
`;

export const DISMISS_COMMENT_REPORT = gql`
  mutation DismissCommentReport($commentId: String!) {
    dismissCommentReport(commentId: $commentId)
  }
`;

export const DELETE_COMMENT = gql`
  mutation DeleteComment($id: String!) {
    deleteComment(id: $id)
  }
`;

export const useReportedPosts = (page = 1, pageSize = 20) => {
  const { data, loading, error, refetch } = useQuery<any>(GET_REPORTED_POSTS, {
    variables: { page, pageSize },
    fetchPolicy: "network-only",
  });

  return {
    reportedPosts: data?.reportedPosts?.results || [],
    total: data?.reportedPosts?.total || 0,
    loading,
    error,
    refetch,
  };
};

export const useReportedComments = (page = 1, pageSize = 20) => {
  const { data, loading, error, refetch } = useQuery<any>(GET_REPORTED_COMMENTS, {
    variables: { page, pageSize },
    fetchPolicy: "network-only",
  });

  return {
    reportedComments: data?.reportedComments?.results || [],
    total: data?.reportedComments?.total || 0,
    loading,
    error,
    refetch,
  };
};

export const useModerationMutations = () => {
  const [dismissReport, { loading: isDismissing }] = useMutation<any>(DISMISS_REPORT);
  const [deletePost, { loading: isDeleting }] = useMutation<any>(DELETE_POST);
  const [dismissCommentReport, { loading: isDismissingComment }] = useMutation<any>(DISMISS_COMMENT_REPORT);
  const [deleteComment, { loading: isDeletingComment }] = useMutation<any>(DELETE_COMMENT);

  return {
    dismissReport,
    deletePost,
    dismissCommentReport,
    deleteComment,
    isDismissing,
    isDeleting,
    isDismissingComment,
    isDeletingComment,
  };
};
