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

function HomeView({ onOpenDetail, loading, runMacro, lastRun, processing }) {
  const [filter, setFilter] = useState('todos');

  const filtered = useMemo(() => {
    if (filter === 'todos') return MOCK.DISBURSEMENTS;
    return MOCK.DISBURSEMENTS.filter((d) => d.status === filter);
  }, [filter]);

  const counts = {
    todos: MOCK.DISBURSEMENTS.length,
    pendente: MOCK.DISBURSEMENTS.filter((d) => d.status === 'pendente').length,
    aprovado: MOCK.DISBURSEMENTS.filter((d) => d.status === 'aprovado').length,
    pendencia: MOCK.DISBURSEMENTS.filter((d) => d.status === 'pendencia').length,
  };

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-8" data-screen-label="Home Dashboard">
      {/* Title bar */}
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <div className="text-[12.5px] font-medium uppercase tracking-wide text-ink-500">Painel do analista</div>
          <h1 className="mt-1 text-[26px] font-semibold leading-tight text-ink-900">
            Macro de Desembolsos
          </h1>
          <p className="mt-1 max-w-2xl text-[13.5px] text-ink-500">
            Automatização das validações de desembolso para contratos do Programa Minha Casa Minha Vida.
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <button className="inline-flex items-center gap-2 rounded-lg border border-ink-100 bg-white px-3 py-2 text-[13px] font-medium text-ink-700 hover:bg-ink-50">
            <Icon.Download size={14} color="#404B52" />
            Exportar
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg border border-ink-100 bg-white px-3 py-2 text-[13px] font-medium text-ink-700 hover:bg-ink-50">
            <Icon.Filter size={14} color="#404B52" />
            Filtros avançados
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Desembolsos" value="6" sub="No ciclo de 14/05/2025" icon="FolderOpen"
                  accent={{ bg: '#CFE3F8', fg: '#00437A' }} />
        <StatCard label="Aguardando Análise" value="3" sub="Tempo médio: 3h 12m" icon="Clock"
                  accent={{ bg: '#FFEFD6', fg: '#A65E00' }} />
        <StatCard label="Com Pendências" value="2" sub="Requerem tratativa" icon="CircleAlert"
                  accent={{ bg: '#FCE6E3', fg: '#C0392B' }} />
        <StatCard label="Aprovados" value="1" sub="Prontos para liberação" icon="CheckCircle"
                  accent={{ bg: '#E0F2E7', fg: '#1A7A4A' }} />
      </div>

      {/* Action bar */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          onClick={runMacro}
          disabled={processing}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-[13.5px] font-semibold text-white shadow-sm transition ${
            processing ? 'bg-brand-500 cursor-wait' : 'bg-brand-700 hover:bg-brand-800'
          }`}
        >
          {processing ? (
            <>
              <Icon.Loader size={15} className="spinner" />
              Processando macro...
            </>
          ) : (
            <>
              <Icon.Play size={14} />
              Processar Macro
            </>
          )}
        </button>

        {lastRun && !processing && (
          <span className="inline-flex items-center gap-2 rounded-full border border-ok/20 bg-[#E0F2E7] px-3 py-1.5 text-[12.5px] font-medium text-[#1A7A4A]">
            <Icon.Check size={13} color="#1A7A4A" strokeWidth={2.6} />
            Macro executada — {lastRun}
          </span>
        )}

        <div className="ml-auto flex items-center gap-2">
          <UI.FilterChip label="Todos"     active={filter==='todos'}     count={counts.todos}     onClick={() => setFilter('todos')} />
          <UI.FilterChip label="Pendente"  active={filter==='pendente'}  count={counts.pendente}  onClick={() => setFilter('pendente')} />
          <UI.FilterChip label="Aprovado"  active={filter==='aprovado'}  count={counts.aprovado}  onClick={() => setFilter('aprovado')} />
          <UI.FilterChip label="Com Erro"  active={filter==='pendencia'} count={counts.pendencia} onClick={() => setFilter('pendencia')} />
        </div>
      </div>

      {/* Table card */}
      <div className="mt-5 overflow-hidden rounded-xl border border-ink-100 bg-white shadow-card">
        <div className="grid grid-cols-[100px_180px_1fr_140px_140px_180px_140px_140px] gap-4 border-b border-ink-100 bg-ink-50 px-6 py-3 text-[11.5px] font-semibold uppercase tracking-wide text-ink-500">
          <div>ID</div>
          <div>Contrato</div>
          <div>Beneficiário</div>
          <div>Valor</div>
          <div>Fase</div>
          <div>Validações</div>
          <div>Status</div>
          <div className="text-right">Ação</div>
        </div>

        {loading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
          : filtered.map((row) => (
              <DisbursementRow key={row.id} row={row} onOpen={onOpenDetail} />
            ))
        }

        {!loading && filtered.length === 0 && (
          <div className="grid place-items-center px-6 py-12 text-center">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-ink-50">
              <Icon.FolderOpen size={20} color="#9EB2BB" />
            </div>
            <div className="mt-3 text-[14px] font-medium text-ink-700">Nenhum desembolso neste filtro</div>
            <div className="mt-1 text-[12.5px] text-ink-500">Tente alterar o filtro acima.</div>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="flex items-center justify-between border-t border-ink-100 bg-white px-6 py-3 text-[12.5px] text-ink-500">
            <span>Mostrando <span className="font-medium text-ink-900">{filtered.length}</span> de <span className="font-medium text-ink-900">{MOCK.DISBURSEMENTS.length}</span> desembolsos</span>
            <div className="flex items-center gap-1">
              <button className="rounded-md p-1.5 hover:bg-ink-50" disabled><Icon.ChevronLeft size={14} color="#9EB2BB" /></button>
              <span className="rounded-md bg-brand-50 px-2 py-0.5 text-[12px] font-medium text-brand-800">1</span>
              <button className="rounded-md p-1.5 hover:bg-ink-50" disabled><Icon.ChevronRight size={14} color="#9EB2BB" /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

window.HomeView = HomeView;
window.StatCard = StatCard;
window.SkeletonRow = SkeletonRow;
window.DisbursementRow = DisbursementRow;
