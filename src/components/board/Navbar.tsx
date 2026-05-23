"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Kanban,
  Plus,
  Sun,
  Moon,
  Laptop,
  ChevronDown,
  Home,
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { createBoard } from "@/actions/boardActions";
import { BACKGROUND_PRESETS } from "@/utils/backgrounds";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface NavbarProps {
  boards: { id: string; title: string; background: string }[];
}

export default function Navbar({ boards }: NavbarProps) {
  const { theme, setTheme } = useTheme();
  const params = useParams();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [selectedBg, setSelectedBg] = useState(BACKGROUND_PRESETS[0].id);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeBoardId = params?.id as string | undefined;
  const activeBoard = boards.find((b) => b.id === activeBoardId);

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const newBoard = await createBoard({
        title: title.trim(),
        background: selectedBg,
      });
      toast.success("Board created successfully!");
      setIsOpen(false);
      setTitle("");
      router.push(`/board/${newBoard.id}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to create board");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <nav className="h-14 border-b border-border bg-background/80 backdrop-blur-md px-3 md:px-6 flex items-center justify-between sticky top-0 z-40 select-none overflow-hidden">
      <div className="flex items-center gap-2 md:gap-6 min-w-0">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-lg tracking-tight hover:opacity-95 transition-opacity"
        >
          <div className="bg-linear-to-tr from-blue-600 to-indigo-600 text-white p-1.5 rounded-lg shadow-md shadow-blue-500/20">
            <Kanban size={18} className="rotate-90" />
          </div>
          <span className="whitespace-nowrap bg-linear-to-r from-foreground via-foreground/90 to-foreground/75 bg-clip-text text-transparent">
            Aryan Trello
          </span>
        </Link>

        {/* Boards Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                className="font-semibold text-sm md:text-lg text-muted-foreground hover:text-foreground px-1 md:px-2 py-1 h-auto truncate max-w-36 md:max-w-none"
              />
            }
          >
            {activeBoard?.title || "Boards"} <ChevronDown size={16} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
              Recent Boards
            </div>
            <DropdownMenuSeparator />
            {boards.map((b) => (
              <DropdownMenuItem
                key={b.id}
                className="cursor-pointer"
                onClick={() => router.push(`/board/${b.id}`)}
              >
                <div className="flex items-center gap-2 w-full">
                  <div
                    className="w-4 h-4 rounded-sm"
                    style={{
                      background:
                        BACKGROUND_PRESETS.find((p) => p.id === b.background)
                          ?.preview || b.background,
                    }}
                  />
                  <span className="truncate font-medium">{b.title}</span>
                  {b.id === activeBoardId && (
                    <span className="ml-auto w-2 h-2 rounded-full bg-blue-500" />
                  )}
                </div>
              </DropdownMenuItem>
            ))}
            {boards.length === 0 && (
              <div className="px-2 py-3 text-xs text-muted-foreground text-center">
                No boards yet.
              </div>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="p-0">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-blue-500 hover:text-blue-600 hover:bg-blue-500/5 gap-1.5 px-2 py-1.5"
                onClick={() => setIsOpen(true)}
              >
                <Plus size={14} />
                <span>Create New Board</span>
              </Button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Create Board Modal Direct Trigger */}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="sm:max-w-106.25">
            <form onSubmit={handleCreateBoard}>
              <DialogHeader>
                <DialogTitle>Create Board</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label
                    htmlFor="board-title"
                    className="text-sm font-semibold"
                  >
                    Board Title
                  </label>
                  <Input
                    id="board-title"
                    placeholder="Enter board title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <div className="grid gap-2">
                  <span className="text-sm font-semibold">
                    Background Theme
                  </span>
                  <div className="grid grid-cols-4 gap-2 mt-1">
                    {BACKGROUND_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        className={`h-12 rounded-lg border-2 relative overflow-hidden transition-all duration-200 cursor-pointer ${
                          selectedBg === preset.id
                            ? "border-blue-500 scale-105 shadow-md shadow-blue-500/20"
                            : "border-transparent hover:scale-[1.02]"
                        }`}
                        onClick={() => setSelectedBg(preset.id)}
                        title={preset.name}
                        style={{ background: preset.preview }}
                      >
                        {selectedBg === preset.id && (
                          <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting || !title.trim()}>
                  {isSubmitting ? "Creating..." : "Create Board"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        {/* Home Navigation button */}
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground h-9 w-9 rounded-lg"
          onClick={() => router.push("/")}
          title="Back to Workspace"
        >
          <Home size={18} />
        </Button>

        {/* Theme Toggler */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground"
              />
            }
          >
            {theme === "light" ? (
              <Sun size={18} />
            ) : theme === "dark" ? (
              <Moon size={18} />
            ) : (
              <Laptop size={18} />
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => setTheme("light")}
              className="cursor-pointer gap-2"
            >
              <Sun size={14} />
              <span>Light</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setTheme("dark")}
              className="cursor-pointer gap-2"
            >
              <Moon size={14} />
              <span>Dark</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setTheme("system")}
              className="cursor-pointer gap-2"
            >
              <Laptop size={14} />
              <span>System</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Demo User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500">
                <Avatar className="w-8 h-8 ring-2 ring-border hover:opacity-90 cursor-pointer">
                  <AvatarImage src="https://api.dicebear.com/7.x/initials/svg?seed=AG&backgroundColor=039be5" />
                  <AvatarFallback className="bg-blue-600 text-white text-xs font-bold">
                    AG
                  </AvatarFallback>
                </Avatar>
              </button>
            }
          />

          <DropdownMenuContent align="end" className="w-64">
            <div className="px-3 py-2">
              <p className="text-sm font-semibold">Aryan Gupta</p>
              <p className="text-xs text-muted-foreground">aryan@gupta.com</p>
            </div>

            <DropdownMenuSeparator />

            <div className="px-3 py-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                Demo Workspace Members
              </p>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src="https://api.dicebear.com/7.x/initials/svg?seed=AG&backgroundColor=039be5" />
                    <AvatarFallback>AG</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">Aryan Gupta</span>
                </div>

                <div className="flex items-center gap-2">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src="https://api.dicebear.com/7.x/initials/svg?seed=AT&backgroundColor=8b5cf6" />
                    <AvatarFallback>AT</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">Advika Tiwari</span>
                </div>

                <div className="flex items-center gap-2">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src="https://api.dicebear.com/7.x/initials/svg?seed=RS&backgroundColor=10b981" />
                    <AvatarFallback>RS</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">Rishi Soni</span>
                </div>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
