// Home 2 — ClickUp-inspired list view, NO left sidebar.
// Top: dark-blue hero ("Pronto para começar / Inicie a próxima análise do ciclo").
// Below: breadcrumb, view tabs, toolbar, stats strip, grouped-by-status list.

const STATUS_META = {
  pendencia: { label: 'Com Pendência', dot: '#C0392B', bg: '#FCE6E3', fg: '#9A2A1F' },
  pendente:  { label: 'Pendente',      dot: '#D87B00', bg: '#FFEFD6', fg: '#663A00' },
  aprovado:  { label: 'Aprovado',      dot: '#1A7A4A', bg: '#E0F2E7', fg: '#1A7A4A' },
};

function DarkHero({ runMacro, processing, lastRun }) {
  return (
    <section className="border-b border-ink-100 bg-white">
      <div className="mx-auto max-w-[1400px] px-6 pt-8 pb-10">
        <div className="overflow-hidden rounded-2xl bg-brand-900 px-8 py-9 text-white lg:px-12 lg:py-11">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-brand-200">
                <span className="grid h-4 w-4 place-items-center rounded-full bg-brand-200/20"><Icon.Sparkles size={10} color="#A0D2FC" /></span>
                Pronto para começar
              </div>
              <h1 className="mt-3 text-[36px] font-semibold leading-[1.1] tracking-tight lg:text-[40px]">Inicie a próxima análise do ciclo.</h1>
              <p className="mt-3 max-w-xl text-[13.5px] leading-relaxed text-white/70">A macro processará todos os contratos abertos do dia. Você revisa apenas o necessário e libera com segurança.</p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button onClick={runMacro} disabled={processing}
                  className={`inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-[13px] font-semibold text-brand-900 shadow-sm transition hover:bg-brand-50 ${processing ? 'cursor-wait opacity-80' : ''}`}>
                  {processing ? <><Icon.Loader size={13} className="spinner" />Processando...</> : <><Icon.Play size={12} />Iniciar nova análise</>}
                </button>
                <button className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/[0.04] px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-white/10">
                  <Icon.FileText size={12} color="#fff" />
                  Ver documentação
                </button>
                {lastRun && !processing && (
                  <span className="inline-flex items-center gap-2 text-[11.5px] text-white/60">
                    <Icon.Check size={11} color="#4ADE80" strokeWidth={2.6} />
                    <span>Última: <span className="font-medium text-white/85">{lastRun}</span></span>
                  </span>
                )}
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-200">SLA da macro</div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-[40px] font-semibold leading-none tabular-nums tracking-tight">2.3s</span>
                <span className="text-[11.5px] text-white/55">tempo médio</span>
              </div>
              <div className="mt-4 space-y-2 text-[12px]">
                <div className="flex items-center justify-between gap-2"><span className="text-white/55">Macros executadas hoje</span><span className="font-semibold tabular-nums text-white">128</span></div>
                <div className="flex items-center justify-between gap-2"><span className="text-white/55">Validações processadas</span><span className="font-semibold tabular-nums text-white">7.680</span></div>
                <div className="flex items-center justify-between gap-2"><span className="text-white/55">Conformidade do dia</span><span className="font-semibold tabular-nums text-white">99.1%</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function GroupHeader({ status, count, open, onToggle }) {
  const meta = STATUS_META[status];
  return (
    <button onClick={onToggle} className="group flex w-full items-center gap-2 py-2 text-left">
      <Icon.ChevronDown size={14} color="#64747A" className={`transition-transform ${open ? '' : '-rotate-90'}`} />
      <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11.5px] font-bold uppercase tracking-wider" style={{ backgroundColor: meta.bg, color: meta.fg }}>
        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: meta.dot }}></span>
        {meta.label}
      </span>
      <span className="text-[12px] font-semibold tabular-nums text-ink-700">{count}</span>
      <span className="ml-1 hidden text-[11.5px] text-ink-500 group-hover:inline">+ adicionar contrato</span>
    </button>
  );
}

