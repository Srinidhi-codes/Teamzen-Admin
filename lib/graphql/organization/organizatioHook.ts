import { OrganizationResponse, OfficeLocationResponse, DepartmentResponse, DesignationResponse, CreateOrganizationInput, CreateOfficeLocationInput, CreateDepartmentInput, CreateDesignationInput, OrganizationInput, DepartmentInput, DesignationInput, UpdateOfficeLocationInput } from "./types";
import { GET_ORGANIZATIONS, GET_OFFICE_LOCATIONS, GET_DEPARTMENTS, GET_DESIGNATIONS } from "./queries";
import { useMutation, useQuery } from "@apollo/client/react";
import { ACTIVATE_DEPARTMENT, ACTIVATE_DESIGNATION, ACTIVATE_OFFICE_LOCATION, ACTIVATE_ORGANIZATION, CREATE_DEPARTMENT, CREATE_DESIGNATION, CREATE_OFFICE_LOCATION, CREATE_ORGANIZATION, SUSPEND_DEPARTMENT, SUSPEND_DESIGNATION, SUSPEND_OFFICE_LOCATION, SUSPEND_ORGANIZATION, UPDATE_DEPARTMENT, UPDATE_DESIGNATION, UPDATE_OFFICE_LOCATION, UPDATE_ORGANIZATION } from "./mutations";
import { toast } from "sonner";

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

// ORGANIZATION MUTATIONS

export function useGraphQLOrganizationMutation(){
    const [createOrganizationMutation, createOrganizationMutationState] = useMutation(CREATE_ORGANIZATION,{
        refetchQueries: [{query: GET_ORGANIZATIONS}],
        onError: (error) => {
            toast.error(error.message)
        }
    })

    const createOrganization = async (input: CreateOrganizationInput) => {
        const response = await createOrganizationMutation({
            variables: { input },
        })
        return response.data
    }

    return{
        createOrganization,
        isCreatingOrganizationLoading: createOrganizationMutationState.loading,
        isCreatingOrganizationError: createOrganizationMutationState.error
    }
}

export function useGraphQLUpdateOrganizationMutation(){
    const [updateOrganizationMutation, updateOrganizationMutationState] = useMutation(UPDATE_ORGANIZATION,{
        refetchQueries: [{query: GET_ORGANIZATIONS}],
        onError: (error) => {
            toast.error(error.message)
        }
    })

    const updateOrganization = async (input: OrganizationInput) => {
        const response = await updateOrganizationMutation({
            variables: { input },
        })
        return response.data
    }

    return{
        updateOrganization,
        isUpdatingOrganizationLoading: updateOrganizationMutationState.loading,
        isUpdatingOrganizationError: updateOrganizationMutationState.error
    }
}

export function useGraphQLSuspendOrganizationMutation(){
    const [suspendOrganizationMutation, suspendOrganizationMutationState] = useMutation(SUSPEND_ORGANIZATION,{
        refetchQueries: [{query: GET_ORGANIZATIONS}],
        onError: (error) => {
            toast.error(error.message)
        }
    })

    const suspendOrganization = async(organizationId: string) => {
        const response = await suspendOrganizationMutation({
            variables: { organizationId },
        })
        return response.data
    }

    return {
        suspendOrganization,
        isSuspendingOrganizationLoading: suspendOrganizationMutationState.loading,
        isSuspendingOrganizationError: suspendOrganizationMutationState.error
    }
}

export function useGraphQLActivateOrganizationMutation(){
    const [activateOrganizationMutation, activateOrganizationMutationState] = useMutation(ACTIVATE_ORGANIZATION,{
        refetchQueries: [{query: GET_ORGANIZATIONS}],
        onError: (error) => {
            toast.error(error.message)
        }
    })

    const activateOrganization = async(organizationId: string) => {
        const response = await activateOrganizationMutation({
            variables: { organizationId },
        })
        return response.data
    }

    return {
        activateOrganization,
        isActivatingOrganizationLoading: activateOrganizationMutationState.loading,
        isActivatingOrganizationError: activateOrganizationMutationState.error
    }
}

// OFFICE MUTATION

