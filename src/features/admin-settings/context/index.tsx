"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from "react";
import { useToast } from "@galyan/ui";
import { useAutoRefresh } from "@/components/admin";
import type {
  AddSettingFormValues,
  CategoryTab,
  EditSettingFormValues,
  PlatformSetting,
  SettingsPageContextType,
} from "../types";
import { initialSettingsState, settingsReducer } from "./reducer";
import * as actions from "./action";
import {
  createSettingApi,
  fetchSettingsApi,
  getApiErrorMessage,
  removeSettingApi,
  updateSettingApi,
} from "./api";

const SettingsPageContext = createContext<SettingsPageContextType | undefined>(
  undefined,
);

export function SettingsPageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, dispatch] = useReducer(settingsReducer, initialSettingsState);
  const { toast } = useToast();

  // Background refreshes keep the page (and unsaved drafts) on screen.
  const hasData = useRef(false);
  useEffect(() => {
    hasData.current = state.data !== null;
  }, [state.data]);

  const load = useCallback(
    () => fetchSettingsApi(dispatch, hasData.current),
    [],
  );
  useAutoRefresh(load);

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
        await updateSettingApi(setting.key, { value: draft.trim() });
        dispatch(actions.clearDraft(setting.key));
        toast.success(
          setting.isSecret
            ? `Replaced the value of ${setting.label}.`
            : `Saved ${setting.label}.`,
        );
        await load();
        return true;
      } catch (err) {
        toast.error(
          getApiErrorMessage(err, `Could not save ${setting.label}.`),
        );
        return false;
      } finally {
        dispatch(actions.setSaving(setting.key, false));
      }
    },
    [drafts, load, toast],
  );

  const openAdd = useCallback(() => dispatch(actions.setAddOpen(true)), []);
  const closeAdd = useCallback(() => dispatch(actions.setAddOpen(false)), []);

  const createSetting = useCallback(
    async (values: AddSettingFormValues) => {
      dispatch(actions.setCreating(true));
      try {
        const created = await createSettingApi({
          key: values.key,
          value: values.value,
          description: values.description || undefined,
          category: values.category,
          isSecret: values.isSecret,
        });
        toast.success(`Added ${created.key}.`);
        dispatch(actions.setAddOpen(false));
        dispatch(actions.setActiveTab(created.category));
        await load();
        return true;
      } catch (err) {
        toast.error(getApiErrorMessage(err, "Could not add the setting."));
        return false;
      } finally {
        dispatch(actions.setCreating(false));
      }
    },
    [load, toast],
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
        await updateSettingApi(editTarget.key, {
          description: values.description,
          category: values.category,
        });
        toast.success(`Updated ${editTarget.key}.`);
        dispatch(actions.setEditTarget(null));
        await load();
        return true;
      } catch (err) {
        toast.error(getApiErrorMessage(err, "Could not update the setting."));
        return false;
      } finally {
        dispatch(actions.setUpdatingDetails(false));
      }
    },
    [editTarget, load, toast],
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
      const result = await removeSettingApi(deleteTarget.key);
      dispatch(actions.clearDraft(deleteTarget.key));
      toast.success(
        result.resetToDefault
          ? `${deleteTarget.label} is back to its default.`
          : `Deleted ${deleteTarget.key}.`,
      );
      dispatch(actions.setDeleteTarget(null));
      await load();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Could not remove the setting."));
    } finally {
      dispatch(actions.setDeleting(false));
    }
  }, [deleteTarget, load, toast]);

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
}

export function useSettingsContext(): SettingsPageContextType {
  const ctx = useContext(SettingsPageContext);
  if (!ctx) {
    throw new Error(
      "useSettingsContext must be used within a SettingsPageProvider",
    );
  }
  return ctx;
}
