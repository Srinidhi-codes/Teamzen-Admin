import { useMutation, useQuery } from "@apollo/client/react";
import {
    LEAVE_REQUEST_PROCESS,
    CREATE_LEAVE_TYPE,
    CREATE_LEAVE_BALANCE,
    UPDATE_LEAVE_TYPE,
    DELETE_LEAVE_TYPE,
    UPDATE_LEAVE_BALANCE,
    DELETE_LEAVE_BALANCE,
    CREATE_COMPANY_HOLIDAY,
    UPDATE_COMPANY_HOLIDAY,
    DELETE_COMPANY_HOLIDAY
} from "./mutations";
import { GET_LEAVE_BALANCE, GET_LEAVE_REQUESTS, GET_LEAVES, GET_COMPANY_HOLIDAYS } from "./queries";
import { GetLeaveRequestResponse, GetLeaveBalanceResponse, GetLeavesResponse, GetCompanyHolidaysResponse } from "./types";

export function useGraphQLLeaveMutations() {
    const [createLeaveTypeMutation] = useMutation(CREATE_LEAVE_TYPE, {
        refetchQueries: [{ query: GET_LEAVES }]
    });

    const [updateLeaveTypeMutation] = useMutation(UPDATE_LEAVE_TYPE, {
        refetchQueries: [{ query: GET_LEAVES }]
    });

    const [deleteLeaveTypeMutation] = useMutation(DELETE_LEAVE_TYPE, {
        refetchQueries: [{ query: GET_LEAVES }]
    });

    const [createLeaveBalanceMutation] = useMutation(CREATE_LEAVE_BALANCE, {
        refetchQueries: [{ query: GET_LEAVE_BALANCE }]
    });

    const [updateLeaveBalanceMutation] = useMutation(UPDATE_LEAVE_BALANCE, {
        refetchQueries: [{ query: GET_LEAVE_BALANCE }]
    });

    const [deleteLeaveBalanceMutation] = useMutation(DELETE_LEAVE_BALANCE, {
        refetchQueries: [{ query: GET_LEAVE_BALANCE }]
    });

    const createLeaveType = async (input: any) => {
        const response = await createLeaveTypeMutation({
            variables: { input }
        });
        return response.data;
    };

    const updateLeaveType = async (input: any) => {
        const response = await updateLeaveTypeMutation({
            variables: { input }
        });
        return response.data;
    };

    const deleteLeaveType = async (id: string) => {
        const response = await deleteLeaveTypeMutation({
            variables: { id }
        });
        return response.data;
    };

    const createLeaveBalance = async (input: any) => {
        const response = await createLeaveBalanceMutation({
            variables: { input }
        });
        return response.data;
    };

    const updateLeaveBalance = async (input: any) => {
        const response = await updateLeaveBalanceMutation({
            variables: { input }
        });
        return response.data;
    };

    const deleteLeaveBalance = async (id: string) => {
        const response = await deleteLeaveBalanceMutation({
            variables: { id }
        });
        return response.data;
    };

    return {
        createLeaveType,
        updateLeaveType,
        deleteLeaveType,
        createLeaveBalance,
        updateLeaveBalance,
        deleteLeaveBalance
    };
}

export function useGraphQLLeaveBalances() {
    const { data, loading, error, refetch } = useQuery<GetLeaveBalanceResponse>(GET_LEAVE_BALANCE, {
        variables: { allOrg: true },
        fetchPolicy: 'network-only',
    })

    return {
        leaveBalanceData: data?.leaveBalance ?? [],
        isLoading: loading,
        error,
        refetch
    }
}

export function useGraphQLLeaveTypes() {
    const { data, loading, error, refetch } = useQuery<GetLeavesResponse>(GET_LEAVES, {
        fetchPolicy: 'network-only',
    })

    return {
        leaveTypes: data?.leaveTypes ?? [],
        isLoading: loading,
        error,
        refetch
    }
}


export function useGraphQLLeaveRequests() {
    const { data, loading, error, refetch } = useQuery<GetLeaveRequestResponse>(GET_LEAVE_REQUESTS, {
        fetchPolicy: 'network-only',
    })

    return {
        leaveRequestData: data?.getLeaveRequests ?? [],
        isLoading: loading,
        error,
        refetch
    }
}

export function useGraphQLLeaveRequestProcess() {
    const [leaveRequestProcessMutation, leaveRequestProcessState] = useMutation(LEAVE_REQUEST_PROCESS, {
        refetchQueries: [{ query: GET_LEAVE_BALANCE }, { query: GET_LEAVE_REQUESTS }]
    })

    const leaveRequestProcess = async (input: {
        requestId: string;
        status: string;
        comments: string;
    }) => {
        const response = await leaveRequestProcessMutation({
            variables: { input },
        })
        return response.data
    }

    return {
        leaveRequestProcess,
        leaveRequestProcessLoading: leaveRequestProcessState.loading,
        leaveRequestProcessError: leaveRequestProcessState.error,
    }

}

export function useGraphQLCompanyHolidays() {
    const { data, loading, error, refetch } = useQuery<GetCompanyHolidaysResponse>(GET_COMPANY_HOLIDAYS, {
        fetchPolicy: 'network-only',
    })

    return {
        companyHolidays: data?.companyHolidays ?? [],
        isLoading: loading,
        error,
        refetch
    }
}

export function useGraphQLCompanyHolidayMutations() {
    const [createHolidayMutation] = useMutation(CREATE_COMPANY_HOLIDAY, {
        refetchQueries: [{ query: GET_COMPANY_HOLIDAYS }]
    });

    const [updateHolidayMutation] = useMutation(UPDATE_COMPANY_HOLIDAY, {
        refetchQueries: [{ query: GET_COMPANY_HOLIDAYS }]
    });

    const [deleteHolidayMutation] = useMutation(DELETE_COMPANY_HOLIDAY, {
        refetchQueries: [{ query: GET_COMPANY_HOLIDAYS }]
    });

    const createCompanyHoliday = async (input: any) => {
        const response = await createHolidayMutation({
            variables: { input }
        });
        return response.data;
    };

    const updateCompanyHoliday = async (input: any) => {
        const response = await updateHolidayMutation({
            variables: { input }
        });
        return response.data;
    };

    const deleteCompanyHoliday = async (id: string) => {
        const response = await deleteHolidayMutation({
            variables: { id }
        });
        return response.data;
    };

    return {
        createCompanyHoliday,
        updateCompanyHoliday,
        deleteCompanyHoliday
    };
}
