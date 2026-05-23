import { create } from "zustand";
import type { Board, Card } from "@/types";

interface BoardState {
  board: Board | null;
  backupBoard: Board | null;
  searchQuery: string;
  filterLabels: string[]; // label IDs
  filterMembers: string[]; // member IDs
  filterDueDate: "overdue" | "due-tomorrow" | "due-next-week" | "complete" | "incomplete" | null;
  isDragging: boolean;

  // Actions
  setBoard: (board: Board | null) => void;
  setSearchQuery: (query: string) => void;
  toggleFilterLabel: (labelId: string) => void;
  toggleFilterMember: (memberId: string) => void;
  setFilterDueDate: (dueDateFilter: BoardState["filterDueDate"]) => void;
  clearFilters: () => void;
  setIsDragging: (isDragging: boolean) => void;

  // Optimistic UI Actions for Drag-and-Drop
  moveListOptimistically: (listId: string, newPosition: number) => void;
  moveCardOptimistically: (cardId: string, targetListId: string, newPosition: number) => void;
  rollbackBoard: () => void;
  commitBoard: () => void;
}

export const useBoardStore = create<BoardState>((set, get) => ({
  board: null,
  backupBoard: null,
  searchQuery: "",
  filterLabels: [],
  filterMembers: [],
  filterDueDate: null,
  isDragging: false,

  setBoard: (board) => set({ board }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  
  toggleFilterLabel: (labelId) =>
    set((state) => {
      const exists = state.filterLabels.includes(labelId);
      return {
        filterLabels: exists
          ? state.filterLabels.filter((id) => id !== labelId)
          : [...state.filterLabels, labelId],
      };
    }),

  toggleFilterMember: (memberId) =>
    set((state) => {
      const exists = state.filterMembers.includes(memberId);
      return {
        filterMembers: exists
          ? state.filterMembers.filter((id) => id !== memberId)
          : [...state.filterMembers, memberId],
      };
    }),

  setFilterDueDate: (filterDueDate) => set({ filterDueDate }),

  clearFilters: () =>
    set({
      searchQuery: "",
      filterLabels: [],
      filterMembers: [],
      filterDueDate: null,
    }),

  setIsDragging: (isDragging) => set({ isDragging }),

  // Optimistic List Reordering
  moveListOptimistically: (listId, newPosition) => {
    const currentBoard = get().board;
    if (!currentBoard) return;

    // Save backup for rollback
    const backupBoard = JSON.parse(JSON.stringify(currentBoard)) as Board;

    // Perform state update
    const updatedLists = currentBoard.lists.map((list) => {
      if (list.id === listId) {
        return { ...list, position: newPosition };
      }
      return list;
    });

    // Sort lists by position
    updatedLists.sort((a, b) => a.position - b.position);

    set({
      board: { ...currentBoard, lists: updatedLists },
      backupBoard,
    });
  },

  // Optimistic Card Moving (within same list or between different lists)
  moveCardOptimistically: (cardId, targetListId, newPosition) => {
    const currentBoard = get().board;
    if (!currentBoard) return;

    // Save backup for rollback
    const backupBoard = JSON.parse(JSON.stringify(currentBoard)) as Board;

    // Find the card to move
    let movedCard: Card | null = null;

    // Remove the card from its source list
    const listsWithCardRemoved = currentBoard.lists.map((list) => {
      const card = list.cards.find((c) => c.id === cardId);
      if (card) {
        movedCard = { ...card, listId: targetListId, position: newPosition };
        return {
          ...list,
          cards: list.cards.filter((c) => c.id !== cardId),
        };
      }
      return list;
    });

    if (!movedCard) return;

    // Add the card to the target list
    const updatedLists = listsWithCardRemoved.map((list) => {
      if (list.id === targetListId) {
        const newCards = [...list.cards, movedCard!];
        newCards.sort((a, b) => a.position - b.position);
        return {
          ...list,
          cards: newCards,
        };
      }
      return list;
    });

    set({
      board: { ...currentBoard, lists: updatedLists },
      backupBoard,
    });
  },

  rollbackBoard: () => {
    const backup = get().backupBoard;
    if (backup) {
      set({ board: backup, backupBoard: null });
    }
  },

  commitBoard: () => {
    set({ backupBoard: null });
  },
}));
