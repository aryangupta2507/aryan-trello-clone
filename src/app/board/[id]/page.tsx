import { notFound } from "next/navigation";
import { getBoardWithDetails } from "@/actions/boardActions";
import Navbar from "@/components/board/Navbar";
import BoardView from "@/components/board/BoardView";
import { getBoards } from "@/actions/boardActions";
import { BACKGROUND_PRESETS } from "@/utils/backgrounds";
import type { Metadata } from "next";

interface BoardPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({
  params,
}: BoardPageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const board = await getBoardWithDetails(id);

    if (!board) {
      return { title: "Board Not Found" };
    }

    return {
      title: `${board.title} | Antigravity Board`,
    };
  } catch {
    return {
      title: "Board | Antigravity Board",
    };
  }
}

export default async function BoardPage({
  params,
}: BoardPageProps) {
  const { id } = await params;

  const [board, allBoards] = await Promise.all([
    getBoardWithDetails(id),
    getBoards(),
  ]);

  if (!board) {
    notFound();
  }

  const preset = BACKGROUND_PRESETS.find(
    (p) => p.id === board.background
  );

  const bgStyle = preset
    ? { background: preset.preview }
    : { background: board.background };

  return (
    <div
      className="flex flex-col h-screen overflow-hidden"
      style={bgStyle}
    >
      <Navbar boards={allBoards} />

      <main className="flex-1 relative overflow-hidden">
        {preset && (
          <div className="absolute inset-0 bg-black/10 pointer-events-none" />
        )}

        <div className="relative h-full z-10">
          <BoardView board={board as any} />
        </div>
      </main>
    </div>
  );
}