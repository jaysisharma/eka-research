"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Upload, X, Link2 } from "lucide-react";
import styles from "./ImageUpload.module.css";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  placeholder?: string;
}

export default function ImageUpload({
  value,
  onChange,
  label = "Upload Image",
  placeholder = "https://images.unsplash.com/photo-..."
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState("");
  const [manualUrl, setManualUrl] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadErr("");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      
      const contentType = res.headers.get("content-type");
      if (!res.ok && (!contentType || !contentType.includes("application/json"))) {
        setUploadErr(res.status === 413 ? "File too large. Please compress the image." : `Server error (${res.status}).`);
        setUploading(false);
        return;
      }
      
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok) {
        setUploadErr(data.error ?? "Upload failed.");
        return;
      }
      onChange(data.url ?? "");
    } catch (err) {
      console.error(err);
      setUploadErr("Network error during upload.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={styles.uploadContainer}>
      {value ? (
        <div className={styles.imagePreviewWrap}>
          <div className={styles.previewContainer}>
            <Image
              src={value}
              alt="Preview"
              fill
              className={styles.previewImg}
              unoptimized
            />
          </div>
          <div className={styles.previewActions}>
            <p className={styles.imagePath} title={value}>
              {value.startsWith("http") ? value : value.split("/").pop()}
            </p>
            <button
              type="button"
              className={styles.removeImgBtn}
              onClick={() => {
                onChange("");
                setUploadErr("");
              }}
            >
              <X size={12} /> Remove Image
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.uploadPlaceholder}>
          {!manualUrl ? (
            <div className={styles.uploadTriggerWrap}>
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className={styles.fileHidden}
                onChange={handleFile}
              />
              <button
                type="button"
                className={styles.uploadBtn}
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
              >
                <Upload size={14} />
                {uploading ? "Uploading…" : label}
              </button>
              <span className={styles.uploadDivider}>or</span>
              <button
                type="button"
                className={styles.textLinkBtn}
                onClick={() => setManualUrl(true)}
              >
                <Link2 size={12} /> Paste image URL
              </button>
            </div>
          ) : (
            <div className={styles.manualInputWrap}>
              <input
                className={styles.input}
                placeholder={placeholder}
                value={value || ""}
                onChange={(e) => onChange(e.target.value)}
              />
              <button
                type="button"
                className={styles.textLinkBtn}
                onClick={() => setManualUrl(false)}
              >
                Upload File Instead
              </button>
            </div>
          )}
          {uploadErr && <p className={styles.uploadErr}>{uploadErr}</p>}
        </div>
      )}
    </div>
  );
}
