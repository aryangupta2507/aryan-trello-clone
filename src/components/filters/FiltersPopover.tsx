"use client";

import React from "react";
import {
  Filter,
  X,
  Check,
  Calendar as CalendarIcon,
  Tag,
  Search,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import type { Board } from "@/types";

interface FiltersPopoverProps {
  board: Board;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  selectedLabels: string[];
  setSelectedLabels: React.Dispatch<React.SetStateAction<string[]>>;
  selectedDueDates: string[];
  setSelectedDueDates: React.Dispatch<React.SetStateAction<string[]>>;
  selectedMembers: string[];
  setSelectedMembers: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function FiltersPopover({
  board,
  searchQuery,
  setSearchQuery,
  selectedLabels,
  setSelectedLabels,
  selectedDueDates,
  setSelectedDueDates,
  selectedMembers,
  setSelectedMembers,
}: FiltersPopoverProps) {
  const activeFiltersCount =
    (searchQuery.trim() ? 1 : 0) +
    selectedLabels.length +
    selectedDueDates.length +
    selectedMembers.length;

  const dueDates = [
    { id: "overdue", label: "Overdue" },
    { id: "due-tomorrow", label: "Due in the next 24 hours" },
    { id: "due-next-week", label: "Due in the next 7 days" },
    { id: "complete", label: "Marked as complete" },
    { id: "incomplete", label: "Not marked as complete" },
  ];

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedLabels([]);
    setSelectedDueDates([]);
    setSelectedMembers([]);
  };

  const toggleLabel = (id: string) => {
    setSelectedLabels((prev) =>
      prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id],
    );
  };

  const toggleDueDate = (id: string) => {
    setSelectedDueDates((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id],
    );
  };
  const toggleMember = (id: string) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id],
    );
  };

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className={`h-9 gap-1.5 rounded-lg border-white/20 text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-200 cursor-pointer ${
              activeFiltersCount > 0 ? "ring-2 ring-white/50 bg-white/25" : ""
            }`}
          />
        }
      >
        <Filter size={14} />
        <span>Filters</span>
        {activeFiltersCount > 0 && (
          <span className="flex items-center justify-center bg-white text-blue-600 font-bold text-[10px] w-4.5 h-4.5 rounded-full ml-1">
            {activeFiltersCount}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="end">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-border">
          <span className="font-semibold text-sm">Filters</span>
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-7 text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-500/5 px-2 py-0.5 rounded gap-1 cursor-pointer"
            >
              <X size={12} />
              Clear all
            </Button>
          )}
        </div>

        <div className="flex flex-col gap-4 overflow-y-auto max-h-87.5 pr-1 custom-scrollbar">
          {/* Keyword Search */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              <Search size={12} />
              <span>Keyword</span>
            </div>
            <Input
              placeholder="Search cards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 text-sm"
            />
          </div>

          <Separator />

          {/* Labels Filter */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              <Tag size={12} />
              <span>Labels</span>
            </div>
            <div className="flex flex-col gap-1">
              {board.labels?.map((label) => {
                const isSelected = selectedLabels.includes(label.id);
                return (
                  <button
                    key={label.id}
                    onClick={() => toggleLabel(label.id)}
                    className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-accent text-sm text-left transition-colors cursor-pointer w-full"
                  >
                    <div className="flex items-center justify-center w-4 h-4 border border-muted-foreground/35 rounded-sm bg-background">
                      {isSelected && (
                        <Check
                          size={12}
                          className="text-primary stroke-[3px]"
                        />
                      )}
                    </div>
                    <div
                      className="flex-1 h-6 rounded-md px-2.5 flex items-center text-xs font-bold text-white shadow-sm"
                      style={{ backgroundColor: label.color }}
                    >
                      {label.title || <span className="opacity-0">Label</span>}
                    </div>
                  </button>
                );
              })}
              {(!board.labels || board.labels.length === 0) && (
                <div className="text-xs text-muted-foreground py-1">
                  No labels available.
                </div>
              )}
            </div>
          </div>
          <Separator />

          {/* Members Filter */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              <Users size={12} />
              <span>Members</span>
            </div>

            <div className="flex flex-col gap-1">
              {board.members?.map((member) => {
                const isSelected = selectedMembers.includes(member.id);

                return (
                  <button
                    key={member.id}
                    onClick={() => toggleMember(member.id)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent text-sm text-left transition-colors cursor-pointer w-full"
                  >
                    <div className="flex items-center justify-center w-4 h-4 border border-muted-foreground/35 rounded-sm bg-background">
                      {isSelected && (
                        <Check
                          size={12}
                          className="text-primary stroke-[3px]"
                        />
                      )}
                    </div>

                    <span className="font-medium">{member.name}</span>
                  </button>
                );
              })}

              {(!board.members || board.members.length === 0) && (
                <div className="text-xs text-muted-foreground py-1">
                  No members available.
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Due Date Filter */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              <CalendarIcon size={12} />
              <span>Due Date</span>
            </div>
            <div className="flex flex-col gap-1">
              {dueDates.map((date) => {
                const isSelected = selectedDueDates.includes(date.id);
                return (
                  <button
                    key={date.id}
                    onClick={() => toggleDueDate(date.id)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent text-sm text-left transition-colors cursor-pointer w-full"
                  >
                    <div className="flex items-center justify-center w-4 h-4 border border-muted-foreground/35 rounded-sm bg-background">
                      {isSelected && (
                        <Check
                          size={12}
                          className="text-primary stroke-[3px]"
                        />
                      )}
                    </div>
                    <span className="font-medium">{date.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
