"use client";

import { useState, type ReactNode } from "react";

export type DragSortListItem = {
  id: string;
};

type DragSortListProps<T extends DragSortListItem> = {
  items: T[];
  onReorder: (orderedIds: string[]) => void | Promise<void>;
  renderItem: (
    item: T,
    index: number,
    meta: {
      dragHandleProps: {
        draggable: boolean;
        onDragStart: (event: React.DragEvent<HTMLButtonElement>) => void;
        onDragEnd: () => void;
      };
      isDragging: boolean;
      isDropTarget: boolean;
    }
  ) => ReactNode;
  disabled?: boolean;
  className?: string;
};

function moveItem(ids: string[], fromId: string, toId: string): string[] {
  const fromIndex = ids.indexOf(fromId);
  const toIndex = ids.indexOf(toId);
  if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return ids;

  const next = [...ids];
  const [removed] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, removed);
  return next;
}

export default function DragSortList<T extends DragSortListItem>({
  items,
  onReorder,
  renderItem,
  disabled = false,
  className = ""
}: DragSortListProps<T>) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);

  const handleDragStart = (itemId: string) => (event: React.DragEvent<HTMLButtonElement>) => {
    if (disabled) return;
    event.stopPropagation();
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", itemId);
    setDraggingId(itemId);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setDropTargetId(null);
  };

  const handleDragOver = (itemId: string) => (event: React.DragEvent<HTMLDivElement>) => {
    if (disabled || !draggingId || draggingId === itemId) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setDropTargetId(itemId);
  };

  const handleDrop = (itemId: string) => (event: React.DragEvent<HTMLDivElement>) => {
    if (disabled) return;
    event.preventDefault();
    const sourceId = event.dataTransfer.getData("text/plain") || draggingId;
    if (!sourceId || sourceId === itemId) {
      handleDragEnd();
      return;
    }

    const nextIds = moveItem(
      items.map((item) => item.id),
      sourceId,
      itemId
    );
    handleDragEnd();
    void onReorder(nextIds);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {items.map((item, index) => (
        <div
          key={item.id}
          onDragOver={handleDragOver(item.id)}
          onDragLeave={() => setDropTargetId((current) => (current === item.id ? null : current))}
          onDrop={handleDrop(item.id)}
          className={`rounded-xl transition ${
            dropTargetId === item.id && draggingId !== item.id ? "ring-2 ring-caramel/50" : ""
          } ${draggingId === item.id ? "opacity-60" : ""}`}
        >
          {renderItem(item, index, {
            dragHandleProps: {
              draggable: !disabled,
              onDragStart: handleDragStart(item.id),
              onDragEnd: handleDragEnd
            },
            isDragging: draggingId === item.id,
            isDropTarget: dropTargetId === item.id
          })}
        </div>
      ))}
    </div>
  );
}

export function DragHandle({
  dragHandleProps,
  className = ""
}: {
  dragHandleProps: {
    draggable: boolean;
    onDragStart: (event: React.DragEvent<HTMLButtonElement>) => void;
    onDragEnd: () => void;
  };
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label="Drag to reorder"
      className={`flex h-7 w-7 shrink-0 cursor-grab items-center justify-center rounded-md border border-ivory/15 text-mist active:cursor-grabbing hover:border-caramel/40 hover:text-ivory ${className}`}
      {...dragHandleProps}
      onClick={(event) => event.stopPropagation()}
    >
      <svg viewBox="0 0 12 16" className="h-3.5 w-3.5 fill-current" aria-hidden="true">
        <circle cx="3" cy="3" r="1.2" />
        <circle cx="9" cy="3" r="1.2" />
        <circle cx="3" cy="8" r="1.2" />
        <circle cx="9" cy="8" r="1.2" />
        <circle cx="3" cy="13" r="1.2" />
        <circle cx="9" cy="13" r="1.2" />
      </svg>
    </button>
  );
}
