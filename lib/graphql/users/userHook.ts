import { useQuery, useMutation } from "@apollo/client/react"
import { User } from "./types"
import { GET_ALL_USERS } from "./queries"
import { CREATE_USER, UPDATE_USER } from "./mutations"

export function useGraphQLUsers(){

    const {data, loading, error, refetch} = useQuery<{allUsers: User[]}>(GET_ALL_USERS,{
        fetchPolicy: 'cache-and-network',
    })

    return{
        users: data?.allUsers,
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