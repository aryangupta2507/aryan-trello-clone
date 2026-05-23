export interface Member {
  id: string;
  name: string;
  avatarUrl: string;
  email: string;
}

export interface Label {
  id: string;
  title: string | null;
  color: string;
  boardId: string;
}

export interface ChecklistItem {
  id: string;
  title: string;
  isCompleted: boolean;
  cardId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Attachment {
  id: string;
  fileName: string;
  fileUrl: string; // Base64 or Object URL preview
  fileType: string;
  cardId: string;
  createdAt: Date | string;
}

export interface Comment {
  id: string;
  text: string;
  cardId: string;
  memberId: string;
  member: Member;
  createdAt: Date | string;
}

export interface Activity {
  id: string;
  text: string;
  boardId: string;
  cardId: string | null;
  memberId: string;
  member: Member;
  createdAt: Date | string;
}

export interface Card {
  id: string;
  title: string;
  description: string;
  position: number;
  dueDate: Date | string | null;
  dueComplete: boolean;
  coverColor: string | null;
  coverImage: string | null;
  isArchived: boolean;
  listId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  labels: Label[];
  members: Member[];
  checklist: ChecklistItem[];
  comments: Comment[];
  attachments: Attachment[];
}

export interface List {
  id: string;
  title: string;
  position: number;
  boardId: string;
  cards: Card[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Board {
  id: string;
  title: string;
  background: string;
  lists: List[];
  members: Member[];
  labels: Label[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

// Zod schema payload types
export interface CreateBoardInput {
  title: string;
  background: string;
}

export interface CreateListInput {
  title: string;
  boardId: string;
  position: number;
}

export interface CreateCardInput {
  title: string;
  listId: string;
  position: number;
}
