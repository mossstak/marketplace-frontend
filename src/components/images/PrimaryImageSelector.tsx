import { type ExistingSellerImage, type PrimaryImageChoice } from '@/types/images'

type PrimaryImageSelectorProps = {
  uploadedImages: ExistingSellerImage[]
  selectedUploadedImageIds: number[]
  imageFiles: File[]
  primaryImageChoice: PrimaryImageChoice
  onChange: (choice: PrimaryImageChoice) => void
}

export function PrimaryImageSelector({
  uploadedImages,
  selectedUploadedImageIds,
  imageFiles,
  primaryImageChoice,
  onChange,
}: PrimaryImageSelectorProps) {
  if (selectedUploadedImageIds.length === 0 && imageFiles.length === 0) {
    return null
  }

  return (
    <div className="space-y-2">
      <h4 className="font-semibold text-foreground text-sm">Primary Image</h4>
      <p className="text-xs text-muted-foreground">Choose which selected image should be shown first.</p>
      <div className="grid gap-2.5 md:grid-cols-2">
        {uploadedImages
          .filter((img) => selectedUploadedImageIds.includes(img.id))
          .map((img) => (
            <label
              key={`existing:${img.id}`}
              className={`flex items-center gap-2.5 rounded-xl border p-2.5 text-xs font-medium cursor-pointer transition ${
                primaryImageChoice === `existing:${img.id}`
                  ? 'border-amber-600 dark:border-amber-400 bg-amber-500/15 text-foreground ring-1 ring-amber-500/40 shadow-xs'
                  : 'border-border bg-card hover:bg-muted/60 text-foreground shadow-2xs'
              }`}
            >
              <input
                type="radio"
                name="primary-image"
                checked={primaryImageChoice === `existing:${img.id}`}
                onChange={() => onChange(`existing:${img.id}`)}
                className="accent-amber-600"
              />
              <span className="truncate">Saved image #{img.id}</span>
            </label>
          ))}

        {imageFiles.map((file, index) => (
          <label
            key={`new:${file.name}-${index}`}
            className={`flex items-center gap-2.5 rounded-xl border p-2.5 text-xs font-medium cursor-pointer transition ${
              primaryImageChoice === `new:${index}`
                ? 'border-amber-600 dark:border-amber-400 bg-amber-500/15 text-foreground ring-1 ring-amber-500/40 shadow-xs'
                : 'border-border bg-card hover:bg-muted/60 text-foreground shadow-2xs'
            }`}
          >
            <input
              type="radio"
              name="primary-image"
              checked={primaryImageChoice === `new:${index}`}
              onChange={() => onChange(`new:${index}`)}
              className="accent-amber-600"
            />
            <span className="truncate">New: {file.name}</span>
          </label>
        ))}
      </div>
    </div>
  )
}
