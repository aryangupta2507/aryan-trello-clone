"use client";

import React, { useState, useRef } from "react";
import { useSortable, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useDroppable } from "@dnd-kit/core";
import { MoreHorizontal, Pencil, Trash2, X, Check, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { updateList, deleteList } from "@/actions/listActions";
import CardItem from "@/components/board/CardItem";
import AddCardForm from "@/components/board/AddCardForm";
import { toast } from "sonner";
import type { List, Card } from "@/types";
import { getNewPosition } from "@/utils/position";

interface ListColumnProps {
  list: List;
  boardId: string;
  filteredCardIds: Set<string>;
  onCardOpen: (card: Card) => void;
}

export default function ListColumn({ list, boardId, filteredCardIds, onCardOpen }: ListColumnProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(list.title);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: list.id,
    data: { type: "List", list },
  });

  const { setNodeRef: setDroppableRef } = useDroppable({
    id: `list-droppable-${list.id}`,
    data: { type: "List", listId: list.id },
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const visibleCards = list.cards.filter((c) => !c.isArchived && filteredCardIds.has(c.id));
  const nextCardPosition = getNewPosition(
    visibleCards.length > 0 ? visibleCards[visibleCards.length - 1].position : undefined,
    undefined
  );

  const handleRenameSubmit = async () => {
    if (!editTitle.trim() || editTitle.trim() === list.title) {
      setIsEditing(false);
      setEditTitle(list.title);
      return;
    }
    setIsSaving(true);
    try {
      await updateList(list.id, { title: editTitle.trim() });
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to rename list");
      setEditTitle(list.title);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete list "${list.title}" and all its cards?`)) return;
    try {
      await deleteList(list.id);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete list");
    }
  };

  return (
    <div
      ref={setSortableRef}
      style={style}
      className={`shrink-0 w-72 flex flex-col rounded-xl bg-black/20 backdrop-blur-sm border border-white/10 shadow-xl max-h-[calc(100vh-10rem)] ${
        isDragging ? "ring-2 ring-blue-400/50" : ""
      }`}
    >
      {/* List Header */}
      <div
        className="flex items-center gap-1 px-3 pt-3 pb-2 group/header"
      >
        <div
          {...attributes}
          {...listeners}
          className="shrink-0 text-white/30 hover:text-white/70 cursor-grab active:cursor-grabbing p-0.5 rounded -ml-1 transition-colors"
        >
          <GripVertical size={14} />
        </div>

        {isEditing ? (
          <form
            className="flex-1 flex gap-1"
            onSubmit={(e) => { e.preventDefault(); handleRenameSubmit(); }}
          >
            <input
              ref={inputRef}
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") { setIsEditing(false); setEditTitle(list.title); }
              }}
              autoFocus
              className="flex-1 min-w-0 px-2 py-0.5 text-sm font-semibold text-white bg-white/10 border border-white/20 rounded focus:outline-none focus:ring-1 focus:ring-white/50"
              disabled={isSaving}
            />
            <button type="submit" className="text-green-400 hover:text-green-300 p-0.5">
              <Check size={13} />
            </button>
            <button type="button" onClick={() => { setIsEditing(false); setEditTitle(list.title); }} className="text-red-400 hover:text-red-300 p-0.5">
              <X size={13} />
            </button>
          </form>
        ) : (
          <button
            onDoubleClick={() => setIsEditing(true)}
            className="flex-1 text-left text-sm font-semibold text-white truncate cursor-default"
          >
            {list.title}
          </button>
        )}

        <span className="text-xs text-white/40 tabular-nums select-none">
          {visibleCards.length}
        </span>

        <DropdownMenu>
          <DropdownMenuTrigger render={
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
            />
          }>
            <MoreHorizontal size={16} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem
              className="gap-2 cursor-pointer"
              onClick={() => { setIsEditing(true); setTimeout(() => inputRef.current?.focus(), 50); }}
            >
              <Pencil size={13} />
              Rename list
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 cursor-pointer text-destructive focus:text-destructive"
              onClick={handleDelete}
            >
              <Trash2 size={13} />
              Delete list
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Cards Area */}
      <div
        ref={setDroppableRef}
        className="flex-1 overflow-y-auto px-2 pb-1 flex flex-col gap-2 min-h-8 custom-scrollbar"
      >
        <SortableContext
          items={visibleCards.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {visibleCards.map((card) => (
            <CardItem
              key={card.id}
              card={card}
              onOpen={onCardOpen}
            />
          ))}
        </SortableContext>

        {visibleCards.length === 0 && (
          <div className="flex items-center justify-center h-10 rounded-lg border border-dashed border-white/10 text-white/30 text-xs">
            Drop cards here
          </div>
        )}
      </div>

      {/* Add Card */}
      <div className="px-2 py-2 border-t border-white/5">
        <AddCardForm listId={list.id} boardId={boardId} nextPosition={nextCardPosition} />
      </div>
    </div>
  );
}
