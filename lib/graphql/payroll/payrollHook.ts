import { useQuery, useMutation } from "@apollo/client/react";
import { GET_SALARY_STRUCTURES, GET_SALARY_COMPONENTS } from "./queries";
import { ASSIGN_SALARY_TO_EMPLOYEE, SAVE_EMPLOYEE_COMPONENT_OVERRIDES } from "./mutations";
import { toast } from "sonner";

export const usePayrollQueries = () => {
    const { data: structuresData, loading: isStructuresLoading, refetch: refetchStructures } = useQuery<{ salaryStructures: any[] }>(GET_SALARY_STRUCTURES);
    const { data: componentsData, loading: isComponentsLoading, refetch: refetchComponents } = useQuery<{ salaryComponents: any[] }>(GET_SALARY_COMPONENTS);

    return {
        salaryStructures: structuresData?.salaryStructures || [],
        isStructuresLoading: isStructuresLoading && !structuresData,
        refetchStructures,
        salaryComponents: componentsData?.salaryComponents || [],
        isComponentsLoading: isComponentsLoading && !componentsData,
        refetchComponents,
    };
};

export const usePayrollMutations = () => {
    const [assignSalary] = useMutation<{ assignSalaryToEmployee: { id: string } }>(ASSIGN_SALARY_TO_EMPLOYEE);
    const [saveOverrides] = useMutation<{ saveEmployeeComponentOverrides: any[] }>(SAVE_EMPLOYEE_COMPONENT_OVERRIDES);

    const assignSalaryToEmployee = async (userId: string, structureId: string, annualCtc: number, effectiveFrom: string) => {
        try {
            const { data } = await assignSalary({
                variables: {
                    userId,
                    structureId,
                    annualCtc,
                    effectiveFrom,
                },
            });
            return { success: !!data?.assignSalaryToEmployee, salary: data?.assignSalaryToEmployee || null };
        } catch (error: any) {
            console.error("Error assigning salary:", error);
            return { success: false, error: error.message };
        }
    };

    const saveEmployeeComponentOverrides = async (
        employeeSalaryId: string,
        overrides: { componentId: string; isExcluded: boolean; overrideValue: number | null }[]
    ) => {
        try {
            const { data } = await saveOverrides({
                variables: { employeeSalaryId, overrides },
            });
            return { success: true, data: data?.saveEmployeeComponentOverrides };
        } catch (error: any) {
            console.error("Error saving overrides:", error);
            return { success: false, error: error.message };
        }
    };

    return {
        assignSalaryToEmployee,
        saveEmployeeComponentOverrides,
    };
};
