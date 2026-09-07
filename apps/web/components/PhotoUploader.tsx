"use client";

import { useRef, useState } from "react";
import { useUploadFile } from "@convex-dev/r2/react";
import { api } from "@repo/backend";
import { useToast } from "./ui/ToastProvider";

type PhotoUploaderProps = {
  /** R2 object keys already selected. */
  value: string[];
  onChange: (keys: string[]) => void;
  max?: number;
};

const MAX_BYTES = 8 * 1024 * 1024; // 8MB

/**
 * Image picker that uploads to R2 and reports the object KEYS. Shows an instant
 * local preview per file, a per-file busy state, remove buttons, and validates
 * type/size/count with toasts. Never fails silently.
 */
export function PhotoUploader({ value, onChange, max = 4 }: PhotoUploaderProps) {
  const uploadFile = useUploadFile(api.r2);
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  // key -> local object URL for files uploaded this session (for previews).
  const [previews, setPreviews] = useState<Record<string, string>>({});

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const remaining = max - value.length;
    if (remaining <= 0) {
      toast({ title: `الحد الأقصى ${max} صور`, variant: "error" });
      return;
    }

    const selected = Array.from(files).slice(0, remaining);
    setBusy(true);
    try {
      for (const file of selected) {
        if (!file.type.startsWith("image/")) {
          toast({ title: "الملفات المسموحة صور فقط", variant: "error" });
          continue;
        }
        if (file.size > MAX_BYTES) {
          toast({ title: "حجم الصورة يتجاوز ٨ ميغابايت", variant: "error" });
          continue;
        }
        try {
          const key = await uploadFile(file);
          setPreviews((prev) => ({
            ...prev,
            [key]: URL.createObjectURL(file),
          }));
          onChange([...value, key]);
        } catch {
          toast({ title: "تعذّر رفع الصورة", variant: "error" });
        }
      }
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function remove(key: string) {
    const url = previews[key];
    if (url) URL.revokeObjectURL(url);
    onChange(value.filter((k) => k !== key));
  }

  const canAdd = value.length < max;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {value.map((key) => (
          <div
            key={key}
            className="relative h-20 w-20 overflow-hidden rounded-card bg-surface-muted ring-1 ring-ink/10"
          >
            {previews[key] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previews[key]}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-2xl text-ink-muted">
                🖼️
              </div>
            )}
            <button
              type="button"
              onClick={() => remove(key)}
              aria-label="إزالة الصورة"
              className="absolute top-1 end-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-sm leading-none text-white"
            >
              ✕
            </button>
          </div>
        ))}

        {canAdd && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-card border-2 border-dashed border-ink/20 text-ink-muted transition hover:border-brand-400 hover:text-brand-500 disabled:opacity-50"
          >
            {busy ? (
              <span className="text-sm">جارٍ…</span>
            ) : (
              <>
                <span className="text-xl leading-none">＋</span>
                <span className="text-xs">صورة</span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(event) => handleFiles(event.target.files)}
      />
      <p className="text-xs text-ink-muted">
        حتى {max} صور، بحجم أقصى ٨ ميغابايت لكل صورة
      </p>
    </div>
  );
}
