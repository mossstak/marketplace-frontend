"use client"
import { useState, useEffect } from "react"
import Image from 'next/image';

type NewUploadPickerProps = {
  imageFiles: File[]
  imageError: string
  onFilesChange: (files: File[]) => void
}

export function NewUploadPicker({ imageFiles, imageError, onFilesChange }: NewUploadPickerProps) {
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    const objectUrls = imageFiles.map((file) => URL.createObjectURL(file));
    setPreviews(objectUrls);

    return () => {
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imageFiles]);

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files){
      onFilesChange(Array.from(e.target.files));
    }
  };

  return (
    <div className="space-y-2">
      <h4 className="font-semibold text-foreground text-sm">Upload New Images</h4>
      <div className="flex flex-wrap items-center gap-3">
        <label className="inline-flex cursor-pointer items-center rounded-lg border border-border bg-muted hover:bg-muted/80 text-foreground px-3.5 py-2 text-xs font-semibold shadow-xs transition">
          Browse images
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => onFilesChange(Array.from(e.target.files ?? []))}
          />
        </label>
        <span className="text-xs text-muted-foreground">
          {imageFiles.length > 0
            ? `${imageFiles.length} file${imageFiles.length > 1 ? 's' : ''} selected`
            : 'No files selected'}
        </span>
      </div>

      {imageFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Selected new files:</p>
          <div className="grid gap-2 md:grid-cols-2">
            {imageFiles.map((file, index) => (
              <label
                key={`${file.name}-${index}`}
                className="flex items-center gap-2.5 rounded-lg border border-border bg-card p-2 text-xs text-foreground shadow-2xs"
              >
                {previews[index] && (
                  <Image
                    src={previews[index]}
                    alt={file.name}
                    className="h-10 w-10 rounded-md object-cover border border-border shrink-0"
                    width={40}
                    height={40}
                  />
                )}
                <span className="truncate font-medium">{file.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {imageError && <div className="text-sm font-medium text-red-700 dark:text-red-400">{imageError}</div>}
    </div>
  )
}
