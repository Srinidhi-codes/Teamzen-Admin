import { OrganizationResponse, OfficeLocationResponse, DepartmentResponse, DesignationResponse } from "./types";
import { GET_ORGANIZATIONS, GET_OFFICE_LOCATIONS, GET_DEPARTMENTS, GET_DESIGNATIONS } from "./queries";
import { useQuery } from "@apollo/client/react";

export function useGraphQLOrganizations(){

    const {data, loading, error, refetch} = useQuery<OrganizationResponse>(GET_ORGANIZATIONS,{
        fetchPolicy: 'cache-and-network',
    })

    return{
        organizations: data?.organizations,
        isOrganizationsLoading: loading,
        isOrganizationsError: error,
        refetchOrganizations: refetch
    }
}


export function useGraphQLOfficeLocations(){
    const {data, loading, error, refetch} = useQuery<OfficeLocationResponse>(GET_OFFICE_LOCATIONS,{
        fetchPolicy: 'cache-and-network',
    })
    return{
        officeLocations: data?.officeLocations,
        isOfficeLocationsLoading: loading,
        isOfficeLocationsError: error,
        refetchOfficeLocations: refetch
    }
}

export function useGraphQLDepartments(){
    const {data, loading, error, refetch} = useQuery<DepartmentResponse>(GET_DEPARTMENTS,{
        fetchPolicy: 'cache-and-network',
    })
    return{
        departments: data?.departments,
        isDepartmentsLoading: loading,
        isDepartmentsError: error,
        refetchDepartments: refetch
    }
}

export function useGraphQLDesignations(){
    const {data, loading, error, refetch} = useQuery<DesignationResponse>(GET_DESIGNATIONS,{
        fetchPolicy: 'cache-and-network',
    })
    return{
        designations: data?.designations,
        isDesignationsLoading: loading,
        isDesignationsError: error,
        refetchDesignations: refetch
    }
}