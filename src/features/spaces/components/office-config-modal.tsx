"use client";

import React, { useCallback } from "react";
import {
  Button,
  Chip,
  Dropdown,
  Input,
  Modal,
  Toggle,
  Typography,
  useToast,
} from "@galyan/ui";
import {
  Building2,
  Check,
  Layers,
  Megaphone,
  Sparkles,
  Volume2,
} from "lucide-react";
import { queryErrorMessage } from "@/store";
import { useSpaces } from "../context";
import {
  closeConfigModalAction,
  setActionErrorAction,
  setConfigAllow2dModeAction,
  setConfigAmbientSoundAction,
  setConfigAmbientVolumeAction,
  setConfigCollisionPhysicsAction,
  setConfigDefaultDimensionAction,
  setConfigEnableGuestAccessAction,
  setConfigMapAssetKeyAction,
  setConfigMaxCapacityAction,
  setConfigNameAction,
  setConfigProximityRadiusAction,
  setConfigWelcomeMessageAction,
  setIsSavingAction,
} from "../context/action";
import { useUpdateOrgOfficeMutation } from "../context/api";
import { AMBIENT_SOUND_OPTIONS, OFFICE_THEMES } from "../common/constants";

export function OfficeConfigModal() {
  const { state, dispatch } = useSpaces();
  const {
    isConfigModalOpen,
    isSaving,
    configName,
    configMapAssetKey,
    configMaxCapacity,
    configDefaultDimension,
    configAllow2dMode,
    configProximityRadius,
    configAmbientSound,
    configAmbientVolume,
    configCollisionPhysics,
    configWelcomeMessage,
    configEnableGuestAccess,
  } = state;

  const { toast } = useToast();
  const [updateOffice, { isLoading: isUpdating }] = useUpdateOrgOfficeMutation();

  const handleClose = useCallback(() => {
    if (isSaving || isUpdating) return;
    dispatch(closeConfigModalAction());
  }, [isSaving, isUpdating, dispatch]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!configName.trim()) {
        toast.error("Please enter an office name.");
        return;
      }

      dispatch(setIsSavingAction(true));
      dispatch(setActionErrorAction(null));

      try {
        await updateOffice({
          name: configName.trim(),
          mapAssetKey: configMapAssetKey,
          maxCapacity: Number(configMaxCapacity) || 100,
          layoutSettings: {
            theme: configMapAssetKey,
            defaultDimension: configDefaultDimension,
            allow2dMode: configAllow2dMode,
            allow3dMode: true,
            proximityVoiceRadius: Number(configProximityRadius) || 120,
            ambientSound: configAmbientSound,
            ambientSoundVolume: Number(configAmbientVolume) || 40,
            collisionPhysics: configCollisionPhysics,
            welcomeBroadcast: configWelcomeMessage.trim(),
            enableGuestAccess: configEnableGuestAccess,
          },
        }).unwrap();

        toast.success("Office space configuration saved successfully.");
        dispatch(closeConfigModalAction());
      } catch (err) {
        const msg = queryErrorMessage(err, "Failed to save office configuration.");
        dispatch(setActionErrorAction(msg));
        toast.error(msg);
      } finally {
        dispatch(setIsSavingAction(false));
      }
    },
    [
      configName,
      configMapAssetKey,
      configMaxCapacity,
      configDefaultDimension,
      configAllow2dMode,
      configProximityRadius,
      configAmbientSound,
      configAmbientVolume,
      configCollisionPhysics,
      configWelcomeMessage,
      configEnableGuestAccess,
      updateOffice,
      dispatch,
      toast,
    ],
  );

  return (
    <Modal
      isOpen={isConfigModalOpen}
      onClose={handleClose}
      title="Configure Virtual Office Space"
      subtitle="Manage digital headquarters branding, architectural theme, dimension view defaults, spatial acoustics, and campus policies."
      size="lg"
      closable={!isSaving && !isUpdating}
      preventBackdropClose={isSaving || isUpdating}
      footer={
        <div className="flex flex-col-reverse sm:flex-row w-full items-stretch sm:items-center justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleClose}
            disabled={isSaving || isUpdating}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            form="office-config-form"
            isLoading={isSaving || isUpdating}
            loadingText="Saving..."
            className="w-full sm:w-auto"
          >
            Save Configuration
          </Button>
        </div>
      }
    >
      <form id="office-config-form" onSubmit={handleSubmit} className="space-y-5 max-h-[calc(80vh-8rem)] overflow-y-auto pr-1">
        {/* Section 1: Workplace Identity & Scale */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 border-b border-[var(--gy-border)] pb-2">
            <Building2 className="size-4 text-[var(--gy-primary)]" />
            <Typography variant="span" weight="semibold" textColor="var(--gy-text)" className="text-sm">
              Workplace Identity &amp; Capacity
            </Typography>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <Input
                label="Office Space Name"
                value={configName}
                onChange={(e) => dispatch(setConfigNameAction(e.target.value))}
                placeholder="e.g. Simantrix Digital Campus"
                required
                fullWidth
              />
            </div>
            <div>
              <Input
                label="Max Concurrent Avatars"
                type="number"
                min={10}
                max={500}
                value={configMaxCapacity.toString()}
                onChange={(e) => dispatch(setConfigMaxCapacityAction(Number(e.target.value) || 10))}
                helperText="Maximum simultaneous avatars inside the virtual office"
                required
                fullWidth
              />
            </div>
          </div>
        </div>

        {/* Section 2: Architectural Theme & Environment */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center gap-2 border-b border-[var(--gy-border)] pb-2">
            <Sparkles className="size-4 text-purple-500" />
            <Typography variant="span" weight="semibold" textColor="var(--gy-text)" className="text-sm">
              Architectural Theme &amp; Campus Style
            </Typography>
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {OFFICE_THEMES.map((theme) => {
              const isSelected = configMapAssetKey === theme.key;
              return (
                <div
                  key={theme.key}
                  onClick={() => dispatch(setConfigMapAssetKeyAction(theme.key))}
                  className={`p-3 rounded-xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                    isSelected
                      ? "border-[var(--gy-primary)] bg-[var(--gy-primary)]/[0.06] ring-2 ring-[var(--gy-primary)]/40 shadow-xs"
                      : "border-[var(--gy-border)] bg-[var(--gy-surface)] hover:border-[var(--gy-border-strong)]"
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className="size-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: theme.accentColor }}
                        />
                        <Typography
                          variant="span"
                          weight="semibold"
                          textColor="var(--gy-text)"
                          className="text-xs truncate block"
                        >
                          {theme.name}
                        </Typography>
                      </div>
                      {isSelected ? (
                        <div className="size-4.5 rounded-full bg-[var(--gy-primary)] text-[var(--gy-primary-fg)] flex items-center justify-center shrink-0">
                          <Check className="size-3 stroke-[3]" />
                        </div>
                      ) : (
                        <Chip size="xs" variant="neutral">
                          {theme.badge}
                        </Chip>
                      )}
                    </div>
                    <Typography
                      variant="small"
                      textColor="var(--gy-text-secondary)"
                      className="text-[11px] leading-tight block line-clamp-2"
                    >
                      {theme.description}
                    </Typography>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 3: Dimension Mode & Floorplan */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center gap-2 border-b border-[var(--gy-border)] pb-2">
            <Layers className="size-4 text-blue-500" />
            <Typography variant="span" weight="semibold" textColor="var(--gy-text)" className="text-sm">
              Office Dimension Mode &amp; Navigation
            </Typography>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <Dropdown
                label="Default View for New Members"
                value={configDefaultDimension}
                onChange={(val) => {
                  if (typeof val === "string") {
                    dispatch(setConfigDefaultDimensionAction(val as "3d" | "2d"));
                  }
                }}
                options={[
                  { value: "3d", label: "3D Immersive Office" },
                  { value: "2d", label: "2D Interactive Floorplan" },
                ]}
                helperText="Initial dimension mode when users enter the digital workplace"
              />
            </div>

            <div className="flex items-center justify-between rounded-xl border border-[var(--gy-border)] p-3 bg-[var(--gy-surface-subtle)]">
              <div className="space-y-0.5">
                <Typography
                  variant="p"
                  weight="medium"
                  textColor="var(--gy-text)"
                  className="text-xs font-medium"
                >
                  Allow 2D Floorplan Mode
                </Typography>
                <Typography
                  variant="small"
                  textColor="var(--gy-text-secondary)"
                  className="text-xs block"
                >
                  Allow members to toggle between 3D world and 2D blueprint office
                </Typography>
              </div>
              <Toggle
                size="sm"
                checked={configAllow2dMode}
                onChange={(e) => dispatch(setConfigAllow2dModeAction(e.target.checked))}
              />
            </div>
          </div>
        </div>

        {/* Section 4: Spatial Audio & Ambience */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center gap-2 border-b border-[var(--gy-border)] pb-2">
            <Volume2 className="size-4 text-emerald-500" />
            <Typography variant="span" weight="semibold" textColor="var(--gy-text)" className="text-sm">
              Spatial Audio &amp; Atmosphere
            </Typography>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <Dropdown
                label="Ambient Office Soundtrack"
                value={configAmbientSound}
                onChange={(val) => {
                  if (typeof val === "string") {
                    dispatch(setConfigAmbientSoundAction(val));
                  }
                }}
                options={AMBIENT_SOUND_OPTIONS}
                helperText="Subtle background soundscape played in common hallways"
              />
            </div>

            <div>
              <Input
                label="Soundtrack Volume (%)"
                type="number"
                min={0}
                max={100}
                value={configAmbientVolume.toString()}
                onChange={(e) => dispatch(setConfigAmbientVolumeAction(Number(e.target.value) || 0))}
                helperText="Default background ambient volume level (0 to 100)"
                fullWidth
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <Input
                label="Proximity Voice Radius (Units)"
                type="number"
                min={50}
                max={250}
                value={configProximityRadius.toString()}
                onChange={(e) => dispatch(setConfigProximityRadiusAction(Number(e.target.value) || 120))}
                helperText="Distance (in units) within which avatars can hear spatial voice"
                fullWidth
              />
            </div>

            <div className="flex items-center justify-between rounded-xl border border-[var(--gy-border)] p-3 bg-[var(--gy-surface-subtle)]">
              <div className="space-y-0.5">
                <Typography
                  variant="p"
                  weight="medium"
                  textColor="var(--gy-text)"
                  className="text-xs font-medium"
                >
                  Avatar Physical Collisions
                </Typography>
                <Typography
                  variant="small"
                  textColor="var(--gy-text-secondary)"
                  className="text-xs block"
                >
                  Prevent avatars from walking through walls and closed glass doors
                </Typography>
              </div>
              <Toggle
                size="sm"
                checked={configCollisionPhysics}
                onChange={(e) => dispatch(setConfigCollisionPhysicsAction(e.target.checked))}
              />
            </div>
          </div>
        </div>

        {/* Section 5: Access & Welcome Broadcast */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center gap-2 border-b border-[var(--gy-border)] pb-2">
            <Megaphone className="size-4 text-amber-500" />
            <Typography variant="span" weight="semibold" textColor="var(--gy-text)" className="text-sm">
              Hospitality &amp; Access Control
            </Typography>
          </div>

          <div>
            <Input
              label="Welcome Broadcast Message"
              value={configWelcomeMessage}
              onChange={(e) => dispatch(setConfigWelcomeMessageAction(e.target.value))}
              placeholder="e.g. Welcome to our virtual campus! Join any open huddle."
              helperText="Greeting shown to team members when they step into the lobby"
              fullWidth
            />
          </div>

          <div className="flex items-center justify-between rounded-xl border border-[var(--gy-border)] p-3 bg-[var(--gy-surface-subtle)]">
            <div className="space-y-0.5">
              <Typography
                variant="p"
                weight="medium"
                textColor="var(--gy-text)"
                className="text-xs font-medium"
              >
                Allow Guest Visitor Passes
              </Typography>
              <Typography
                variant="small"
                textColor="var(--gy-text-secondary)"
                className="text-xs block"
              >
                Allow external visitors with guest tokens to view the office lobby
              </Typography>
            </div>
            <Toggle
              size="sm"
              checked={configEnableGuestAccess}
              onChange={(e) => dispatch(setConfigEnableGuestAccessAction(e.target.checked))}
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}
