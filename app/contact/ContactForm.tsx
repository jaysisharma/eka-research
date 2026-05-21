"use client";

import { useState, useRef } from "react";
import { ArrowRight, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import styles from "./page.module.css";

const TOPICS = [
  { label: "Research collaboration", value: "research" },
  { label: "Media & press", value: "media" },
  { label: "School / institution", value: "school" },
  { label: "Membership", value: "membership" },
  { label: "Sponsorship", value: "sponsorship" },
  { label: "Other", value: "other" },
];

type Status = "idle" | "sending" | "success" | "error";

export default function ContactForm() {
  const [topic, setTopic] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!topic) {
      setErrorMsg("Please select a topic.");
      setStatus("error");
      return;
    }
    setStatus("sending");
    setErrorMsg("");

    const data = new FormData(e.currentTarget);
    const payload = {
      name:         data.get("name") as string,
      email:        data.get("email") as string,
      topic,
      organisation: data.get("organisation") as string,
      message:      data.get("message") as string,
    };

    try {
      const res = await fetch("/api/contact", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error((json as { error?: string }).error ?? "Request failed");
      }
      setStatus("success");
      formRef.current?.reset();
      setTopic("");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className={styles.formCard}>
        <div className={styles.successState}>
          <CheckCircle size={40} className={styles.successIcon} />
          <h3 className={styles.successTitle}>Message sent</h3>
          <p className={styles.successBody}>
            Thanks for reaching out. We read every message and typically reply
            within 2 business days.
          </p>
          <button
            className={styles.submitBtn}
            onClick={() => setStatus("idle")}
          >
            Send another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.formCard}>
      <form
        ref={formRef}
        className={styles.form}
        onSubmit={handleSubmit}
        noValidate
      >
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.label}>
              Full name <span className={styles.req}>*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className={styles.input}
              placeholder="Your name"
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              Email address <span className={styles.req}>*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className={styles.input}
              placeholder="you@example.com"
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <span className={styles.label}>
            Topic <span className={styles.req}>*</span>
          </span>
          <div className={styles.topicGrid}>
            {TOPICS.map((t) => (
              <label key={t.value} className={styles.topicWrap}>
                <input
                  type="radio"
                  name="topic"
                  value={t.value}
                  className={styles.topicRadio}
                  checked={topic === t.value}
                  onChange={() => setTopic(t.value)}
                />
                <span className={styles.topicPill}>{t.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="organisation" className={styles.label}>
            Organisation{" "}
            <span className={styles.optional}>(optional)</span>
          </label>
          <input
            id="organisation"
            name="organisation"
            type="text"
            className={styles.input}
            placeholder="University, school, company…"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="message" className={styles.label}>
            Message <span className={styles.req}>*</span>
          </label>
          <textarea
            id="message"
            name="message"
            required
            rows={6}
            className={styles.textarea}
            placeholder="Tell us what you're working on, what you need, or what you'd like to discuss…"
          />
        </div>

        {status === "error" && errorMsg && (
          <div className={styles.errorBanner}>
            <AlertCircle size={14} />
            {errorMsg}
          </div>
        )}

        <div className={styles.formFooter}>
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={status === "sending"}
          >
            {status === "sending" ? (
              <>
                <Loader2 size={15} className={styles.spinner} />
                Sending…
              </>
            ) : (
              <>
                Send message <ArrowRight size={15} />
              </>
            )}
          </button>
          <p className={styles.formNote}>
            Your message goes directly to our team — no third-party forms or
            data brokers.
          </p>
        </div>
      </form>
    </div>
  );
}
