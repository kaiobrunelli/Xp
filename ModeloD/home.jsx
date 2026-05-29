// Home / Dashboard view.

function StatCard({ label, value, sub, accent, icon }) {
  const IconComp = icon ? Icon[icon] : Icon.LayoutDashboard;
  return (
    <div className="rounded-xl border border-ink-100 bg-white p-4 shadow-card">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[12px] font-medium uppercase tracking-wide text-ink-500">{label}</div>
          <div className="mt-2 text-[28px] font-semibold leading-none tabular-nums text-ink-900">{value}</div>
          {sub && <div className="mt-2 text-[12px] text-ink-500">{sub}</div>}
        </div>
        <div className="grid h-9 w-9 place-items-center rounded-lg" style={{ backgroundColor: accent.bg }}>
          <IconComp size={16} color={accent.fg} />
        </div>
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="grid grid-cols-[100px_180px_1fr_140px_140px_180px_140px_140px] gap-4 border-b border-ink-100 px-6 py-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="skeleton h-4"></div>
      ))}
    </div>
  );
}

function DisbursementRow({ row, onOpen, actionLabel = 'Ver detalhes', ActionIcon = Icon.ArrowRight }) {
  return (
    <div
      role="button"
      onClick={() => onOpen(row.id)}
      className="row-hover grid cursor-pointer grid-cols-[100px_180px_1fr_140px_140px_180px_140px_140px] items-center gap-4 border-b border-ink-100 px-6 py-3.5 text-[13.5px] transition-colors"
    >
      <div className="font-mono text-[12.5px] font-semibold text-brand-800">{row.id}</div>
      <div className="font-mono text-[12.5px] text-ink-700">{row.contrato}</div>
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[11px] font-semibold text-white"
             style={{ background: 'linear-gradient(135deg,#64747A,#9EB2BB)' }}>
          {row.beneficiario.split(' ').map((p) => p[0]).slice(0, 2).join('')}
        </div>
        <div className="truncate font-medium text-ink-900">{row.beneficiario}</div>
      </div>
      <div className="tabular-nums font-medium text-ink-900">{MOCK.BRL(row.valor)}</div>
      <div className="text-ink-700">{row.fase}</div>
      <div><UI.FractionChip ok={row.validacoes.ok} total={row.validacoes.total} /></div>
      <div><UI.StatusPill status={row.status} /></div>
      <div className="flex items-center justify-end gap-1 text-[12.5px] font-medium text-brand-700">
        {actionLabel}
        <ActionIcon size={14} color="#005CA9" />
      </div>
    </div>
  );
}

window.StatCard = StatCard;
window.SkeletonRow = SkeletonRow;
window.DisbursementRow = DisbursementRow;
