"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  AlignLeft,
  Calendar as CalendarIcon,
  CheckSquare,
  CreditCard,
  Layout,
  MessageSquare,
  Tag,
  Trash2,
  Users,
  X,
  Plus,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
  updateCard,
  deleteCard,
  addChecklistItem,
  updateChecklistItem,
  deleteChecklistItem,
  addComment,
  toggleCardLabel,
  toggleCardMember,
} from "@/actions/cardActions";
import type { Card, List, Board } from "@/types";
import { cn } from "@/lib/utils";

interface CardModalProps {
  card: Card | null;
  list: List | null;
  board: Board | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function CardModal({
  card,
  list,
  board,
  isOpen,
  onClose,
}: CardModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [newChecklistTitle, setNewChecklistTitle] = useState("");
  const coverColors = [
    "#ef4444",
    "#f97316",
    "#eab308",
    "#22c55e",
    "#3b82f6",
    "#8b5cf6",
    "#ec4899",
    "#64748b",
  ];

  useEffect(() => {
    if (card) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTitle(card.title);
      setDescription(card.description || "");
    }
  }, [card]);

  if (!card || !list || !board) return null;

  const handleUpdateTitle = async () => {
    if (!title.trim() || title === card.title) return;
    try {
      await updateCard(card.id, { title: title.trim() });
    } catch (error: any) {
      toast.error("Failed to update title");
      setTitle(card.title);
    }
  };

  const handleUpdateDescription = async () => {
    try {
      await updateCard(card.id, { description: description.trim() });
      setIsEditingDesc(false);
    } catch (error: any) {
      toast.error("Failed to update description");
    }
  };

  const handleDeleteCard = async () => {
    if (!confirm("Are you sure you want to delete this card?")) return;
    try {
      await deleteCard(card.id);
      onClose();
      toast.success("Card deleted");
    } catch (error: any) {
      toast.error("Failed to delete card");
    }
  };

  const handleArchiveCard = async () => {
    try {
      await updateCard(card.id, { isArchived: true });
      onClose();
      toast.success("Card archived");
    } catch (error: any) {
      toast.error("Failed to archive card");
    }
  };

