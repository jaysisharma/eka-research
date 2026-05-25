"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Upload, X, ImagePlus } from "lucide-react";
import styles from "./MultiImageUpload.module.css";

interface MultiImageUploadProps {
  values: string[];
  onChange: (urls: string[]) => void;
}

export default function MultiImageUpload({ values, onChange }: MultiImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState("");

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setUploadErr("");
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of files) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        const contentType = res.headers.get("content-type");
        if (!res.ok && (!contentType || !contentType.includes("application/json"))) {
          setUploadErr(res.status === 413 ? "File too large." : `Server error (${res.status}).`);
          break;
        }
        const data = (await res.json()) as { url?: string; error?: string };
        if (!res.ok) { setUploadErr(data.error ?? "Upload failed."); break; }
        if (data.url) uploaded.push(data.url);
      }
      if (uploaded.length > 0) onChange([...values, ...uploaded]);
    } catch {
      setUploadErr("Network error during upload.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const remove = (url: string) => onChange(values.filter((u) => u !== url));

  return (
    <div className={styles.root}>
      {values.length > 0 && (
        <div className={styles.grid}>
          {values.map((url) => (
            <div key={url} className={styles.thumb}>
              <Image src={url} alt="" fill className={styles.thumbImg} unoptimized />
              <button
                type="button"
                className={styles.removeBtn}
                onClick={() => remove(url)}
                title="Remove image"
              >
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className={styles.hidden}
        onChange={handleFiles}
      />

      <button
        type="button"
        className={styles.addBtn}
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? (
          <><Upload size={13} className={styles.spin} /> Uploading…</>
        ) : (
          <><ImagePlus size={13} /> Add Images</>
        )}
      </button>

      {uploadErr && <p className={styles.err}>{uploadErr}</p>}
    </div>
  );
}
