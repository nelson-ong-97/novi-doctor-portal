'use client';

import { Button } from '@/components/ui/button';
import { ApiError } from '@/lib/api-client';
import { addNote } from '@/lib/api/notes';
import { usePatientNotes } from '@/lib/hooks/use-patient-notes';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';
import { toast } from 'sonner';

interface NotesPanelProps {
  patientId: number;
}

export function NotesPanel({ patientId }: NotesPanelProps) {
  const { data: notes, error, isLoading, mutate } = usePatientNotes(patientId);
  const [body, setBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed) return;
    setIsSubmitting(true);
    try {
      const newNote = await addNote(patientId, trimmed);
      // Optimistic prepend
      await mutate((prev) => [newNote, ...(prev ?? [])], { revalidate: false });
      setBody('');
      toast.success('Note added.');
    } catch {
      toast.error('Failed to add note.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-medium">Clinical Notes</h2>

      {/* Add note form */}
      <form onSubmit={handleAddNote} className="space-y-2">
        <textarea
          className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          rows={3}
          placeholder="Add a clinical note..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          disabled={isSubmitting}
        />
        <Button
          type="submit"
          size="sm"
          disabled={isSubmitting || !body.trim()}
        >
          {isSubmitting ? 'Saving...' : 'Add note'}
        </Button>
      </form>

      {/* Notes list */}
      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded bg-muted" />
          ))}
        </div>
      )}

      {error instanceof ApiError &&
        (error.status === 404 || error.status === 501) && (
          <p className="text-sm text-muted-foreground">
            Backend endpoint not yet available.
          </p>
        )}

      {!isLoading && !error && notes?.length === 0 && (
        <p className="text-sm text-muted-foreground">No notes yet.</p>
      )}

      {notes && notes.length > 0 && (
        <ul className="space-y-3">
          {notes.map((note) => (
            <li key={note.id} className="rounded-lg border bg-card p-3 text-sm">
              <p className="whitespace-pre-wrap">{note.body}</p>
              <p className="mt-1.5 text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(note.created_at), {
                  addSuffix: true,
                })}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
