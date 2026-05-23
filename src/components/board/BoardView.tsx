"use client";

import React, { useState, useCallback, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  pointerWithin,
  rectIntersection,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  CollisionDetection,
  defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { createSnapModifier } from "@dnd-kit/modifiers";
import ListColumn from "@/components/board/ListColumn";
import CardItem from "@/components/board/CardItem";
import AddListForm from "@/components/board/AddListForm";
import CardModal from "@/components/board/CardModal";
import FiltersPopover from "@/components/filters/FiltersPopover";
import { updateList } from "@/actions/listActions";
import { updateCard } from "@/actions/cardActions";
import { getNewPosition } from "@/utils/position";
import type { Board, List, Card } from "@/types";

interface BoardViewProps {
  board: Board;
}
const collisionDetectionStrategy: CollisionDetection = (args) => {
  const pointerCollisions = pointerWithin(args);

  if (pointerCollisions.length > 0) {
    return pointerCollisions;
  }

  return rectIntersection(args);
};

export default function BoardView({ board }: BoardViewProps) {
  const [lists, setLists] = useState<List[]>(board.lists);
  const [activeListId, setActiveListId] = useState<string | null>(null);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);

  // Modal State
  const [modalCard, setModalCard] = useState<Card | null>(null);

  // Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [selectedDueDates, setSelectedDueDates] = useState<string[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  // Update local state when server props change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLists(board.lists);
  }, [board.lists]);

  // Keep modal card in sync with server updates
  useEffect(() => {
    if (modalCard) {
      const updatedCard = lists
        .flatMap((l) => l.cards)
        .find((c) => c.id === modalCard.id);
      if (updatedCard) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setModalCard(updatedCard);
      } else {
        setModalCard(null); // Card was deleted
      }
    }
  }, [lists, modalCard?.id]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  );

  // --- Filtering Logic ---
  const getFilteredCardIds = useCallback(() => {
    const ids = new Set<string>();

    lists.forEach((list) => {
      list.cards.forEach((card) => {
        let matchesSearch = true;
        let matchesLabels = true;
        let matchesDueDate = true;
        let matchesMembers = true;

        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          matchesSearch =
            card.title.toLowerCase().includes(query) ||
            (card.description?.toLowerCase().includes(query) ?? false);
        }

        if (selectedLabels.length > 0) {
          matchesLabels =
            card.labels?.some((l) => selectedLabels.includes(l.id)) ?? false;
        }
        if (selectedMembers.length > 0) {
          matchesMembers =
            card.members?.some((m) => selectedMembers.includes(m.id)) ?? false;
        }

        if (selectedDueDates.length > 0) {
          if (!card.dueDate) {
            matchesDueDate = false;
          } else {
            const due = new Date(card.dueDate);
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const nextWeek = new Date(today);
            nextWeek.setDate(nextWeek.getDate() + 7);

            const isOverdue = due < today && !card.dueComplete;
            const isDueTomorrow = due >= today && due <= tomorrow;
            const isDueNextWeek = due > tomorrow && due <= nextWeek;

            matchesDueDate = selectedDueDates.some((filter) => {
              switch (filter) {
                case "overdue":
                  return isOverdue;
                case "due-tomorrow":
                  return isDueTomorrow;
                case "due-next-week":
                  return isDueNextWeek;
                case "complete":
                  return card.dueComplete;
                case "incomplete":
                  return !card.dueComplete;
                default:
                  return false;
              }
            });
          }
        }

        if (
          matchesSearch &&
          matchesLabels &&
          matchesDueDate &&
          matchesMembers
        ) {
          ids.add(card.id);
        }
      });
    });

    return ids;
  }, [lists, searchQuery, selectedLabels, selectedDueDates, selectedMembers]);

  const filteredCardIds = getFilteredCardIds();

  // --- Drag and Drop Logic ---
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const type = active.data.current?.type;

    if (type === "List") setActiveListId(active.id as string);
    if (type === "Card") setActiveCardId(active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    // Do not update state here.
    // Final movement will happen in handleDragEnd.
  };
  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveListId(null);
    setActiveCardId(null);

    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    const type = active.data.current?.type;

    if (type === "List") {
      if (activeId === overId) return;

      const activeIndex = lists.findIndex((l) => l.id === activeId);
      const overIndex = lists.findIndex((l) => l.id === overId);

      if (activeIndex === -1 || overIndex === -1) return;

      const newLists = arrayMove(lists, activeIndex, overIndex);

      const prev = newLists[overIndex - 1]?.position;
      const next = newLists[overIndex + 1]?.position;
      const newPos = getNewPosition(prev, next);

      newLists[overIndex] = {
        ...newLists[overIndex],
        position: newPos,
      };

      setLists(newLists);

      try {
        await updateList(activeId, { position: newPos });
      } catch (err) {
        console.error(err);
        setLists(board.lists);
      }

      return;
    }

    if (type === "Card") {
      const originalListId = active.data.current?.card?.listId;

      const activeList =
        lists.find((list) => list.id === originalListId) ||
        lists.find((list) => list.cards.some((card) => card.id === activeId));

      const overListId =
        over.data.current?.listId ||
        (over.data.current?.type === "List" ? overId : null);

      const overList = overListId
        ? lists.find((list) => list.id === overListId)
        : lists.find((list) => list.cards.some((card) => card.id === overId));

      if (!activeList || !overList) return;

      const activeCard =
        activeList.cards.find((card) => card.id === activeId) ||
        active.data.current?.card;

      if (!activeCard) return;

      const activeIndex = activeList.cards.findIndex(
        (card) => card.id === activeId,
      );

      let overIndex =
        over.data.current?.type === "List"
          ? overList.cards.length
          : overList.cards.findIndex((card) => card.id === overId);

      if (overIndex === -1) {
        overIndex = overList.cards.length;
      }

      if (activeList.id === overList.id) {
        if (activeIndex === overIndex) return;

        const newCards = arrayMove(activeList.cards, activeIndex, overIndex);

        const prev = newCards[overIndex - 1]?.position;
        const next = newCards[overIndex + 1]?.position;
        const newPos = getNewPosition(prev, next);

        newCards[overIndex] = {
          ...newCards[overIndex],
          position: newPos,
        };

        const newLists = lists.map((list) =>
          list.id === activeList.id ? { ...list, cards: newCards } : list,
        );

        setLists(newLists);

        try {
          await updateCard(activeId, { position: newPos });
        } catch (err) {
          console.error(err);
          setLists(board.lists);
        }

        return;
      }

      const sourceCards = activeList.cards.filter(
        (card) => card.id !== activeId,
      );

      const destinationCards = overList.cards.filter(
        (card) => card.id !== activeId,
      );

      destinationCards.splice(overIndex, 0, {
        ...activeCard,
        listId: overList.id,
      });

      const prev = destinationCards[overIndex - 1]?.position;
      const next = destinationCards[overIndex + 1]?.position;
      const newPos = getNewPosition(prev, next);

      destinationCards[overIndex] = {
        ...destinationCards[overIndex],
        listId: overList.id,
        position: newPos,
      };

      const newLists = lists.map((list) => {
        if (list.id === activeList.id) {
          return { ...list, cards: sourceCards };
        }

        if (list.id === overList.id) {
          return { ...list, cards: destinationCards };
        }

        return list;
      });

      setLists(newLists);

      try {
        await updateCard(activeId, {
          listId: overList.id,
          position: newPos,
        });
      } catch (err) {
        console.error(err);
        setLists(board.lists);
      }
    }
  };

  // Find dragged elements for overlay
  const activeList = lists.find((l) => l.id === activeListId);
  const activeCard = lists
    .flatMap((l) => l.cards)
    .find((c) => c.id === activeCardId);
  const nextListPosition = getNewPosition(
    lists.length > 0 ? lists[lists.length - 1].position : undefined,
    undefined,
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Board Header / Filters */}
      <div className="px-6 py-3 flex items-center justify-between bg-black/10 backdrop-blur-sm border-b border-white/10 shrink-0">
        <h2 className="text-lg font-bold text-white drop-shadow-md">
          {board.title}
        </h2>
        <div className="flex items-center gap-2">
          <FiltersPopover
            board={board}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedLabels={selectedLabels}
            setSelectedLabels={setSelectedLabels}
            selectedDueDates={selectedDueDates}
            setSelectedDueDates={setSelectedDueDates}
            selectedMembers={selectedMembers}
            setSelectedMembers={setSelectedMembers}
          />
        </div>
      </div>

      {/* Board Canvas */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-6 custom-scrollbar-horizontal">
        <DndContext
          id="board-dnd"
          sensors={sensors}
          collisionDetection={collisionDetectionStrategy}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 h-full items-start">
            <SortableContext
              items={lists.map((l) => l.id)}
              strategy={horizontalListSortingStrategy}
            >
              {lists.map((list) => (
                <ListColumn
                  key={list.id}
                  list={list}
                  boardId={board.id}
                  filteredCardIds={filteredCardIds}
                  onCardOpen={setModalCard}
                />
              ))}
            </SortableContext>

            <AddListForm boardId={board.id} nextPosition={nextListPosition} />
          </div>

          <DragOverlay
            dropAnimation={{
              sideEffects: defaultDropAnimationSideEffects({
                styles: { active: { opacity: "0.5" } },
              }),
            }}
          >
            {activeList ? (
              <ListColumn
                list={activeList}
                boardId={board.id}
                filteredCardIds={filteredCardIds}
                onCardOpen={() => {}}
              />
            ) : null}
            {activeCard ? (
              <div className="w-68">
                <CardItem card={activeCard} onOpen={() => {}} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      <CardModal
        card={modalCard}
        list={
          modalCard
            ? lists.find((l) => l.id === modalCard.listId) || null
            : null
        }
        board={board}
        isOpen={!!modalCard}
        onClose={() => setModalCard(null)}
      />
    </div>
  );
}
