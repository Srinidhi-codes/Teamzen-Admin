import { useMutation, useQuery } from "@apollo/client/react";
import {
  LETTER_TEMPLATES,
  ONBOARDING_DETAIL,
  ONBOARDING_OVERVIEW,
  ONBOARDING_TEMPLATES,
  ONBOARDINGS,
} from "./queries";
import {
  ACTIVATE_ONBOARDING,
  CANCEL_ONBOARDING,
  COMPLETE_ONBOARDING_TASK,
  CREATE_LETTER_TEMPLATE,
  CREATE_ONBOARDING_TEMPLATE,
  DELETE_TASK_DEFINITION,
  GENERATE_OFFER,
  REORDER_TASK_DEFINITIONS,
  SEND_PREBOARDING_INVITE,
  START_PREBOARDING,
  SUGGEST_ONBOARDING_TASKS,
  POLISH_OFFER_LETTER,
  UPDATE_LETTER_TEMPLATE,
  UPDATE_ONBOARDING_TEMPLATE,
  UPSERT_TASK_DEFINITION,
  VERIFY_EMPLOYEE_DOCUMENT,
} from "./mutations";
import type {
  EmployeeOnboarding,
  LetterTemplate,
  OnboardingOverview,
  OnboardingTemplate,
} from "./types";

export function useOnboardingOverview(organizationId?: string) {
  const { data, loading, error, refetch } = useQuery<{
    onboardingOverview: OnboardingOverview;
  }>(ONBOARDING_OVERVIEW, {
    variables: { organizationId: organizationId || undefined },
    fetchPolicy: "cache-and-network",
  });
  return {
    overview: data?.onboardingOverview,
    isLoading: loading && !data,
    error,
    refetch,
  };
}

export function useOnboardings(vars?: {
  organizationId?: string;
  status?: string;
  search?: string;
}) {
  const { data, loading, error, refetch } = useQuery<{
    onboardings: EmployeeOnboarding[];
  }>(ONBOARDINGS, {
    variables: {
      organizationId: vars?.organizationId || undefined,
      status: vars?.status || undefined,
      search: vars?.search || undefined,
    },
    fetchPolicy: "cache-and-network",
  });
  return {
    onboardings: data?.onboardings ?? [],
    isLoading: loading && !data,
    error,
    refetch,
  };
}

export function useOnboardingDetail(id?: string) {
  const { data, loading, error, refetch } = useQuery<{
    onboardingDetail: EmployeeOnboarding | null;
  }>(ONBOARDING_DETAIL, {
    variables: { id },
    skip: !id,
    fetchPolicy: "cache-and-network",
  });
  return {
    onboarding: data?.onboardingDetail ?? null,
    isLoading: loading && !data,
    error,
    refetch,
  };
}

export function useOnboardingTemplates(organizationId?: string) {
  const { data, loading, error, refetch } = useQuery<{
    onboardingTemplates: OnboardingTemplate[];
  }>(ONBOARDING_TEMPLATES, {
    variables: { organizationId: organizationId || undefined },
    fetchPolicy: "cache-and-network",
  });
  return {
    templates: data?.onboardingTemplates ?? [],
    isLoading: loading && !data,
    error,
    refetch,
  };
}

export function useLetterTemplates(organizationId?: string, letterType?: string) {
  const { data, loading, error, refetch } = useQuery<{
    letterTemplates: LetterTemplate[];
  }>(LETTER_TEMPLATES, {
    variables: {
      organizationId: organizationId || undefined,
      letterType: letterType || undefined,
    },
    fetchPolicy: "cache-and-network",
  });
  return {
    templates: data?.letterTemplates ?? [],
    isLoading: loading && !data,
    error,
    refetch,
  };
}

export function useOnboardingMutations() {
  const [startPreboarding, startState] = useMutation(START_PREBOARDING);
  const [sendInvite, sendState] = useMutation(SEND_PREBOARDING_INVITE);
  const [activate, activateState] = useMutation(ACTIVATE_ONBOARDING);
  const [cancel, cancelState] = useMutation(CANCEL_ONBOARDING);
  const [completeTask, completeState] = useMutation(COMPLETE_ONBOARDING_TASK);
  const [verifyDoc, verifyState] = useMutation(VERIFY_EMPLOYEE_DOCUMENT);
  const [generateOffer, offerState] = useMutation(GENERATE_OFFER);
  const [createTemplate, createTplState] = useMutation(CREATE_ONBOARDING_TEMPLATE);
  const [updateTemplate, updateTplState] = useMutation(UPDATE_ONBOARDING_TEMPLATE);
  const [upsertTask, upsertTaskState] = useMutation(UPSERT_TASK_DEFINITION);
  const [deleteTaskDef, deleteTaskState] = useMutation(DELETE_TASK_DEFINITION);
  const [reorderTasks, reorderState] = useMutation(REORDER_TASK_DEFINITIONS);
  const [suggestTasks, suggestState] = useMutation(SUGGEST_ONBOARDING_TASKS);
  const [polishOffer, polishState] = useMutation(POLISH_OFFER_LETTER);
  const [createLetter, createLetterState] = useMutation(CREATE_LETTER_TEMPLATE);
  const [updateLetter, updateLetterState] = useMutation(UPDATE_LETTER_TEMPLATE);

  return {
    startPreboarding,
    sendInvite,
    activate,
    cancel,
    completeTask,
    verifyDoc,
    generateOffer,
    createTemplate,
    updateTemplate,
    upsertTask,
    deleteTaskDef,
    reorderTasks,
    suggestTasks,
    polishOffer,
    createLetter,
    updateLetter,
    loading:
      startState.loading ||
      sendState.loading ||
      activateState.loading ||
      cancelState.loading ||
      completeState.loading ||
      verifyState.loading ||
      offerState.loading ||
      createTplState.loading ||
      updateTplState.loading ||
      upsertTaskState.loading ||
      deleteTaskState.loading ||
      reorderState.loading ||
      suggestState.loading ||
      polishState.loading ||
      createLetterState.loading ||
      updateLetterState.loading,
  };
}