function ContractRow({ row, onOpen }) {
  const initials = row.beneficiario.split(' ').map((p) => p[0]).slice(0, 2).join('');
  const ratio = row.validacoes.ok / row.validacoes.total;
  return (
    <div role="button" onClick={() => onOpen(row.id)}
      className="group grid cursor-pointer grid-cols-[24px_110px_minmax(160px,1fr)_120px_120px_150px_130px_36px] items-center gap-3 border-t border-ink-100 px-2 py-2 text-[12.5px] transition hover:bg-[#F4F8FD]">
      <div className="flex items-center justify-center"><Icon.CircleDot size={13} color={STATUS_META[row.status].dot} strokeWidth={2.4} /></div>
      <div className="font-mono text-[11.5px] font-semibold text-brand-800">{row.id}</div>
      <div className="flex min-w-0 items-center gap-2.5">
        <div className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-[10px] font-semibold text-white" style={{ background: 'linear-gradient(135deg,#64747A,#9EB2BB)' }}>{initials}</div>
        <div className="min-w-0">
          <div className="truncate font-medium text-ink-900">{row.beneficiario}</div>
          <div className="truncate font-mono text-[10.5px] text-ink-500">{row.contrato}</div>
        </div>
      </div>
      <div className="tabular-nums font-semibold text-ink-900">{MOCK.BRL(row.valor)}</div>
      <div className="inline-flex items-center gap-1.5 text-[11.5px] text-ink-700"><Icon.Flag size={11} color="#64747A" />{row.fase}</div>
      <div className="flex items-center gap-2">
        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-ink-100"><div className="h-full rounded-full bg-brand-700" style={{ width: `${ratio*100}%` }}></div></div>
        <span className="inline-flex items-center rounded-md bg-brand-50 px-1.5 py-0.5 text-[10.5px] font-semibold tabular-nums text-brand-800">{row.validacoes.ok}/{row.validacoes.total}</span>
      </div>
      <div>
        <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide" style={{ backgroundColor: STATUS_META[row.status].bg, color: STATUS_META[row.status].fg }}>
          <span className="h-1 w-1 rounded-full" style={{ backgroundColor: STATUS_META[row.status].dot }}></span>
          {STATUS_META[row.status].label}
        </span>
      </div>
      <div className="flex items-center justify-end">
        <span className="grid h-7 w-7 place-items-center rounded-md text-ink-500 opacity-0 group-hover:opacity-100 group-hover:bg-white group-hover:text-brand-700"><Icon.ExternalLink size={13} /></span>
      </div>
    </div>
  );
}

function ColumnsHeader() {
  return (
    <div className="grid grid-cols-[24px_110px_minmax(160px,1fr)_120px_120px_150px_130px_36px] gap-3 px-2 py-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-ink-500">
      <div></div><div>ID</div><div>Beneficiário</div><div>Valor</div><div>Fase</div><div>Validações</div><div>Status</div><div></div>
    </div>
  );
}

function StatsStrip({ counts }) {
  const items = [
    { label: 'Total',         value: counts.todos,     dot: '#005CA9' },
    { label: 'Pendente',      value: counts.pendente,  dot: '#D87B00' },
    { label: 'Com Pendência', value: counts.pendencia, dot: '#C0392B' },
    { label: 'Aprovado',      value: counts.aprovado,  dot: '#1A7A4A' },
  ];
  return (
    <div className="flex items-stretch divide-x divide-ink-100 overflow-hidden rounded-xl border border-ink-100 bg-white shadow-card">
      {items.map((it) => (
        <div key={it.label} className="flex-1 px-5 py-3">
          <div className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wider text-ink-500">
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: it.dot }}></span>
            {it.label}
          </div>
          <div className="mt-1.5 text-[24px] font-semibold leading-none tabular-nums tracking-tight text-ink-900">{it.value}</div>
        </div>
      ))}
    </div>
  );
}

