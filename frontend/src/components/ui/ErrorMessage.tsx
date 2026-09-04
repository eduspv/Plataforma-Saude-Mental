export default function ErrorMessage({ children }: { children: string }) {
  return (
    <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-sans text-sm text-red-700">
      {children}
    </p>
  );
}
