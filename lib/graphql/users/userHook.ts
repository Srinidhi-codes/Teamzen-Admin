import { useQuery, useMutation } from "@apollo/client/react";
import { User, PromoteEmployeeInput, PromoteEmployeeResponse, UserFilterInput } from "./types";
import { GET_ALL_USERS, GET_ELIGIBLE_MANAGERS } from "./queries";
import { CREATE_USER, UPDATE_USER, USER_STATUS, PROMOTE_EMPLOYEE } from "./mutations";

export interface UsersVariables {
  page?: number;
  pageSize?: number;
  filters?: UserFilterInput;
  sort?: {
    field: string;
    direction: string;
  };
}

export function useGraphQLUsers(variables?: UsersVariables) {
    const { data, loading, error, refetch } = useQuery<{
        allUsers: {
            results: User[];
            total: number;
            page: number;
            pageSize: number;
        }
    }>(GET_ALL_USERS, {
        variables,
    })

    return {
        users: data?.allUsers.results,
        total: data?.allUsers.total,
        page: data?.allUsers.page,
        pageSize: data?.allUsers.pageSize,
        isUsersLoading: loading && !data,
        isUsersRefetching: loading && !!data,
        isUsersError: error,
        refetchUsers: refetch
    }
}

export function useGraphQLUserMutations() {
    const [createUser, { loading: isCreatingUser, error: createUserError }] = useMutation<any>(CREATE_USER);
    const [updateUser, { loading: isUpdatingUser, error: updateUserError }] = useMutation<any>(UPDATE_USER);

    return {
        createUser: async (input: any) => {
            const response = await createUser({ variables: { input } });
            return response.data?.createUser;
        },
        updateUser: async (userId: string, input: any) => {
            const response = await updateUser({ variables: { userId, input } });
            return response.data?.updateUser;
        },
        isCreatingUser,
        createUserError,
        isUpdatingUser,
        updateUserError
    }
}

export function useGraphQLUserStatusMutations() {
    const [updateUserStatus, { loading: isUpdatingUserStatus, error: updateUserStatusError }] = useMutation<any>(USER_STATUS);

    return {
        updateUserStatus: async (input: any) => {
            const response = await updateUserStatus({ variables: { input } });
            return response.data?.userStatus;
        },
        isUpdatingUserStatus,
        updateUserStatusError
    }
}

export function useGraphQLPromoteEmployee() {
  const [promoteMutation, { loading: isPromoting, error: promoteError }] = useMutation<{
    promoteEmployee: PromoteEmployeeResponse["promoteEmployee"];
  }>(PROMOTE_EMPLOYEE);

  return {
    promoteEmployee: async (input: PromoteEmployeeInput) => {
      const response = await promoteMutation({ variables: { input } });
      return response.data?.promoteEmployee;
    },
    isPromoting,
    promoteError,
  };
}

export function useGraphQLEligibleManagers(organizationId?: string, search?: string) {
  const { data, loading, error, refetch } = useQuery<{ eligibleManagers: User[] }>(
    GET_ELIGIBLE_MANAGERS,
    {
      variables: { organizationId: organizationId || undefined, search: search || undefined },
      fetchPolicy: "network-only",
    }
  );

  return {
    managers: data?.eligibleManagers || [],
    isLoading: loading,
    error,
    refetch,
  };
}