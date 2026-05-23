"use client";

import React, { useState, useRef, useEffect } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createCard } from "@/actions/cardActions";
import { useBoardStore } from "@/store/useBoardStore";
import { toast } from "sonner";

interface AddCardFormProps {
  listId: string;
  boardId: string;
  nextPosition: number;
}

export default function AddCardForm({ listId, boardId, nextPosition }: AddCardFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { setBoard, board } = useBoardStore();

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!title.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await createCard({ title: title.trim(), listId, position: nextPosition });
      setTitle("");
      setIsOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to add card");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === "Escape") {
      setIsOpen(false);
      setTitle("");
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 w-full px-2 py-1.5 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors group"
      >
        <Plus size={14} className="flex-shrink-0" />
        <span>Add a card</span>
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <textarea
        ref={textareaRef}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Enter a title for this card…"
        rows={2}
        className="w-full px-3 py-2 text-sm bg-white dark:bg-zinc-800 border border-border rounded-lg shadow-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/40 placeholder:text-muted-foreground"
        disabled={isSubmitting}
      />
      <div className="flex items-center gap-1.5">
        <Button
          type="submit"
          size="sm"
          disabled={!title.trim() || isSubmitting}
          className="h-7 px-3 text-xs bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isSubmitting ? "Adding…" : "Add card"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
          onClick={() => {
            setIsOpen(false);
            setTitle("");
          }}
        >
          <X size={14} />
        </Button>
      </div>
    </form>
  );
}
