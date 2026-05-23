"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Calendar,
  CheckSquare,
  Paperclip,
  MessageSquare,
  AlignLeft,
  Users,
} from "lucide-react";
import { format, isPast, isToday, isTomorrow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Card } from "@/types";

interface CardItemProps {
  card: Card;
  isDraggingOver?: boolean;
  onOpen: (card: Card) => void;
}

export default function CardItem({
  card,
  isDraggingOver,
  onOpen,
}: CardItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: { type: "Card", card },
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  // Due date status
  const dueDate = card.dueDate ? new Date(card.dueDate) : null;
  const dueDateLabel = dueDate
    ? isToday(dueDate)
      ? "Today"
      : isTomorrow(dueDate)
        ? "Tomorrow"
        : format(dueDate, "MMM d")
    : null;

  const dueDateClass = dueDate
    ? card.dueComplete
      ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
      : isPast(dueDate)
        ? "bg-red-500/20 text-red-600 dark:text-red-400"
        : isToday(dueDate)
          ? "bg-orange-400/20 text-orange-600 dark:text-orange-400"
          : "bg-muted text-muted-foreground"
    : "";

  // Checklist progress
  const checklistTotal = card.checklist?.length ?? 0;
  const checklistDone =
    card.checklist?.filter((i) => i.isCompleted).length ?? 0;
  const checklistClass =
    checklistTotal > 0 && checklistDone === checklistTotal
      ? "text-emerald-600 dark:text-emerald-400"
      : "text-muted-foreground";

  // Cover
  const hasCover = card.coverColor || card.coverImage;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onOpen(card)}
      className={`group relative bg-card border border-border rounded-xl shadow-sm cursor-pointer hover:shadow-md hover:border-border/80 hover:-translate-y-px transition-all duration-150 select-none ${
        isDragging ? "ring-2 ring-blue-500/50 shadow-lg" : ""
      }`}
    >
      {/* Cover */}
      {hasCover && (
        <div
          className="h-10 w-full rounded-t-xl"
          style={{
            backgroundColor: card.coverColor ?? undefined,
            backgroundImage: card.coverImage
              ? `url(${card.coverImage})`
              : undefined,
            backgroundSize: card.coverImage ? "cover" : undefined,
            backgroundPosition: card.coverImage ? "center" : undefined,
          }}
        />
      )}

      <div className="px-3 py-2.5">
        {/* Labels */}
        {card.labels && card.labels.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-1.5">
            {card.labels.map((label) => (
              <span
                key={label.id}
                className="h-1.5 w-8 rounded-full"
                style={{ backgroundColor: label.color }}
                title={label.title ?? ""}
              />
            ))}
          </div>
        )}

        {/* Title */}
        <p className="text-sm font-medium text-foreground leading-snug wrap-break-word">
          {card.title}
        </p>

        {/* Badges Row */}
        <div className="flex flex-wrap items-center gap-1.5 mt-2">
          {/* Due Date */}
          {dueDateLabel && (
            <span
              className={`flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-md font-medium ${dueDateClass}`}
            >
              <Calendar size={11} />
              {card.dueComplete && "✓ "}
              {dueDateLabel}
            </span>
          )}

          {/* Description */}
          {card.description && (
            <span className="text-muted-foreground" title="Has description">
              <AlignLeft size={13} />
            </span>
          )}

          {/* Checklist */}
          {checklistTotal > 0 && (
            <span
              className={`flex items-center gap-1 text-xs ${checklistClass}`}
            >
              <CheckSquare size={12} />
              {checklistDone}/{checklistTotal}
            </span>
          )}

          {/* Comments */}
          {card.comments && card.comments.length > 0 && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <MessageSquare size={12} />
              {card.comments.length}
            </span>
          )}

          {/* Attachments */}
          {card.attachments && card.attachments.length > 0 && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Paperclip size={12} />
              {card.attachments.length}
            </span>
          )}
        </div>

        {/* Member Avatars */}
        {card.members && card.members.length > 0 && (
          <div className="flex items-center justify-end -space-x-1.5 mt-1.5">
            {card.members.slice(0, 4).map((m) => (
              <Avatar key={m.id} className="w-5 h-5 ring-1 ring-card">
                <AvatarImage src={m.avatarUrl} alt={m.name} />
                <AvatarFallback className="text-[8px] bg-blue-600 text-white font-bold">
                  {m.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ))}
            {card.members.length > 4 && (
              <span className="text-[10px] text-muted-foreground pl-2">
                +{card.members.length - 4}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
