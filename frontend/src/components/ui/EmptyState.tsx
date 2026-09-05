export default function EmptyState({ children }: { children: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center font-sans text-sm text-slate-500">
      {children}
    </div>
  );
}
