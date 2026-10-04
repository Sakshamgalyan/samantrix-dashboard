"use client";

import { Button, Chip, Tooltip } from "@galyan/ui";
import { Lock, Pencil, RotateCcw, Save, Trash2, Undo2 } from "lucide-react";
import { GLASS_ROW } from "@/components/admin";
import { formatDateTime, relativeTime } from "@/lib/format";
import { useSettingsContext } from "../context";
import type { PlatformSetting } from "../types";
import {
  formatValue,
  isDirty,
  validateDraft,
  valueToText,
} from "../common/constants";
import { SettingControl } from "./setting-control";

/** One setting: name, key and status on the left; typed control and save/reset actions on the right. */
export function SettingRow({ setting }: { setting: PlatformSetting }) {
  const {
    state,
    canEdit,
    setDraft,
    discardDraft,
    saveSetting,
    openEdit,
    openDelete,
  } = useSettingsContext();

  const draft = state.drafts[setting.key];
  const saving = state.savingKeys.includes(setting.key);
  const dirty = isDirty(setting, draft);
  const text = draft ?? valueToText(setting);
  const error = dirty ? validateDraft(setting, draft ?? "") : null;
  const overridden = setting.isBuiltIn && !setting.isDefault;

  return (
    <div className={`${GLASS_ROW} p-4`}>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <div className="min-w-0 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-[var(--gy-text)]">
              {setting.label}
            </span>
            {setting.isSecret && (
              <Chip size="sm" variant="warning" icon={<Lock className="size-3" />}>
                <span className="whitespace-nowrap">Secret</span>
              </Chip>
            )}
            {setting.isBuiltIn ? (
              <Chip size="sm" variant={overridden ? "soft" : "neutral"}>
                <span className="whitespace-nowrap">
                  {overridden ? "Customised" : "Default"}
                </span>
              </Chip>
            ) : (
              <Chip size="sm" variant="outline">
                <span className="whitespace-nowrap">Custom</span>
              </Chip>
            )}
            {dirty && (
              <Chip size="sm" variant="warning">
                <span className="whitespace-nowrap">Unsaved</span>
              </Chip>
            )}
          </div>
          {setting.label !== setting.key && (
            <code className="block truncate font-mono text-[11px] text-[var(--gy-text-subtle)]">
              {setting.key}
            </code>
          )}
          {setting.description && (
            <p className="text-xs leading-relaxed text-[var(--gy-text-secondary)]">
              {setting.description}
            </p>
          )}
          <p className="text-[11px] text-[var(--gy-text-subtle)]">
            {setting.isDefault ? (
              "Not stored yet: using the built-in default."
            ) : setting.updatedAt ? (
              <span title={formatDateTime(setting.updatedAt)}>
                Updated {relativeTime(setting.updatedAt)}
                {overridden &&
                  ` · default ${formatValue(setting, setting.defaultValue)}`}
              </span>
            ) : null}
          </p>
        </div>

        <div className="space-y-2">
          <SettingControl
            setting={setting}
            text={text}
            error={error}
            disabled={!canEdit || saving}
            onChange={(value) =>
              value === valueToText(setting) && !setting.isSecret
                ? discardDraft(setting.key)
                : setDraft(setting.key, value)
            }
          />
          {canEdit && (
            <div className="flex flex-wrap items-center justify-end gap-2">
              {dirty ? (
                <>
                  <Button
                    variant="glass"
                    size="sm"
                    leftIcon={<Undo2 className="size-3.5" />}
                    onClick={() => discardDraft(setting.key)}
                    disabled={saving}
                  >
                    Discard
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<Save className="size-3.5" />}
                    isLoading={saving}
                    disabled={error !== null}
                    onClick={() => void saveSetting(setting)}
                  >
                    Save
                  </Button>
                </>
              ) : (
                <>
                  {!setting.isBuiltIn && (
                    <Tooltip content="Edit description or category">
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<Pencil className="size-3.5" />}
                        onClick={() => openEdit(setting)}
                      >
                        Details
                      </Button>
                    </Tooltip>
                  )}
                  {overridden && (
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<RotateCcw className="size-3.5" />}
                      onClick={() => openDelete(setting)}
                    >
                      Reset to default
                    </Button>
                  )}
                  {!setting.isBuiltIn && (
                    <Button
                      variant="danger-soft"
                      size="sm"
                      leftIcon={<Trash2 className="size-3.5" />}
                      onClick={() => openDelete(setting)}
                    >
                      Delete
                    </Button>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
