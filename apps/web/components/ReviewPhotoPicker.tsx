"use client";

import { useEffect, useMemo, useRef } from "react";
import { useToast } from "./ui/ToastProvider";

const MAX_BYTES = 8 * 1024 * 1024; // 8MB

type ExistingPhoto = { key: string; url: string };

type ReviewPhotoPickerProps = {
  /** Already-saved photos kept for this review. */
  existing: ExistingPhoto[];
  /** Newly picked files (not uploaded yet). */
  files: File[];
  max?: number;
  onRemoveExisting: (key: string) => void;
  onAddFiles: (files: File[]) => void;
  onRemoveFile: (index: number) => void;
};

/**
 * Photo picker that holds files LOCALLY (no upload until the review is saved).
 * Supports multiple images and, on phones, taking a photo or choosing from the
 * gallery/disk. Validates type/size/count with toasts.
 */
export function ReviewPhotoPicker({
  existing,
  files,
  max = 6,
  onRemoveExisting,
  onAddFiles,
  onRemoveFile,
}: ReviewPhotoPickerProps) {
  const { toast } = useToast();
  const galleryRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const fileUrls = useMemo(
    () => files.map((file) => URL.createObjectURL(file)),
    [files],
  );
  useEffect(
    () => () => fileUrls.forEach((url) => URL.revokeObjectURL(url)),
    [fileUrls],
  );

  const total = existing.length + files.length;
  const canAdd = total < max;

  function handlePicked(list: FileList | null) {
    if (!list || list.length === 0) return;
    const remaining = max - total;
    if (remaining <= 0) {
      toast({ title: `الحد الأقصى ${max} صور`, variant: "error" });
      return;
    }
    const valid: File[] = [];
    for (const file of Array.from(list)) {
      if (!file.type.startsWith("image/")) {
        toast({ title: "الملفات المسموحة صور فقط", variant: "error" });
        continue;
      }
      if (file.size > MAX_BYTES) {
        toast({ title: "حجم الصورة يتجاوز ٨ ميغابايت", variant: "error" });
        continue;
      }
      valid.push(file);
    }
    if (valid.length > remaining) {
      toast({ title: `يمكن إضافة ${remaining} صور فقط`, variant: "error" });
    }
    if (valid.length) onAddFiles(valid.slice(0, remaining));
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {existing.map((photo) => (
          <Thumb
            key={photo.key}
            src={photo.url}
            onRemove={() => onRemoveExisting(photo.key)}
          />
        ))}
        {files.map((file, i) => (
          <Thumb
            key={`${file.name}-${i}`}
            src={fileUrls[i]!}
            onRemove={() => onRemoveFile(i)}
          />
        ))}

        {canAdd && (
          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => galleryRef.current?.click()}
              className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-card border-2 border-dashed border-ink/20 text-ink-muted transition hover:border-brand-400 hover:text-brand-500"
            >
              <span className="text-xl leading-none">＋</span>
              <span className="text-xs">صور</span>
            </button>
            <button
              type="button"
              onClick={() => cameraRef.current?.click()}
              className="flex h-8 w-20 items-center justify-center gap-1 rounded-pill border border-ink/15 text-xs text-ink-muted transition hover:border-brand-400 hover:text-brand-500"
            >
              📷 كاميرا
            </button>
          </div>
        )}
      </div>

      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          handlePicked(e.target.files);
          e.target.value = "";
        }}
      />
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={(e) => {
          handlePicked(e.target.files);
          e.target.value = "";
        }}
      />
      <p className="text-xs text-ink-muted">
        حتى {max} صور، بحجم أقصى ٨ ميغابايت لكل صورة — تُرفع بعد نشر التقييم
      </p>
    </div>
  );
}

function Thumb({ src, onRemove }: { src: string; onRemove: () => void }) {
  return (
    <div className="relative h-20 w-20 overflow-hidden rounded-card bg-surface-muted ring-1 ring-ink/10">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className="h-full w-full object-cover" />
      <button
        type="button"
        onClick={onRemove}
        aria-label="إزالة الصورة"
        className="absolute top-1 end-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-sm leading-none text-white"
      >
        ✕
      </button>
    </div>
  );
}
