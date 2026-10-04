"use client";

import { Input, Toggle } from "@galyan/ui";
import { KeyRound } from "lucide-react";
import type { PlatformSetting } from "../types";

interface SettingControlProps {
  setting: PlatformSetting;
  /** Text currently in the control (draft or stored value). */
  text: string;
  error: string | null;
  disabled: boolean;
  onChange: (value: string) => void;
}

/** The Galyan input that fits a setting's type: Toggle, number, email, text or write-only secret. */
export function SettingControl({
  setting,
  text,
  error,
  disabled,
  onChange,
}: SettingControlProps) {
  if (setting.isSecret) {
    return (
      <Input
        size="sm"
        type="password"
        autoComplete="new-password"
        value={text}
        onChange={(e) => onChange(e.target.value)}
        placeholder={
          setting.hasValue
            ? `${setting.maskedValue ?? "Stored"} · type to replace`
            : "No value stored · enter one"
        }
        leftIcon={<KeyRound className="size-3.5" />}
        isDisabled={disabled}
        error={error ?? undefined}
        fullWidth
        aria-label={`New value for ${setting.label}`}
      />
    );
  }

  if (setting.type === "boolean") {
    const on = text === "true";
    return (
      <div className="flex h-9 items-center justify-end gap-3">
        <span className="text-xs font-medium text-[var(--gy-text-secondary)]">
          {on ? "On" : "Off"}
        </span>
        <Toggle
          size="md"
          checked={on}
          onChange={(e) => onChange(e.target.checked ? "true" : "false")}
          isDisabled={disabled}
          aria-label={setting.label}
        />
      </div>
    );
  }

  return (
    <Input
      size="sm"
      type={
        setting.type === "number"
          ? "number"
          : setting.type === "email"
            ? "email"
            : "text"
      }
      inputMode={setting.type === "number" ? "numeric" : undefined}
      min={setting.min ?? undefined}
      max={setting.max ?? undefined}
      step={setting.type === "number" ? 1 : undefined}
      value={text}
      onChange={(e) => onChange(e.target.value)}
      isDisabled={disabled}
      error={error ?? undefined}
      helperText={
        !error && setting.type === "number" && setting.min !== null
          ? `${setting.min}–${setting.max}`
          : undefined
      }
      fullWidth
      aria-label={setting.label}
    />
  );
}