export function useGraphQLCreateOfficeLocationMutation(){
    const [createOfficeLocationMutation, createOfficeLocationMutationState] = useMutation(CREATE_OFFICE_LOCATION,{
        refetchQueries:[{query: GET_OFFICE_LOCATIONS}],
        onError: (error) => {
            toast.error(error.message)
        }
    })

    const createOfficeLocation = async(input: CreateOfficeLocationInput) => {
        const response = await createOfficeLocationMutation({
            variables: {input},
        })
        return response.data
    }

    return {
        createOfficeLocation,
        isCreatingOfficeLocationLoading: createOfficeLocationMutationState.loading,
        isCreatingOfficeLocationError: createOfficeLocationMutationState.error
    }
}

export function useGraphQLUpdateOfficeLocationMutation(){
    const [updateOfficeLocationMutation, updateOfficeLocationMutationState] = useMutation(UPDATE_OFFICE_LOCATION,{
        refetchQueries: [{query: GET_OFFICE_LOCATIONS}],
        onError: (error) => {
            toast.error(error.message)
        }
    })

    const updateOfficeLocation = async (input: UpdateOfficeLocationInput) => {
        const response = await updateOfficeLocationMutation({
            variables: { input },
        })
        return response.data
    }

    return{
        updateOfficeLocation,
        isUpdatingOfficeLocationLoading: updateOfficeLocationMutationState.loading,
        isUpdatingOfficeLocationError: updateOfficeLocationMutationState.error
    }
}

export function useGraphQLSuspendOfficeLocationMutation(){
    const [suspendOfficeLocationMutation, suspendOfficeLocationMutationState] = useMutation(SUSPEND_OFFICE_LOCATION,{
        refetchQueries: [{query: GET_OFFICE_LOCATIONS}],
        onError: (error) => {
            toast.error(error.message)
        }
    })

    const suspendOfficeLocation = async(officeLocationId: string) => {
        const response = await suspendOfficeLocationMutation({
            variables: { officeLocationId },
        })
        return response.data
    }

    return {
        suspendOfficeLocation,
        isSuspendingOfficeLocationLoading: suspendOfficeLocationMutationState.loading,
        isSuspendingOfficeLocationError: suspendOfficeLocationMutationState.error
    }
}

export function useGraphQLActivateOfficeLocationMutation(){
    const [activateOfficeLocationMutation, activateOfficeLocationMutationState] = useMutation(ACTIVATE_OFFICE_LOCATION,{
        refetchQueries: [{query: GET_OFFICE_LOCATIONS}],
        onError: (error) => {
            toast.error(error.message)
        }
    })

    const activateOfficeLocation = async(officeLocationId: string) => {
        const response = await activateOfficeLocationMutation({
            variables: { officeLocationId },
        })
        return response.data
    }

    return {
        activateOfficeLocation,
        isActivatingOfficeLocationLoading: activateOfficeLocationMutationState.loading,
        isActivatingOfficeLocationError: activateOfficeLocationMutationState.error
    }
}

// Department Mutation 

export function useGraphQLDepartmentMutation(){
    const [createDepartmentMutation, createDepartmentMutationState] = useMutation(CREATE_DEPARTMENT,{
        refetchQueries:[{query: GET_DEPARTMENTS}],
        onError: (error) => {
            toast.error(error.message)
        }
    })

    const createDepartment = async(input: CreateDepartmentInput) => {
        const response = await createDepartmentMutation({
            variables: {input},
        })
        return response.data
    }

    return {
        createDepartment,
        isCreatingDepartmentLoading: createDepartmentMutationState.loading,
        isCreatingDepartmentError: createDepartmentMutationState.error
    }
}

export function useGraphQLUpdateDepartmentMutation(){
    const [updateDepartmentMutation, updateDepartmentMutationState] = useMutation(UPDATE_DEPARTMENT,{
        refetchQueries: [{query: GET_DEPARTMENTS}],
        onError: (error) => {
            toast.error(error.message)
        }
    })

    const updateDepartment = async (input: DepartmentInput) => {
        const response = await updateDepartmentMutation({
            variables: { input },
        })
        return response.data
    }

    return{
        updateDepartment,
        isUpdatingDepartmentLoading: updateDepartmentMutationState.loading,
        isUpdatingDepartmentError: updateDepartmentMutationState.error
    }
}

