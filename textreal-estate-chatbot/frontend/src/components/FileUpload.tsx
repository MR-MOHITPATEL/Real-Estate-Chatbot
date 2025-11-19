import { UploadCloud } from "lucide-react";
import { useCallback, useState } from "react";

import { cn } from "../lib/utils";

interface FileUploadProps {
  file?: File | null;
  onFileChange: (file: File | null) => void;
}

export const FileUpload = ({ file, onFileChange }: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files?.length) return;
      const excel = files[0];
      if (!excel.name.endsWith(".xlsx")) {
        alert("Please upload an Excel (.xlsx) dataset.");
        return;
      }
      onFileChange(excel);
    },
    [onFileChange]
  );

  const onDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
    handleFiles(event.dataTransfer.files);
  };

  return (
    <label
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={(event) => {
        event.preventDefault();
        setIsDragging(false);
      }}
      onDrop={onDrop}
      className={cn(
        "flex w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/20 px-4 py-5 text-center transition hover:border-primary/60",
        isDragging && "border-primary/60 bg-primary/5"
      )}
      tabIndex={0}
      role="button"
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          (event.currentTarget.querySelector("input[type='file']") as HTMLInputElement)?.click();
        }
      }}
    >
      <UploadCloud className="h-6 w-6 text-primary" />
      <div className="space-y-1 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">
          Drag & drop a custom Excel dataset
        </p>
        <p>.xlsx files only. We’ll fallback to the default dataset otherwise.</p>
      </div>
      <div className="rounded-full bg-white/10 px-3 py-1 text-xs text-muted-foreground">
        {file ? file.name : "No file selected"}
      </div>
      <input
        type="file"
        accept=".xlsx"
        className="hidden"
        onChange={(event) => handleFiles(event.target.files)}
      />
    </label>
  );
};


