import { getBoards } from "@/actions/boardActions";
import Navbar from "@/components/board/Navbar";
import Link from "next/link";
import { BACKGROUND_PRESETS } from "@/utils/backgrounds";
import { Kanban, Plus } from "lucide-react";

export default async function HomePage() {
  const boards = await getBoards();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar boards={boards} />
      <main className="flex-1 px-8 py-10 max-w-7xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1">
            My Workspace
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your boards and projects.
          </p>
        </div>

        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
            <Kanban size={14} />
            Your Boards
          </h2>

          {boards.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
              <div className="bg-linear-to-tr from-blue-600 to-indigo-600 text-white p-3 rounded-xl mb-4 shadow-lg shadow-blue-500/20">
                <Kanban size={28} className="rotate-90" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No boards yet</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Create your first board to start organizing your work with lists
                and cards.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {boards.map((board) => {
                const preset = BACKGROUND_PRESETS.find(
                  (p) => p.id === board.background
                );
                const bgStyle = preset
                  ? { background: preset.preview }
                  : { background: board.background };

                return (
                  <Link
                    key={board.id}
                    href={`/board/${board.id}`}
                    className="group relative h-28 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
                    style={bgStyle}
                  >
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                    <div className="absolute inset-0 p-3 flex flex-col justify-between">
                      <span className="text-white font-semibold text-sm leading-tight line-clamp-2 drop-shadow">
                        {board.title}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
