"use client";

import React, { useState, useRef, useEffect } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createList } from "@/actions/listActions";
import { toast } from "sonner";

interface AddListFormProps {
  boardId: string;
  nextPosition: number;
}

export default function AddListForm({ boardId, nextPosition }: AddListFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!title.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await createList({ title: title.trim(), boardId, position: nextPosition });
      setTitle("");
      setIsOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to add list");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
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
      <div className="flex-shrink-0 w-72">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 w-full px-4 py-3 text-sm font-medium text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-150 border border-white/10"
        >
          <Plus size={16} />
          Add another list
        </button>
      </div>
    );
  }

  return (
    <div className="flex-shrink-0 w-72 bg-[hsl(var(--card))] rounded-xl shadow-xl p-2 border border-border">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <input
          ref={inputRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter list title…"
          className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 placeholder:text-muted-foreground"
          disabled={isSubmitting}
        />
        <div className="flex items-center gap-1.5">
          <Button
            type="submit"
            size="sm"
            disabled={!title.trim() || isSubmitting}
            className="h-7 px-3 text-xs bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSubmitting ? "Adding…" : "Add list"}
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
    </div>
  );
}
