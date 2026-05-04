type NewUploadPickerProps = {
  imageFiles: File[]
  imageError: string
  onFilesChange: (files: File[]) => void
}

export function NewUploadPicker({ imageFiles, imageError, onFilesChange }: NewUploadPickerProps) {
  return (
    <div className="space-y-2">
      <h4 className="font-semibold">Upload New Images</h4>
      <div className="flex flex-wrap items-center gap-3">
        <label className="inline-flex cursor-pointer items-center rounded bg-white/20 px-3 py-2 text-sm">
          Browse images
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => onFilesChange(Array.from(e.target.files ?? []))}
          />
        </label>
        <span className="text-xs text-white/70">
          {imageFiles.length > 0
            ? `${imageFiles.length} file${imageFiles.length > 1 ? 's' : ''} selected`
            : 'No files selected'}
        </span>
      </div>

      {imageFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-white/70">Selected new files:</p>
          <div className="grid gap-2 md:grid-cols-2">
            {imageFiles.map((file, index) => (
              <label
                key={`${file.name}-${index}`}
                className="flex items-center gap-2 rounded bg-white/5 p-2 text-xs"
              >
                <span className="truncate">{file.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {imageError && <div className="text-sm text-red-300">{imageError}</div>}
    </div>
  )
}
