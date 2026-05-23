"use server";

import { prisma } from "@/lib/db";
import { createListSchema, updateListSchema } from "@/lib/validation";
import { revalidatePath } from "next/cache";

export async function createList(rawInput: { title: string; boardId: string; position: number }) {
  try {
    const parsed = createListSchema.parse(rawInput);

    const list = await prisma.list.create({
      data: {
        title: parsed.title,
        boardId: parsed.boardId,
        position: parsed.position,
      },
    });

    // Log Activity
    const john = await prisma.member.findFirst({ where: { email: "john@example.com" } });
    if (john) {
      await prisma.activity.create({
        data: {
          text: `added list "${list.title}" to this board`,
          boardId: list.boardId,
          memberId: john.id,
        },
      });
    }

    revalidatePath(`/board/${parsed.boardId}`);
    return list;
  } catch (error: any) {
    console.error("Failed to create list:", error);
    throw new Error(error.message || "Failed to create list.");
  }
}

export async function updateList(listId: string, rawInput: { title?: string; position?: number }) {
  try {
    const parsed = updateListSchema.parse(rawInput);

    const list = await prisma.list.update({
      where: { id: listId },
      data: parsed,
    });

    revalidatePath(`/board/${list.boardId}`);
    return list;
  } catch (error: any) {
    console.error("Failed to update list:", error);
    throw new Error(error.message || "Failed to update list.");
  }
}

export async function deleteList(listId: string) {
  try {
    const list = await prisma.list.delete({
      where: { id: listId },
    });

    // Log Activity
    const john = await prisma.member.findFirst({ where: { email: "john@example.com" } });
    if (john) {
      await prisma.activity.create({
        data: {
          text: `removed list "${list.title}"`,
          boardId: list.boardId,
          memberId: john.id,
        },
      });
    }

    revalidatePath(`/board/${list.boardId}`);
    return { success: true, boardId: list.boardId };
  } catch (error) {
    console.error("Failed to delete list:", error);
    throw new Error("Failed to delete list.");
  }
}
