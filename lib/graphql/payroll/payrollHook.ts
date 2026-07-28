import { useQuery, useMutation } from "@apollo/client/react";
import { GET_SALARY_STRUCTURES, GET_SALARY_COMPONENTS } from "./queries";
import { ASSIGN_SALARY_TO_EMPLOYEE } from "./mutations";
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
    const [assignSalary] = useMutation<{ assignSalaryToEmployee: boolean }>(ASSIGN_SALARY_TO_EMPLOYEE);

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
            return { success: !!data?.assignSalaryToEmployee };
        } catch (error: any) {
            console.error("Error assigning salary:", error);
            return { success: false, error: error.message };
        }
    };

    return {
        assignSalaryToEmployee,
    };
};