  const handleAddChecklist = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!newChecklistTitle.trim()) return;
    try {
      await addChecklistItem(card.id, newChecklistTitle.trim());
      setNewChecklistTitle("");
    } catch (error: any) {
      toast.error("Failed to add checklist item");
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    try {
      await addComment(card.id, commentText.trim());
      setCommentText("");
    } catch (error: any) {
      toast.error("Failed to add comment");
    }
  };

  const handleDueDateChange = async (date: Date | undefined) => {
    try {
      await updateCard(card.id, { dueDate: date ? date.toISOString() : null });
    } catch (error: any) {
      toast.error("Failed to update due date");
    }
  };

  const toggleDueComplete = async () => {
    try {
      await updateCard(card.id, { dueComplete: !card.dueComplete });
    } catch (error: any) {
      toast.error("Failed to update due date status");
    }
  };

  const checklistTotal = card.checklist?.length || 0;
  const checklistDone =
    card.checklist?.filter((i) => i.isCompleted).length || 0;
  const checklistPercent =
    checklistTotal === 0
      ? 0
      : Math.round((checklistDone / checklistTotal) * 100);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden bg-background gap-0 shadow-2xl">
        <DialogTitle className="sr-only">Card Details</DialogTitle>
        <DialogDescription className="sr-only">
          Detailed view of the card {card.title}
        </DialogDescription>

        {/* Cover */}
        {(card.coverColor || card.coverImage) && (
          <div
            className="h-32 w-full relative"
            style={{
              backgroundColor: card.coverColor ?? undefined,
              backgroundImage: card.coverImage
                ? `url(${card.coverImage})`
                : undefined,
              backgroundSize: card.coverImage ? "cover" : undefined,
              backgroundPosition: card.coverImage ? "center" : undefined,
            }}
          >
            <Button
              variant="secondary"
              size="sm"
              className="absolute bottom-2 right-2 bg-white/20 hover:bg-white/40 text-white border-0 backdrop-blur-sm"
              onClick={() =>
                updateCard(card.id, { coverColor: null, coverImage: null })
              }
            >
              <Layout size={14} className="mr-2" />
              Remove Cover
            </Button>
          </div>
        )}

        <div className="flex flex-col md:flex-row h-full max-h-[85vh] overflow-hidden">
          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {/* Header: Title & List info */}
            <div className="flex items-start gap-3 mb-8">
              <CreditCard
                className="mt-1 text-muted-foreground shrink-0"
                size={20}
              />
              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={handleUpdateTitle}
                  onKeyDown={(e) => e.key === "Enter" && handleUpdateTitle()}
                  className="w-full text-xl font-bold bg-transparent border-transparent hover:bg-muted/50 focus:bg-background focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded px-1 -ml-1 transition-colors"
                />
                <p className="text-sm text-muted-foreground mt-1 px-1">
                  in list{" "}
                  <span className="underline decoration-muted-foreground/30 underline-offset-2">
                    {list.title}
                  </span>
                </p>
              </div>
            </div>

            {/* Quick Info (Labels, Due Date) */}
            <div className="flex flex-wrap gap-6 mb-8 px-8">
              {card.labels?.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Labels
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {card.labels.map((label) => (
                      <span
                        key={label.id}
                        className="h-8 px-3 rounded-md text-sm font-medium flex items-center text-white shadow-sm"
                        style={{ backgroundColor: label.color }}
                      >
                        {label.title}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {card.dueDate && (
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Due Date
                  </h3>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={card.dueComplete}
                      onCheckedChange={toggleDueComplete}
                      className="h-5 w-5 rounded border-muted-foreground/50 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                    />
                    <Popover>
                      <PopoverTrigger
                        render={
                          <Button
                            variant="secondary"
                            className={cn(
                              "h-8 justify-start text-left font-medium",
                              card.dueComplete
                                ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
                                : "",
                            )}
                          />
                        }
                      >
                        {format(new Date(card.dueDate), "MMM d, yyyy")}
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={new Date(card.dueDate)}
                          onSelect={handleDueDateChange}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              )}
            </div>

            {/* Description Section */}
            <div className="flex items-start gap-3 mb-8">
              <AlignLeft
                className="mt-0.5 text-muted-foreground shrink-0"
                size={20}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-semibold">Description</h3>
                  {card.description && !isEditingDesc && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setIsEditingDesc(true)}
                      className="h-8"
                    >
                      Edit
                    </Button>
                  )}
                </div>

                {isEditingDesc || !card.description ? (
                  <div className="space-y-3">
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Add a more detailed description..."
                      className="min-h-25 resize-y bg-muted/30 focus-visible:bg-background"
                      autoFocus={isEditingDesc}
                    />
                    <div className="flex gap-2">
                      <Button onClick={handleUpdateDescription} size="sm">
                        Save
                      </Button>
                      {card.description && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setDescription(card.description);
                            setIsEditingDesc(false);
                          }}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div
                    className="bg-muted/30 hover:bg-muted/50 p-3 rounded-lg cursor-pointer text-sm whitespace-pre-wrap transition-colors"
                    onClick={() => setIsEditingDesc(true)}
                  >
                    {card.description}
                  </div>
                )}
              </div>
            </div>

            {/* Checklist Section */}
            <div className="flex items-start gap-3 mb-8">
              <CheckSquare
                className="mt-0.5 text-muted-foreground shrink-0"
                size={20}
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold mb-3">Checklist</h3>

                {/* Progress bar */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs font-medium text-muted-foreground w-8 text-right">
                    {checklistPercent}%
                  </span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full transition-all duration-300",
                        checklistPercent === 100
                          ? "bg-emerald-500"
                          : "bg-blue-500",
                      )}
                      style={{ width: `${checklistPercent}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2 mb-3">
                  {card.checklist.map((item) => (
                    <div key={item.id} className="flex items-start gap-3 group">
                      <Checkbox
                        checked={item.isCompleted}
                        onCheckedChange={(checked) =>
                          updateChecklistItem(item.id, {
                            isCompleted: checked === true,
                          })
                        }
                        className="mt-1"
                      />
                      <span
                        className={cn(
                          "text-sm flex-1",
                          item.isCompleted &&
                            "line-through text-muted-foreground",
                        )}
                      >
                        {item.title}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                        onClick={() => deleteChecklistItem(item.id)}
                      >
                        <X size={14} />
                      </Button>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleAddChecklist} className="flex gap-2">
                  <Input
                    id="checklist-input"
                    value={newChecklistTitle}
                    onChange={(e) => setNewChecklistTitle(e.target.value)}
                    placeholder="Add an item"
                    className="h-8 flex-1"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    variant="secondary"
                    disabled={!newChecklistTitle.trim()}
                  >
                    Add
                  </Button>
                </form>
              </div>
            </div>

            {/* Activity/Comments Section */}
            <div className="flex items-start gap-3">
              <MessageSquare
                className="mt-0.5 text-muted-foreground shrink-0"
                size={20}
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold mb-4">Activity</h3>

                <div className="flex items-start gap-3 mb-6">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-blue-600 text-white text-xs">
                      ME
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <Textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Write a comment..."
                      className="min-h-20 bg-background resize-none"
                    />
                    <Button
                      size="sm"
                      onClick={handleAddComment}
                      disabled={!commentText.trim()}
                    >
                      Save
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  {card.comments?.map((comment) => (
                    <div key={comment.id} className="flex items-start gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={comment.member.avatarUrl} />
                        <AvatarFallback>
                          {comment.member.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-baseline gap-2">
                          <span className="font-semibold text-sm">
                            {comment.member.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {format(
                              new Date(comment.createdAt),
                              "MMM d, yyyy 'at' h:mm a",
                            )}
                          </span>
                        </div>
                        <div className="mt-1 bg-muted/50 p-3 rounded-lg text-sm rounded-tl-none border border-border/50">
                          {comment.text}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar / Actions Area */}
          <div className="w-full md:w-48 bg-muted/20 md:border-l border-t md:border-t-0 border-border p-6 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Add to card
              </h4>
              <div className="flex flex-col gap-2">
                <Popover>
                  <PopoverTrigger
                    render={
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full justify-start gap-2"
                      />
                    }
                  >
                    <Layout size={14} /> Cover
                  </PopoverTrigger>

                  <PopoverContent align="start" className="w-64 p-3">
                    <h4 className="font-medium text-sm mb-3 text-center">
                      Cover
                    </h4>

                    <div className="grid grid-cols-4 gap-2">
                      {coverColors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          className="h-10 rounded-md border border-border hover:scale-105 transition-transform"
                          style={{ backgroundColor: color }}
                          onClick={() =>
                            updateCard(card.id, {
                              coverColor: color,
                              coverImage: null,
                            })
                          }
                        />
                      ))}
                    </div>

                    {(card.coverColor || card.coverImage) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full mt-3 text-destructive"
                        onClick={() =>
                          updateCard(card.id, {
                            coverColor: null,
                            coverImage: null,
                          })
                        }
                      >
                        Remove Cover
                      </Button>
                    )}
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger
                    render={
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full justify-start gap-2"
                      />
                    }
                  >
                    <Tag size={14} /> Labels
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-64 p-3">
                    <h4 className="font-medium text-sm mb-3 text-center">
                      Labels
                    </h4>
                    <div className="space-y-2">
                      {board.labels.map((label) => {
                        const isSelected = card.labels.some(
                          (l) => l.id === label.id,
                        );
                        return (
                          <div
                            key={label.id}
                            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => toggleCardLabel(card.id, label.id)}
                          >
                            <Checkbox
                              checked={isSelected}
                              className="pointer-events-none"
                            />
                            <div
                              className="flex-1 h-8 rounded px-3 flex items-center text-sm font-medium text-white shadow-sm"
                              style={{ backgroundColor: label.color }}
                            >
                              {label.title}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </PopoverContent>
                </Popover>

                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full justify-start gap-2"
                  onClick={() => {
                    const el = document.getElementById(
                      "checklist-input",
                    ) as HTMLInputElement | null;

                    el?.scrollIntoView({
                      behavior: "smooth",
                      block: "center",
                    });

                    setTimeout(() => el?.focus(), 300);
                  }}
                >
                  <CheckSquare size={14} /> Checklist
                </Button>
                <Popover>
                  <PopoverTrigger
                    render={
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full justify-start gap-2"
                      />
                    }
                  >
                    <Users size={14} /> Members
                  </PopoverTrigger>

                  <PopoverContent align="start" className="w-64 p-3">
                    <h4 className="font-medium text-sm mb-3 text-center">
                      Members
                    </h4>

                    <div className="space-y-2">
                      {board.members.map((member) => {
                        const isSelected = card.members.some(
                          (m) => m.id === member.id,
                        );

                        return (
                          <div
                            key={member.id}
                            className="flex items-center gap-3 cursor-pointer hover:bg-muted rounded-md px-2 py-2 transition-colors"
                            onClick={() => toggleCardMember(card.id, member.id)}
                          >
                            <Checkbox
                              checked={isSelected}
                              className="pointer-events-none"
                            />

                            <Avatar className="w-7 h-7">
                              <AvatarImage src={member.avatarUrl} />
                              <AvatarFallback>
                                {member.name.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>

                            <span className="text-sm font-medium">
                              {member.name}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger
                    render={
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full justify-start gap-2"
                      />
                    }
                  >
                    <CalendarIcon size={14} /> Dates
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={
                        card.dueDate ? new Date(card.dueDate) : undefined
                      }
                      onSelect={handleDueDateChange}
                    />
                    <div className="p-3 border-t">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-destructive"
                        onClick={() => handleDueDateChange(undefined)}
                      >
                        Remove Date
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Actions
              </h4>
              <div className="flex flex-col gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full justify-start gap-2"
                  onClick={handleArchiveCard}
                >
                  Archive Card
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full justify-start gap-2 hover:bg-destructive/10 hover:text-destructive"
                  onClick={handleDeleteCard}
                >
                  <Trash2 size={14} /> Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
