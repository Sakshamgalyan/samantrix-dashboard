"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
} from "react";
import { useToast } from "@galyan/ui";
import { POLL_INTERVAL_MS, queryErrorMessage } from "@/store";
import type { AddSettingFormValues, EditSettingFormValues } from "@/features/admin-settings/types/forms";
import type { PlatformSetting } from "@/features/admin-settings/types/api";
import type { SettingsPageContextType } from "@/features/admin-settings/types/context";
import type { CategoryTab, SettingsPageState } from "@/features/admin-settings/types/state";
import { initialSettingsState, settingsReducer } from "@/features/admin-settings/context/reducer";
import * as actions from "@/features/admin-settings/context/action";
import {
  useCreatePlatformSettingMutation,
  useGetPlatformSettingsQuery,
  useRemovePlatformSettingMutation,
  useUpdatePlatformSettingMutation,
} from "@/features/admin-settings/context/api";

export const SettingsPageContext = createContext<SettingsPageContextType | undefined>(
  undefined,
);

export const SettingsPageProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [ui, dispatch] = useReducer(settingsReducer, initialSettingsState);
  const { toast } = useToast();

  // Refreshes every minute while open (as before); background refreshes keep drafts on screen
  const query = useGetPlatformSettingsQuery(undefined, {
    pollingInterval: POLL_INTERVAL_MS,
    skipPollingIfUnfocused: true,
  });
  const { refetch } = query;
  const [createSettingMutation] = useCreatePlatformSettingMutation();
  const [updateSettingMutation] = useUpdatePlatformSettingMutation();
  const [removeSettingMutation] = useRemovePlatformSettingMutation();

  // Keep the last good data on screen; a failed refresh is reported as stale data
  const state = useMemo<SettingsPageState>(() => {
    const data = query.data ?? null;
    const message = query.error
      ? queryErrorMessage(query.error, "Could not load the configuration.")
      : null;
    return {
      ...ui,
      data,
      loading: query.isLoading,
      refreshing: query.isFetching,
      loadError: data ? null : message,
      refreshError: data ? message : null,
      fetchedAt: query.fulfilledTimeStamp
        ? new Date(query.fulfilledTimeStamp).toISOString()
        : null,
    };
  }, [ui, query.data, query.error, query.isLoading, query.isFetching, query.fulfilledTimeStamp]);

  const load = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const setActiveTab = useCallback((tab: CategoryTab) => {
    dispatch(actions.setActiveTab(tab));
  }, []);

  const setDraft = useCallback((key: string, value: string) => {
    dispatch(actions.setDraft(key, value));
  }, []);

  const discardDraft = useCallback((key: string) => {
    dispatch(actions.clearDraft(key));
  }, []);

  const drafts = state.drafts;
  const saveSetting = useCallback(
    async (setting: PlatformSetting) => {
      const draft = drafts[setting.key];
      if (draft === undefined) return false;
      dispatch(actions.setSaving(setting.key, true));
      try {
        await updateSettingMutation({
          key: setting.key,
          body: { value: draft.trim() },
        }).unwrap();
        dispatch(actions.clearDraft(setting.key));
        toast.success(
          setting.isSecret
            ? `Replaced the value of ${setting.label}.`
            : `Saved ${setting.label}.`,
        );
        return true;
      } catch (err) {
        toast.error(
          queryErrorMessage(err, `Could not save ${setting.label}.`),
        );
        return false;
      } finally {
        dispatch(actions.setSaving(setting.key, false));
      }
    },
    [drafts, updateSettingMutation, toast],
  );

  const openAdd = useCallback(() => dispatch(actions.setAddOpen(true)), []);
  const closeAdd = useCallback(() => dispatch(actions.setAddOpen(false)), []);

  const createSetting = useCallback(
    async (values: AddSettingFormValues) => {
      dispatch(actions.setCreating(true));
      try {
        const created = await createSettingMutation({
          key: values.key,
          value: values.value,
          description: values.description || undefined,
          category: values.category,
          isSecret: values.isSecret,
        }).unwrap();
        toast.success(`Added ${created.key}.`);
        dispatch(actions.setAddOpen(false));
        dispatch(actions.setActiveTab(created.category));
        return true;
      } catch (err) {
        toast.error(queryErrorMessage(err, "Could not add the setting."));
        return false;
      } finally {
        dispatch(actions.setCreating(false));
      }
    },
    [createSettingMutation, toast],
  );

  const openEdit = useCallback((setting: PlatformSetting) => {
    dispatch(actions.setEditTarget(setting));
  }, []);
  const closeEdit = useCallback(() => dispatch(actions.setEditTarget(null)), []);

  const editTarget = state.editTarget;
  const updateDetails = useCallback(
    async (values: EditSettingFormValues) => {
      if (!editTarget) return false;
      dispatch(actions.setUpdatingDetails(true));
      try {
        await updateSettingMutation({
          key: editTarget.key,
          body: { description: values.description, category: values.category },
        }).unwrap();
        toast.success(`Updated ${editTarget.key}.`);
        dispatch(actions.setEditTarget(null));
        return true;
      } catch (err) {
        toast.error(queryErrorMessage(err, "Could not update the setting."));
        return false;
      } finally {
        dispatch(actions.setUpdatingDetails(false));
      }
    },
    [editTarget, updateSettingMutation, toast],
  );

  const openDelete = useCallback((setting: PlatformSetting) => {
    dispatch(actions.setDeleteTarget(setting));
  }, []);
  const closeDelete = useCallback(
    () => dispatch(actions.setDeleteTarget(null)),
    [],
  );

  const deleteTarget = state.deleteTarget;
  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    dispatch(actions.setDeleting(true));
    try {
      const result = await removeSettingMutation(deleteTarget.key).unwrap();
      dispatch(actions.clearDraft(deleteTarget.key));
      toast.success(
        result.resetToDefault
          ? `${deleteTarget.label} is back to its default.`
          : `Deleted ${deleteTarget.key}.`,
      );
      dispatch(actions.setDeleteTarget(null));
    } catch (err) {
      toast.error(queryErrorMessage(err, "Could not remove the setting."));
    } finally {
      dispatch(actions.setDeleting(false));
    }
  }, [deleteTarget, removeSettingMutation, toast]);

  const value = useMemo<SettingsPageContextType>(
    () => ({
      state,
      dispatch,
      canEdit: state.data?.canEdit ?? false,
      load,
      setActiveTab,
      setDraft,
      discardDraft,
      saveSetting,
      openAdd,
      closeAdd,
      createSetting,
      openEdit,
      closeEdit,
      updateDetails,
      openDelete,
      closeDelete,
      confirmDelete,
    }),
    [
      state,
      load,
      setActiveTab,
      setDraft,
      discardDraft,
      saveSetting,
      openAdd,
      closeAdd,
      createSetting,
      openEdit,
      closeEdit,
      updateDetails,
      openDelete,
      closeDelete,
      confirmDelete,
    ],
  );

  return (
    <SettingsPageContext.Provider value={value}>
      {children}
    </SettingsPageContext.Provider>
  );
};

export * from "@/features/admin-settings/context/hooks";

