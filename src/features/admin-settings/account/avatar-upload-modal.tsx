"use client";

import React from "react";
import { Button, FileUpload, Modal } from "@galyan/ui";
import { Upload } from "lucide-react";

export interface UploadedFileItem {
  id?: string;
  name: string;
  size?: number;
  type?: string;
  status?: "uploading" | "completed" | "error";
  progress?: number;
  url?: string;
}

export interface AvatarUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  uploadedFiles: UploadedFileItem[];
  isUploading: boolean;
  onFilesSelected: (files: File[]) => void;
  onRemoveFile: () => void;
}

export const AvatarUploadModal = ({
  isOpen,
  onClose,
  uploadedFiles,
  isUploading,
  onFilesSelected,
  onRemoveFile,
}: AvatarUploadModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      icon={<Upload className="size-4" />}
      title="Upload avatar"
      subtitle="Select a profile photo (Max 5MB)"
      footer={
        <div className="flex justify-end gap-2 w-full">
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={isUploading}
          >
            Cancel
          </Button>
        </div>
      }
    >
      <div className="space-y-3 py-1">
        <FileUpload
          variant="glassmorphic"
          accept="image/png,image/jpeg,image/webp,image/gif"
          maxSize={5 * 1024 * 1024}
          multiple={false}
          simulateUpload={false}
          disabled={isUploading}
          label={isUploading ? "Uploading..." : "Click or drag image to upload"}
          helperText="PNG, JPG, WebP or GIF (Max 5MB)"
          uploadedFiles={uploadedFiles}
          onFilesSelected={onFilesSelected}
          onRemoveFile={onRemoveFile}
        />
      </div>
    </Modal>
  );
};
