// Home 3 — Home original duplicada, mas rows abrem o DIALOG (não navegam).

function Home3View({ loading, runMacro, lastRun, processing }) {
  const [filter, setFilter] = useState('todos');
  const [dialogId, setDialogId] = useState(null);

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

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-8" data-screen-label="Home3 Dashboard (Dialog)">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[24px] font-semibold leading-tight tracking-tight text-ink-900">Macro de Desembolsos</h1>
          {lastRun && !processing && (
            <div className="mt-1 inline-flex items-center gap-1.5 text-[12px] text-ink-500">
              <Icon.Check size={12} color="#1A7A4A" strokeWidth={2.6} />
              <span>Última execução · <span className="font-medium text-ink-700">{lastRun}</span></span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={runMacro} disabled={processing}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-semibold text-white shadow-sm transition ${processing ? 'bg-brand-500 cursor-wait' : 'bg-brand-700 hover:bg-brand-800'}`}>
            {processing ? <><Icon.Loader size={14} className="spinner" />Processando...</> : <><Icon.Play size={13} />Processar Macro</>}
          </button>
          <button className="inline-flex items-center gap-1.5 rounded-lg border border-ink-100 bg-white px-3 py-2 text-[12.5px] font-medium text-ink-700 hover:bg-ink-50">
            <Icon.Download size={13} color="#404B52" />
            Exportar
          </button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Desembolsos" value="6" sub="No ciclo de 14/05/2025" icon="FolderOpen" accent={{ bg: '#CFE3F8', fg: '#00437A' }} />
        <StatCard label="Aguardando Análise" value="3" sub="Tempo médio: 3h 12m" icon="Clock" accent={{ bg: '#FFEFD6', fg: '#A65E00' }} />
        <StatCard label="Com Pendências" value="2" sub="Requerem tratativa" icon="CircleAlert" accent={{ bg: '#FCE6E3', fg: '#C0392B' }} />
        <StatCard label="Aprovados" value="1" sub="Prontos para liberação" icon="CheckCircle" accent={{ bg: '#E0F2E7', fg: '#1A7A4A' }} />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <UI.FilterChip label="Todos"    active={filter==='todos'}     count={counts.todos}     onClick={() => setFilter('todos')} />
        <UI.FilterChip label="Pendente" active={filter==='pendente'}  count={counts.pendente}  onClick={() => setFilter('pendente')} />
        <UI.FilterChip label="Aprovado" active={filter==='aprovado'}  count={counts.aprovado}  onClick={() => setFilter('aprovado')} />
        <UI.FilterChip label="Com Erro" active={filter==='pendencia'} count={counts.pendencia} onClick={() => setFilter('pendencia')} />
        <span className="ml-auto inline-flex items-center gap-1.5 text-[11.5px] text-ink-500">
          <Icon.LayoutGrid size={11} color="#005CA9" />
          <span>Clique em uma linha para abrir o diálogo · </span>
          <kbd className="rounded border border-ink-100 bg-ink-50 px-1.5 py-0.5 font-mono">←</kbd>
          <kbd className="rounded border border-ink-100 bg-ink-50 px-1.5 py-0.5 font-mono">→</kbd>
          <span>navega</span>
        </span>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-ink-100 bg-white shadow-card">
        <div className="grid grid-cols-[100px_180px_1fr_140px_140px_180px_140px_140px] gap-4 border-b border-ink-100 bg-ink-50 px-6 py-3 text-[11.5px] font-semibold uppercase tracking-wide text-ink-500">
          <div>ID</div><div>Contrato</div><div>Beneficiário</div><div>Valor</div><div>Fase</div><div>Validações</div><div>Status</div><div className="text-right">Ação</div>
        </div>

        {loading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
          : filtered.map((row) => (
              <DisbursementRow key={row.id} row={row} onOpen={(id) => setDialogId(id)} actionLabel="Abrir diálogo" ActionIcon={Icon.ExternalLink} />
            ))
        }

        {!loading && filtered.length === 0 && (
          <div className="grid place-items-center px-6 py-12 text-center">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-ink-50"><Icon.FolderOpen size={20} color="#9EB2BB" /></div>
            <div className="mt-3 text-[14px] font-medium text-ink-700">Nenhum desembolso neste filtro</div>
            <div className="mt-1 text-[12.5px] text-ink-500">Tente alterar o filtro acima.</div>
          </div>
        )}
      </div>

      {dialogId && (
        <DetailDialog id={dialogId} onClose={() => setDialogId(null)} allRows={filtered} onNavigate={(id) => setDialogId(id)} />
      )}
    </div>
  );
}

window.Home3View = Home3View;
