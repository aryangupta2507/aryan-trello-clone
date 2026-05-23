import { z } from "zod";

// Board Validation
export const createBoardSchema = z.object({
  title: z
    .string()
    .min(1, "Board title is required")
    .max(100, "Title is too long"),
  background: z.string().min(1, "Background configuration is required"),
});

export const updateBoardSchema = z.object({
  title: z.string().min(1, "Board title cannot be empty").max(100).optional(),
  background: z.string().min(1).optional(),
});

// List Validation
export const createListSchema = z.object({
  title: z.string().min(1, "List title is required").max(100),
  boardId: z.string().uuid("Invalid board ID"),
  position: z.number(),
});

export const updateListSchema = z.object({
  title: z.string().min(1, "List title cannot be empty").max(100).optional(),
  position: z.number().optional(),
});

// Card Validation
export const createCardSchema = z.object({
  title: z.string().min(1, "Card title is required").max(200),
  listId: z.string().uuid("Invalid list ID"),
  position: z.number(),
});

export const updateCardSchema = z.object({
  title: z.string().min(1, "Card title cannot be empty").max(200).optional(),
  description: z.string().max(2000).optional(),
  position: z.number().optional(),
  listId: z.string().uuid("Invalid list ID").optional(),
  dueDate: z.preprocess((val) => {
    if (val === undefined) return undefined;
    if (val === null || val === "") return null;
    return new Date(val as string);
  }, z.date().nullable().optional()),
  dueComplete: z.boolean().optional(),
  coverColor: z.string().nullable().optional(),
  coverImage: z.string().nullable().optional(),
  isArchived: z.boolean().optional(),
});

// Checklist Item Validation
export const createChecklistItemSchema = z.object({
  title: z.string().min(1, "Checklist item text is required").max(200),
  cardId: z.string().uuid("Invalid card ID"),
});

export const updateChecklistItemSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  isCompleted: z.boolean().optional(),
});

// Comment Validation
export const createCommentSchema = z.object({
  text: z.string().min(1, "Comment text cannot be empty").max(1000),
  cardId: z.string().uuid("Invalid card ID"),
  memberId: z.string().uuid("Invalid member ID"),
});

// Attachment Validation
export const createAttachmentSchema = z.object({
  fileName: z.string().min(1, "File name is required"),
  fileUrl: z.string().min(1, "File content is required"), // Base64 data URL
  fileType: z.string().min(1, "File type is required"),
  cardId: z.string().uuid("Invalid card ID"),
});
