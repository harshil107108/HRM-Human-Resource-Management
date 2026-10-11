import { ShieldX, ArrowLeft, LayoutDashboard } from "lucide-react";
import { useNavigate } from "react-router-dom";

/**
 * Shown instead of a page (or a grid) the user isn't allowed to view.
 * `compact` fits inside a card/grid area instead of filling the page.
 */
export default function NoPermission({
  title = "You don't have permission",
  message = "Your role doesn't include access to this page. Ask your administrator if you need it.",
  compact = false,
  showActions = true,
}) {
  const navigate = useNavigate();

  return (
    <div
      role="alert"
      className={`flex w-full flex-col items-center justify-center text-center ${compact ? "h-full min-h-[240px] p-6" : "min-h-[70vh] p-8"}`}
    >
      <div className="relative">
        <div className="absolute inset-0 -m-4 rounded-full bg-rose-100/60 blur-xl" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-rose-100 bg-gradient-to-br from-white to-rose-50 shadow-sm">
          <ShieldX className="h-10 w-10 text-rose-500" strokeWidth={1.75} />
        </div>
      </div>

      <h2 className="mt-6 text-lg font-bold text-slate-800">{title}</h2>
      <p className="mt-1.5 max-w-sm text-sm text-slate-500">{message}</p>

      {showActions && (
        <div className="mt-6 flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-600 shadow-sm hover:bg-slate-50"
          >
            <ArrowLeft size={15} />
            Go back
          </button>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-700"
          >
            <LayoutDashboard size={15} />
            Home
          </button>
        </div>
      )}
    </div>
  );
}
