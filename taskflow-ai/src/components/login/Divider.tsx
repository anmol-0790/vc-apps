export function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-slate-200" />
      <span className="text-[12px] font-medium tracking-wide text-slate-400 uppercase">
        {label}
      </span>
      <div className="h-px flex-1 bg-slate-200" />
    </div>
  );
}
