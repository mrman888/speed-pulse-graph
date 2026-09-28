import { useCallback, useEffect, useState } from "react";
import {
  loadSessions,
  saveSessions,
  score,
  type ScoredSession,
  type Session,
} from "@/lib/sessions";

export function useSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSessions(loadSessions());
    setReady(true);
  }, []);

  const addSession = useCallback((session: Session) => {
    setSessions((prev) => {
      const next = [...prev, session];
      saveSessions(next);
      return next;
    });
  }, []);

  const scored: ScoredSession[] = sessions.map(score);

  return { sessions, scored, ready, addSession };
}

export type Draft = {
  activity: string;
  hr: number;
  reaction: number;
  startedAt: string;
};

const DRAFT_KEY = "pulsepop.draft.v1";

export function loadDraft(): Draft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as Draft) : null;
  } catch {
    return null;
  }
}

export function saveDraft(draft: Draft) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

export function clearDraft() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(DRAFT_KEY);
}

export function useDraft() {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setDraft(loadDraft());
    setReady(true);
  }, []);

  return { draft, ready, setDraft };
}
