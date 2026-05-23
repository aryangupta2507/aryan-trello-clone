"use server";

import { prisma } from "@/lib/db";
import {
  createCardSchema,
  updateCardSchema,
  createChecklistItemSchema,
  updateChecklistItemSchema,
  createCommentSchema,
  createAttachmentSchema,
} from "@/lib/validation";
import { revalidatePath } from "next/cache";

// Helper to get default user (Aryan Gupta)
async function getDefaultUser() {
  let user = await prisma.member.findFirst({
    where: { email: "aryan@example.com" },
  });

  if (!user) {
    user = await prisma.member.create({
      data: {
        name: "Aryan Gupta",
        email: "aryan@example.com",
        avatarUrl:
          "https://api.dicebear.com/7.x/initials/svg?seed=AG&backgroundColor=039be5",
      },
    });
  }

  return user;
}

export async function createCard(rawInput: {
  title: string;
  listId: string;
  position: number;
}) {
  try {
    const parsed = createCardSchema.parse(rawInput);
    const user = await getDefaultUser();

    // Fetch the list to find the board ID
    const list = await prisma.list.findUnique({
      where: { id: parsed.listId },
      select: { boardId: true },
    });
    if (!list) throw new Error("List not found");

    const card = await prisma.card.create({
      data: {
        title: parsed.title,
        listId: parsed.listId,
        position: parsed.position,
      },
    });

    // Create Activity Log
    await prisma.activity.create({
      data: {
        text: `added card "${card.title}" to list`,
        boardId: list.boardId,
        cardId: card.id,
        memberId: user.id,
      },
    });

    revalidatePath(`/board/${list.boardId}`);
    return card;
  } catch (error: any) {
    console.error("Failed to create card:", error);
    throw new Error(error.message || "Failed to create card.");
  }
}

export async function updateCard(
  cardId: string,
  rawInput: {
    title?: string;
    description?: string;
    position?: number;
    listId?: string;
    dueDate?: string | Date | null;
    dueComplete?: boolean;
    coverColor?: string | null;
    coverImage?: string | null;
    isArchived?: boolean;
  },
) {
  try {
    const parsed = updateCardSchema.parse(rawInput);
    const user = await getDefaultUser();

    // Get current card state to log transitions
    const originalCard = await prisma.card.findUnique({
      where: { id: cardId },
      include: { list: true },
    });
    if (!originalCard) throw new Error("Card not found");

    const updatedCard = await prisma.card.update({
      where: { id: cardId },
      data: parsed,
      include: { list: true },
    });

    // Activity logging depending on what changed
    const activities = [];

    if (parsed.listId && parsed.listId !== originalCard.listId) {
      const newList = await prisma.list.findUnique({
        where: { id: parsed.listId },
        select: { title: true },
      });
      activities.push({
        text: `moved card "${updatedCard.title}" from "${originalCard.list.title}" to "${newList?.title || "another list"}"`,
        boardId: originalCard.list.boardId,
        cardId,
        memberId: user.id,
      });
    }

    if (parsed.title && parsed.title !== originalCard.title) {
      activities.push({
        text: `renamed card to "${parsed.title}" (was "${originalCard.title}")`,
        boardId: originalCard.list.boardId,
        cardId,
        memberId: user.id,
      });
    }

    if (
      parsed.dueComplete !== undefined &&
      parsed.dueComplete !== originalCard.dueComplete
    ) {
      activities.push({
        text: parsed.dueComplete
          ? `marked the due date on card "${updatedCard.title}" as complete`
          : `marked the due date on card "${updatedCard.title}" as incomplete`,
        boardId: originalCard.list.boardId,
        cardId,
        memberId: user.id,
      });
    }

    if (activities.length > 0) {
      await prisma.activity.createMany({ data: activities });
    }

    revalidatePath(`/board/${originalCard.list.boardId}`);
    return updatedCard;
  } catch (error: any) {
    console.error("Failed to update card:", error);
    throw new Error(error.message || "Failed to update card.");
  }
}

export async function deleteCard(cardId: string) {
  try {
    const user = await getDefaultUser();
    const card = await prisma.card.findUnique({
      where: { id: cardId },
      include: { list: true },
    });
    if (!card) throw new Error("Card not found");

    await prisma.card.delete({
      where: { id: cardId },
    });

    // Log Activity
    await prisma.activity.create({
      data: {
        text: `deleted card "${card.title}"`,
        boardId: card.list.boardId,
        memberId: user.id,
      },
    });

    revalidatePath(`/board/${card.list.boardId}`);
    return { success: true, boardId: card.list.boardId };
  } catch (error) {
    console.error("Failed to delete card:", error);
    throw new Error("Failed to delete card.");
  }
}

// Checklist Actions
export async function addChecklistItem(cardId: string, title: string) {
  try {
    const parsed = createChecklistItemSchema.parse({ cardId, title });
    const user = await getDefaultUser();

    const item = await prisma.checklistItem.create({
      data: {
        title: parsed.title,
        cardId: parsed.cardId,
      },
      include: { card: { include: { list: true } } },
    });

    revalidatePath(`/board/${item.card.list.boardId}`);
    return item;
  } catch (error: any) {
    console.error("Failed to add checklist item:", error);
    throw new Error(error.message || "Failed to add checklist item.");
  }
}