function Home2View({ loading, runMacro, lastRun, processing }) {
  const [filter, setFilter] = useState('todos');
  const [dialogId, setDialogId] = useState(null);
  const [view, setView] = useState('lista');
  const [openGroups, setOpenGroups] = useState({ pendencia: true, pendente: true, aprovado: true });

  useEffect(() => {
    const prev = document.body.style.background;
    document.body.style.background = '#FFFFFF';
    return () => { document.body.style.background = prev; };
  }, []);

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

  const grouped = useMemo(() => {
    const g = { pendencia: [], pendente: [], aprovado: [] };
    filtered.forEach((d) => g[d.status].push(d));
    return g;
  }, [filtered]);

  useEffect(() => {
    if (!dialogId) return;
    const onKey = (e) => {
      if (e.key === 'Escape') { setDialogId(null); return; }
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        const idx = filtered.findIndex((d) => d.id === dialogId);
        if (idx >= 0 && idx < filtered.length - 1) setDialogId(filtered[idx + 1].id);
      }
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        const idx = filtered.findIndex((d) => d.id === dialogId);
        if (idx > 0) setDialogId(filtered[idx - 1].id);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [dialogId, filtered]);

  const viewTab = (key, label, icon) => {
    const active = view === key;
    const IconComp = Icon[icon] || Icon.LayoutGrid;
    return (
      <button onClick={() => setView(key)}
        className={`relative inline-flex items-center gap-1.5 px-2.5 py-2.5 text-[12.5px] font-medium transition ${active ? 'text-brand-800' : 'text-ink-700 hover:text-ink-900'}`}>
        <IconComp size={13} color={active ? '#005CA9' : '#64747A'} />
        {label}
        {active && <span className="absolute inset-x-1 -bottom-px h-[2px] rounded-t-full bg-brand-700"></span>}
      </button>
    );
  };

  return (
    <div data-screen-label="Home2 Dashboard (Dialog)">
      <DarkHero runMacro={runMacro} processing={processing} lastRun={lastRun} />
      <div className="mx-auto max-w-[1400px]">
        <div className="flex items-center gap-3 border-b border-ink-100 px-6 py-3">
          <div className="flex items-center gap-1.5 text-[12.5px] text-ink-500">
            <Icon.Folder size={13} color="#64747A" />
            <span>Espaço · Desembolsos</span>
            <Icon.ChevronRight size={11} color="#9EB2BB" />
            <span>Macro Diária</span>
            <Icon.ChevronRight size={11} color="#9EB2BB" />
            <span className="font-semibold text-ink-900">Ciclo 14/05/2025</span>
            <button className="ml-1 grid h-5 w-5 place-items-center rounded-md text-ink-300 hover:bg-ink-50 hover:text-amber-500"><Icon.Star size={12} /></button>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button className="inline-flex items-center gap-1.5 rounded-md border border-ink-100 bg-white px-3 py-1.5 text-[12px] font-medium text-ink-700 hover:bg-ink-50"><Icon.Sparkles size={12} color="#A65E00" />Automatizar</button>
            <button className="inline-flex items-center gap-1.5 rounded-md border border-ink-100 bg-white px-3 py-1.5 text-[12px] font-medium text-ink-700 hover:bg-ink-50"><Icon.Download size={12} color="#404B52" />Compartilhar</button>
          </div>
        </div>
        <div className="flex items-center gap-1 border-b border-ink-100 px-6">
          {viewTab('lista', 'Lista', 'ListChecks')}
          {viewTab('kanban', 'Quadro', 'Kanban')}
          {viewTab('calendario', 'Calendário', 'CalendarDays')}
          {viewTab('tabela', 'Tabela', 'Table2')}
          <button className="ml-2 inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11.5px] font-medium text-ink-500 hover:bg-ink-50 hover:text-ink-700"><Icon.Plus size={11} />Visualização</button>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 border-b border-ink-100 px-6 py-2.5">
          <button className="inline-flex items-center gap-1.5 rounded-md bg-brand-50 px-2.5 py-1 text-[11.5px] font-semibold text-brand-800"><Icon.LayoutGrid size={11} color="#005CA9" />Grupo: Status</button>
          <button className="inline-flex items-center gap-1.5 rounded-md border border-ink-100 bg-white px-2.5 py-1 text-[11.5px] font-medium text-ink-700 hover:bg-ink-50"><Icon.ChevronsUpDown size={11} color="#64747A" />Subtarefas</button>
          <button className="inline-flex items-center gap-1.5 rounded-md border border-ink-100 bg-white px-2.5 py-1 text-[11.5px] font-medium text-ink-700 hover:bg-ink-50"><Icon.Eye size={11} color="#64747A" />Colunas</button>
          <span className="mx-1 h-4 w-px bg-ink-100"></span>
          <button className="inline-flex items-center gap-1.5 rounded-md border border-ink-100 bg-white px-2.5 py-1 text-[11.5px] font-medium text-ink-700 hover:bg-ink-50"><Icon.Filter size={11} color="#64747A" />Filtro</button>
          <button className="inline-flex items-center gap-1.5 rounded-md border border-ink-100 bg-white px-2.5 py-1 text-[11.5px] font-medium text-ink-700 hover:bg-ink-50"><Icon.User size={11} color="#64747A" />Responsável</button>
          <button className="inline-flex items-center gap-1.5 rounded-md border border-ink-100 bg-white px-2.5 py-1 text-[11.5px] font-medium text-ink-700 hover:bg-ink-50"><Icon.CheckCircle size={11} color="#64747A" />Fechado</button>
          <div className="ml-auto flex items-center gap-1.5">
            <div className="flex items-center gap-1.5 rounded-md border border-ink-100 bg-white px-2 py-1 text-[11.5px] text-ink-500">
              <Icon.Search size={11} color="#64747A" />
              <input type="text" placeholder="Buscar contrato..." className="w-44 bg-transparent placeholder:text-ink-300 focus:outline-none" />
            </div>
            <button className="inline-flex items-center gap-1.5 rounded-md border border-ink-100 bg-white px-2.5 py-1 text-[11.5px] font-medium text-ink-700 hover:bg-ink-50"><Icon.Settings size={11} color="#64747A" />Personalizar</button>
            <button className="inline-flex items-center gap-1.5 rounded-md bg-brand-700 px-2.5 py-1 text-[11.5px] font-semibold text-white shadow-sm hover:bg-brand-800"><Icon.Plus size={11} />Add Contrato</button>
          </div>
        </div>
        <div className="px-6 py-5">
          <StatsStrip counts={counts} />
          {view === 'lista' ? (
            <div className="mt-5">
              {loading ? (
                <div className="space-y-2">{Array.from({ length: 6 }).map((_, i) => (<div key={i} className="skeleton h-10 w-full"></div>))}</div>
              ) : (
                ['pendencia', 'pendente', 'aprovado'].map((statusKey) => {
                  const group = grouped[statusKey];
                  if (group.length === 0) return null;
                  const open = openGroups[statusKey];
                  const meta = STATUS_META[statusKey];
                  return (
                    <section key={statusKey} className="mb-3">
                      <GroupHeader status={statusKey} count={group.length} open={open} onToggle={() => setOpenGroups((p) => ({ ...p, [statusKey]: !p[statusKey] }))} />
                      {open && (
                        <div className="overflow-hidden rounded-lg border border-ink-100 border-l-[3px] bg-white" style={{ borderLeftColor: meta.dot }}>
                          <div className="bg-[#FAFBFD]"><ColumnsHeader /></div>
                          {group.map((row) => (<ContractRow key={row.id} row={row} onOpen={(id) => setDialogId(id)} />))}
                          <button className="flex w-full items-center gap-2 border-t border-ink-100 px-2 py-1.5 text-left text-[11.5px] font-medium text-ink-500 hover:bg-ink-50 hover:text-brand-700"><Icon.Plus size={12} />Adicionar contrato</button>
                        </div>
                      )}
                    </section>
                  );
                })
              )}
              {!loading && filtered.length === 0 && (
                <div className="grid place-items-center py-16 text-center">
                  <Icon.FolderOpen size={28} color="#9EB2BB" />
                  <div className="mt-3 text-[14px] font-medium text-ink-700">Nenhum contrato encontrado</div>
                  <div className="mt-1 text-[12px] text-ink-500">Tente outro filtro.</div>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-5 grid place-items-center rounded-xl border border-dashed border-ink-200 bg-[#FAFBFD] py-16 text-center">
              <Icon.LayoutGrid size={24} color="#9EB2BB" />
              <div className="mt-2 text-[13px] font-medium text-ink-700">Visualização "{view}" em construção</div>
              <div className="mt-1 text-[12px] text-ink-500">Use a visualização "Lista" por enquanto.</div>
            </div>
          )}
        </div>
      </div>
      {dialogId && (
        <DetailDialog id={dialogId} onClose={() => setDialogId(null)} allRows={filtered} onNavigate={(id) => setDialogId(id)} />
      )}
    </div>
  );
}

window.Home2View = Home2View;
window.STATUS_META = STATUS_META;