export function useGraphQLSuspendDepartmentMutation(){
    const [suspendDepartmentMutation, suspendDepartmentMutationState] = useMutation(SUSPEND_DEPARTMENT,{
        refetchQueries: [{query: GET_DEPARTMENTS}],
        onError: (error) => {
            toast.error(error.message)
        }
    })

    const suspendDepartment = async(departmentId: string) => {
        const response = await suspendDepartmentMutation({
            variables: { departmentId },
        })
        return response.data
    }

    return {
        suspendDepartment,
        isSuspendingDepartmentLoading: suspendDepartmentMutationState.loading,
        isSuspendingDepartmentError: suspendDepartmentMutationState.error
    }
}

export function useGraphQLActivateDepartmentMutation(){
    const [activateDepartmentMutation, activateDepartmentMutationState] = useMutation(ACTIVATE_DEPARTMENT,{
        refetchQueries: [{query: GET_DEPARTMENTS}],
        onError: (error) => {
            toast.error(error.message)
        }
    })

    const activateDepartment = async(departmentId: string) => {
        const response = await activateDepartmentMutation({
            variables: { departmentId },
        })
        return response.data
    }

    return {
        activateDepartment,
        isActivatingDepartmentLoading: activateDepartmentMutationState.loading,
        isActivatingDepartmentError: activateDepartmentMutationState.error
    }
}

// Designation Mutation

export function useGraphQLDesignationMutation(){
    const [createDesignationMutation, createDesignationMutationState] = useMutation(CREATE_DESIGNATION,{
        refetchQueries:[{query: GET_DESIGNATIONS}],
        onError: (error) => {
            toast.error(error.message)
        }
    })

    const createDesignation = async(input: CreateDesignationInput) => {
        const response = await createDesignationMutation({
            variables: {input},
        })
        return response.data
    }

    return {
        createDesignation,
        isCreatingDesignationLoading: createDesignationMutationState.loading,
        isCreatingDesignationError: createDesignationMutationState.error
    }
}

export function useGraphQLUpdateDesignationMutation(){
    const [updateDesignationMutation, updateDesignationMutationState] = useMutation(UPDATE_DESIGNATION,{
        refetchQueries: [{query: GET_DESIGNATIONS}],
        onError: (error) => {
            toast.error(error.message)
        }
    })

    const updateDesignation = async (input: DesignationInput) => {
        const response = await updateDesignationMutation({
            variables: { input },
        })
        return response.data
    }

    return{
        updateDesignation,
        isUpdatingDesignationLoading: updateDesignationMutationState.loading,
        isUpdatingDesignationError: updateDesignationMutationState.error
    }
}

export function useGraphQLSuspendDesignationMutation(){
    const [suspendDesignationMutation, suspendDesignationMutationState] = useMutation(SUSPEND_DESIGNATION,{
        refetchQueries: [{query: GET_DESIGNATIONS}],
        onError: (error) => {
            toast.error(error.message)
        }
    })

    const suspendDesignation = async(designationId: string) => {
        const response = await suspendDesignationMutation({
            variables: { designationId },
        })
        return response.data
    }

    return {
        suspendDesignation,
        isSuspendingDesignationLoading: suspendDesignationMutationState.loading,
        isSuspendingDesignationError: suspendDesignationMutationState.error
    }
}

export function useGraphQLActivateDesignationMutation(){
    const [activateDesignationMutation, activateDesignationMutationState] = useMutation(ACTIVATE_DESIGNATION,{
        refetchQueries: [{query: GET_DESIGNATIONS}],
        onError: (error) => {
            toast.error(error.message)
        }
    })

    const activateDesignation = async(designationId: string) => {
        const response = await activateDesignationMutation({
            variables: { designationId },
        })
        return response.data
    }

    return {
        activateDesignation,
        isActivatingDesignationLoading: activateDesignationMutationState.loading,
        isActivatingDesignationError: activateDesignationMutationState.error
    }
}