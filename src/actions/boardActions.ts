"use server";

import { prisma } from "@/lib/db";
import { createBoardSchema, updateBoardSchema } from "@/lib/validation";
import { revalidatePath } from "next/cache";

export async function getBoards() {
  try {
    return await prisma.board.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Failed to fetch boards:", error);
    throw new Error("Failed to fetch boards.");
  }
}

export async function getBoardWithDetails(boardId: string) {
  try {
    const board = await prisma.board.findUnique({
      where: { id: boardId },
      include: {
        lists: {
          include: {
            cards: {
              include: {
                labels: true,
                members: true,
                checklist: {
                  orderBy: { createdAt: "asc" },
                },
                comments: {
                  include: { member: true },
                  orderBy: { createdAt: "desc" },
                },
                attachments: {
                  orderBy: { createdAt: "desc" },
                },
              },
              orderBy: { position: "asc" },
            },
          },
          orderBy: { position: "asc" },
        },
        members: true,
        labels: true,
      },
    });

    return board;
  } catch (error) {
    console.error("Failed to fetch board details:", error);
    throw new Error("Failed to fetch board details.");
  }
}

export async function createBoard(rawInput: {
  title: string;
  background: string;
}) {
  try {
    const parsed = createBoardSchema.parse(rawInput);

    const defaultMembers = await prisma.member.findMany();

    const board = await prisma.board.create({
      data: {
        title: parsed.title,
        background: parsed.background,
        members: {
          connect: defaultMembers.map((m: { id: string }) => ({ id: m.id })),
        },
      },
    });

    const defaultLabels = [
      { title: "High Priority", color: "#ef4444" },
      { title: "In Review", color: "#eab308" },
      { title: "Completed", color: "#22c55e" },
      { title: "Design", color: "#a855f7" },
      { title: "Marketing", color: "#3b82f6" },
    ];

    await Promise.all(
      defaultLabels.map((label) =>
        prisma.label.create({
          data: {
            title: label.title,
            color: label.color,
            boardId: board.id,
          },
        }),
      ),
    );

    const john = await prisma.member.findFirst({
      where: { email: "john@example.com" },
    });

    if (john) {
      await prisma.activity.create({
        data: {
          text: `created board "${board.title}"`,
          boardId: board.id,
          memberId: john.id,
        },
      });
    }

    revalidatePath("/");
    return board;
  } catch (error: any) {
    console.error("Failed to create board:", error);
    throw new Error(error.message || "Failed to create board.");
  }
}

export async function updateBoard(
  boardId: string,
  rawInput: { title?: string; background?: string },
) {
  try {
    const parsed = updateBoardSchema.parse(rawInput);

    const board = await prisma.board.update({
      where: { id: boardId },
      data: parsed,
    });

    revalidatePath(`/board/${boardId}`);
    revalidatePath("/");
    return board;
  } catch (error: any) {
    console.error("Failed to update board:", error);
    throw new Error(error.message || "Failed to update board.");
  }
}

export async function deleteBoard(boardId: string) {
  try {
    await prisma.board.delete({
      where: { id: boardId },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete board:", error);
    throw new Error("Failed to delete board.");
  }
}
