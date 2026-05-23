export interface BackgroundOption {
  id: string;
  name: string;
  className: string; // Tailwind class
  preview: string; // CSS style or gradient for preview
}

export const BACKGROUND_PRESETS: BackgroundOption[] = [
  {
    id: "blue-gradient",
    name: "Deep Blue Gradient",
    className: "bg-gradient-to-br from-blue-600 to-indigo-900",
    preview: "linear-gradient(135deg, #2563eb, #312e81)",
  },
  {
    id: "purple-gradient",
    name: "Sunset Purple",
    className: "bg-gradient-to-br from-purple-600 to-pink-900",
    preview: "linear-gradient(135deg, #9333ea, #831843)",
  },
  {
    id: "green-gradient",
    name: "Forest Teal",
    className: "bg-gradient-to-br from-emerald-500 to-teal-900",
    preview: "linear-gradient(135deg, #10b981, #115e59)",
  },
  {
    id: "orange-gradient",
    name: "Volcanic Rust",
    className: "bg-gradient-to-br from-orange-500 to-red-800",
    preview: "linear-gradient(135deg, #f97316, #991b1b)",
  },
  {
    id: "dark-gradient",
    name: "Midnight Eclipse",
    className: "bg-gradient-to-br from-slate-900 to-neutral-950",
    preview: "linear-gradient(135deg, #0f172a, #0a0a0a)",
  },
  {
    id: "solid-blue",
    name: "Classic Blue",
    className: "bg-blue-600",
    preview: "#2563eb",
  },
  {
    id: "solid-green",
    name: "Emerald Green",
    className: "bg-emerald-600",
    preview: "#059669",
  },
  {
    id: "solid-slate",
    name: "Slate Gray",
    className: "bg-slate-700",
    preview: "#334155",
  },
];

export function getBackgroundClass(bgId: string): string {
  const matched = BACKGROUND_PRESETS.find((preset) => preset.id === bgId || preset.className === bgId);
  return matched ? matched.className : bgId || "bg-gradient-to-br from-blue-600 to-indigo-900";
}
