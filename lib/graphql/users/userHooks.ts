import { useQuery } from "@apollo/client/react";
import { GET_ME, GET_ALL_USERS } from "./queries";

export function useMe() {
    const { data, loading, error, refetch } = useQuery<{ me: any }>(GET_ME, {
        fetchPolicy: 'cache-first',
    });

    return {
        me: data?.me,
        isLoading: loading,
        error,
        refetch
    };
}

export function useUsers() {
    const { data, loading, error, refetch } = useQuery<{ allUsers: { results: any[] } }>(GET_ALL_USERS, {
        fetchPolicy: 'cache-first',
    });

    return {
        users: data?.allUsers?.results ?? [],
        isLoading: loading,
        error,
        refetch
    };
}