export async function updateChecklistItem(
  itemId: string,
  data: { title?: string; isCompleted?: boolean },
) {
  try {
    const parsed = updateChecklistItemSchema.parse(data);

    const item = await prisma.checklistItem.update({
      where: { id: itemId },
      data: parsed,
      include: { card: { include: { list: true } } },
    });

    revalidatePath(`/board/${item.card.list.boardId}`);
    return item;
  } catch (error: any) {
    console.error("Failed to update checklist item:", error);
    throw new Error(error.message || "Failed to update checklist item.");
  }
}

export async function deleteChecklistItem(itemId: string) {
  try {
    const item = await prisma.checklistItem.delete({
      where: { id: itemId },
      include: { card: { include: { list: true } } },
    });

    revalidatePath(`/board/${item.card.list.boardId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to delete checklist item:", error);
    throw new Error("Failed to delete checklist item.");
  }
}

// Labels Toggles
export async function toggleCardLabel(cardId: string, labelId: string) {
  try {
    const card = await prisma.card.findUnique({
      where: { id: cardId },
      include: { labels: true, list: true },
    });
    if (!card) throw new Error("Card not found");

    const labelExists = card.labels.some(
      (l: { id: string }) => l.id === labelId,
    );

    const updated = await prisma.card.update({
      where: { id: cardId },
      data: {
        labels: labelExists
          ? { disconnect: { id: labelId } }
          : { connect: { id: labelId } },
      },
      include: { labels: true },
    });

    revalidatePath(`/board/${card.list.boardId}`);
    return updated;
  } catch (error) {
    console.error("Failed to toggle label:", error);
    throw new Error("Failed to toggle label.");
  }
}

// Member Assignment Toggles
export async function toggleCardMember(cardId: string, memberId: string) {
  try {
    const card = await prisma.card.findUnique({
      where: { id: cardId },
      include: { members: true, list: true },
    });
    if (!card) throw new Error("Card not found");

    const memberExists = card.members.some((m) => m.id === memberId);
    const user = await getDefaultUser();

    const updated = await prisma.card.update({
      where: { id: cardId },
      data: {
        members: memberExists
          ? { disconnect: { id: memberId } }
          : { connect: { id: memberId } },
      },
      include: { members: true },
    });

    // Log Activity
    const assignedMember = await prisma.member.findUnique({
      where: { id: memberId },
    });
    if (assignedMember) {
      await prisma.activity.create({
        data: {
          text: memberExists
            ? `removed ${assignedMember.name} from "${card.title}"`
            : `assigned ${assignedMember.name} to "${card.title}"`,
          boardId: card.list.boardId,
          cardId: card.id,
          memberId: user.id,
        },
      });
    }

    revalidatePath(`/board/${card.list.boardId}`);
    return updated;
  } catch (error) {
    console.error("Failed to toggle member assignment:", error);
    throw new Error("Failed to toggle member assignment.");
  }
}

// Comment Actions
export async function addComment(cardId: string, text: string) {
  try {
    const user = await getDefaultUser();
    const parsed = createCommentSchema.parse({
      cardId,
      text,
      memberId: user.id,
    });

    const comment = await prisma.comment.create({
      data: {
        text: parsed.text,
        cardId: parsed.cardId,
        memberId: parsed.memberId,
      },
      include: {
        member: true,
        card: { include: { list: true } },
      },
    });

    // Log Activity
    await prisma.activity.create({
      data: {
        text: `commented on card "${comment.card.title}": "${parsed.text.substring(0, 30)}${parsed.text.length > 30 ? "..." : ""}"`,
        boardId: comment.card.list.boardId,
        cardId: comment.cardId,
        memberId: user.id,
      },
    });

    revalidatePath(`/board/${comment.card.list.boardId}`);
    return comment;
  } catch (error: any) {
    console.error("Failed to add comment:", error);
    throw new Error(error.message || "Failed to add comment.");
  }
}

// Local Attachment Preview Actions (stored as Data URLs in db)
export async function addAttachment(
  cardId: string,
  fileName: string,
  fileUrl: string,
  fileType: string,
) {
  try {
    const parsed = createAttachmentSchema.parse({
      cardId,
      fileName,
      fileUrl,
      fileType,
    });
    const user = await getDefaultUser();

    const attachment = await prisma.attachment.create({
      data: {
        fileName: parsed.fileName,
        fileUrl: parsed.fileUrl,
        fileType: parsed.fileType,
        cardId: parsed.cardId,
      },
      include: { card: { include: { list: true } } },
    });

    // Log Activity
    await prisma.activity.create({
      data: {
        text: `attached ${parsed.fileName} to card "${attachment.card.title}"`,
        boardId: attachment.card.list.boardId,
        cardId: cardId,
        memberId: user.id,
      },
    });

    revalidatePath(`/board/${attachment.card.list.boardId}`);
    return attachment;
  } catch (error: any) {
    console.error("Failed to add attachment:", error);
    throw new Error(error.message || "Failed to add attachment.");
  }
}

export async function deleteAttachment(attachmentId: string) {
  try {
    const attachment = await prisma.attachment.delete({
      where: { id: attachmentId },
      include: { card: { include: { list: true } } },
    });

    revalidatePath(`/board/${attachment.card.list.boardId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to delete attachment:", error);
    throw new Error("Failed to delete attachment.");
  }
}
