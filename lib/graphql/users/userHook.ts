import { useQuery } from "@apollo/client/react"
import { User } from "./types"
import { GET_ALL_USERS } from "./queries"

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