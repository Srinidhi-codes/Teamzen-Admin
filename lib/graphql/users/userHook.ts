import { useQuery, useMutation } from "@apollo/client/react"
import { User } from "./types"
import { GET_ALL_USERS } from "./queries"
import { CREATE_USER, UPDATE_USER, USER_STATUS } from "./mutations"

export interface UsersVariables {
    page?: number;
    pageSize?: number;
    filters?: {
        search?: string;
        isActive?: boolean;
        organizationId?: string;
    };
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
        fetchPolicy: 'cache-and-network',
    })

    return {
        users: data?.allUsers.results,
        total: data?.allUsers.total,
        page: data?.allUsers.page,
        pageSize: data?.allUsers.pageSize,
        isUsersLoading: loading,
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