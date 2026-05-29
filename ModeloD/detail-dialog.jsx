// Detail Dialog — ClickUp task-modal inspired (LIGHT mode, project palette).

const ALL_KEY = '__resumo__';

function PropPill({ label, value, icon, accent }) {
  const Comp = icon && Icon[icon] ? Icon[icon] : Icon.Info;
  return (
    <div className="inline-flex items-center gap-1.5 rounded-md border border-ink-100 bg-white px-2 py-1 text-[11.5px]">
      <Comp size={11} color={accent || '#64747A'} />
      <span className="text-ink-500">{label}</span>
      <span className="font-semibold text-ink-900">{value}</span>
    </div>
  );
}

function MiniStatus({ status, size = 'sm' }) {
  const v = status === 'valido';
  const padding = size === 'lg' ? 'px-2.5 py-1 text-[11.5px]' : 'px-2 py-0.5 text-[10.5px]';
  return (
    <span className={`inline-flex shrink-0 items-center gap-1 rounded-md font-semibold uppercase tracking-wider ${padding} ${v ? 'bg-[#E0F2E7] text-[#1A7A4A]' : 'bg-[#FCE6E3] text-[#9A2A1F]'}`}>
      <span className="h-1 w-1 rounded-full" style={{ backgroundColor: v ? '#1A7A4A' : '#C0392B' }}></span>
      {v ? 'Válido' : 'Inválido'}
    </span>
  );
}

function SidebarItem({ active, status, n, titulo, hasComment, onClick }) {
  const dot = status === 'valido' ? '#1A7A4A' : '#C0392B';
  return (
    <button onClick={onClick}
      className={`relative flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition ${active ? 'bg-brand-50 text-brand-900 shadow-[inset_0_0_0_1px_#A0D2FC]' : 'text-ink-700 hover:bg-white'}`}>
      <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: dot }}></span>
      <span className="w-5 shrink-0 font-mono text-[10.5px] text-ink-500 tabular-nums">{String(n).padStart(2, '0')}</span>
      <span className={`flex-1 truncate text-[12px] leading-tight ${active ? 'font-semibold' : 'font-medium'}`}>{titulo}</span>
      {hasComment && <Icon.MessageSquare size={10} color={active ? '#005CA9' : '#9EB2BB'} />}
    </button>
  );
}

function SidebarGroup({ statusKey, items, comments, selected, onSelect, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  if (items.length === 0) return null;
  const meta = STATUS_META[statusKey === 'invalido' ? 'pendencia' : 'aprovado'];
  const dot = statusKey === 'invalido' ? '#C0392B' : '#1A7A4A';
  const label = statusKey === 'invalido' ? 'Inválidas' : 'Válidas';
  return (
    <div className="mb-2">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center gap-1.5 px-2 py-1 text-left">
        <Icon.ChevronDown size={11} color="#64747A" className={`transition-transform ${open ? '' : '-rotate-90'}`} />
        <span className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider" style={{ backgroundColor: meta.bg, color: meta.fg }}>
          <span className="h-1 w-1 rounded-full" style={{ backgroundColor: dot }}></span>
          {label}
        </span>
        <span className="text-[11px] font-semibold tabular-nums text-ink-500">{items.length}</span>
      </button>
      {open && (
        <div className="mt-0.5 space-y-0.5">
          {items.map((v) => {
            const commentKey = `v${v.n}`;
            const hasComment = !!comments[commentKey] || (v.subitems && v.subitems.some((s) => comments[`v${v.n}-${s.n}`]));
            return <SidebarItem key={v.n} n={v.n} titulo={v.titulo} status={v.status} hasComment={hasComment} active={selected === v.n} onClick={() => onSelect(v.n)} />;
          })}
        </div>
      )}
    </div>
  );
}

function ResumoSidebarItem({ active, onClick }) {
  return (
    <button onClick={onClick}
      className={`relative flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition ${active ? 'bg-brand-50 text-brand-900 shadow-[inset_0_0_0_1px_#A0D2FC]' : 'text-ink-700 hover:bg-white'}`}>
      <Icon.FileText size={12} color={active ? '#005CA9' : '#64747A'} />
      <span className={`text-[12px] ${active ? 'font-semibold' : 'font-medium'}`}>Resumo do contrato</span>
    </button>
  );
}

function PillTypeSelector({ value, onChange }) {
  const types = ['positivo', 'informativo', 'negativo'];
  return (
    <div className="inline-flex items-center gap-1.5">
      {types.map((t) => {
        const c = COMMENT_TYPES[t];
        const active = value === t;
        return (
          <button key={t} type="button" onClick={() => onChange(t)}
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-semibold transition ${active ? 'text-white shadow-sm' : 'border border-ink-100 bg-white text-ink-700 hover:bg-ink-50'}`}
            style={active ? { backgroundColor: c.dot } : {}}>
            <span className="h-1 w-1 rounded-full" style={{ backgroundColor: active ? '#fff' : c.dot }}></span>
            {c.label}
          </button>
        );
      })}
    </div>
  );
}

function InlineComment({ commentKey, savedComment, onSave }) {
  const [tipo, setTipo] = useState(savedComment?.tipo || null);
  const [texto, setTexto] = useState(savedComment?.texto || '');
  const [editing, setEditing] = useState(false);

  if (savedComment && !editing) {
    const c = COMMENT_TYPES[savedComment.tipo];
    return (
      <div className="overflow-hidden rounded-md border border-ink-100 bg-white">
        <div className="flex items-center gap-2 border-b border-ink-100 px-3 py-1.5" style={{ backgroundColor: c.bg + '60' }}>
          <span className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold text-white" style={{ backgroundColor: c.dot }}>{c.label}</span>
          <span className="grid h-4 w-4 place-items-center rounded-full text-[8px] font-bold text-white" style={{ background: 'linear-gradient(135deg,#00437A,#2D8AD8)' }}>{savedComment.autor}</span>
          <span className="text-[10.5px] text-ink-500">{savedComment.autor} · {savedComment.timestamp}</span>
          <button onClick={() => { setTipo(savedComment.tipo); setTexto(savedComment.texto); setEditing(true); }}
            className="ml-auto inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10.5px] font-medium text-brand-700 hover:bg-white">
            <Icon.Edit3 size={10} color="#005CA9" />
            Editar
          </button>
        </div>
        <p className="px-3 py-2 text-[12.5px] leading-relaxed text-ink-900">{savedComment.texto}</p>
      </div>
    );
  }

  const canSave = tipo && texto.trim().length > 0;

  return (
    <div className="rounded-md border border-ink-100 bg-white focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-50 transition">
      <textarea value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Descreva a tratativa ou observação..." rows={2}
        className="block w-full resize-none rounded-t-md bg-transparent px-3 pt-2 pb-1 text-[12.5px] leading-relaxed text-ink-900 placeholder:text-ink-300 focus:outline-none" />
      <div className="flex items-center justify-between gap-2 border-t border-ink-100 bg-[#FAFBFD] px-2 py-1.5">
        <PillTypeSelector value={tipo} onChange={setTipo} />
        <div className="flex items-center gap-1">
          {editing && <button onClick={() => setEditing(false)} className="rounded-md px-2 py-1 text-[11px] font-medium text-ink-500 hover:bg-white">Cancelar</button>}
          <button onClick={() => { if (!canSave) return; onSave({ tipo, texto: texto.trim(), autor: 'KS', timestamp: new Date().toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(',', ' às') }); setEditing(false); }}
            disabled={!canSave}
            className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-semibold transition ${canSave ? 'bg-brand-700 text-white hover:bg-brand-800 shadow-sm' : 'bg-ink-100 text-ink-300 cursor-not-allowed'}`}>
            <Icon.Check size={11} strokeWidth={2.6} />
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}

function SubValidationCard({ sub, commentKey, comments, onSaveComment }) {
  const [open, setOpen] = useState(sub.status === 'invalido');
  const dot = sub.status === 'invalido' ? '#C0392B' : '#1A7A4A';
  return (
    <div className="overflow-hidden rounded-md border border-ink-100 bg-white">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-[#FAFBFD]">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: dot }}></span>
        <span className="w-7 shrink-0 font-mono text-[10.5px] font-semibold text-ink-500">{sub.n}</span>
        <span className="flex-1 truncate text-[12px] font-medium text-ink-900">{sub.titulo}</span>
        {comments[commentKey] && <Icon.MessageSquare size={10} color="#64747A" />}
        <MiniStatus status={sub.status} />
        <Icon.ChevronDown size={12} color="#9EB2BB" className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <div className={`acc-body ${open ? 'open' : ''}`}>
        <div className="acc-inner">
          <div className="border-t border-ink-100 bg-[#FAFBFD] px-3 py-2.5 space-y-2">
            <p className="text-[12px] leading-relaxed text-ink-700">{sub.detalhe}</p>
            <InlineComment commentKey={commentKey} savedComment={comments[commentKey]} onSave={(c) => onSaveComment(commentKey, c)} />
          </div>
        </div>
      </div>
    </div>
  );
}

function ValidationDetailPanel({ v, comments, onSaveComment }) {
  const commentKey = `v${v.n}`;
  const hasSubs = v.subitems && v.subitems.length > 0;
  const isInvalid = v.status === 'invalido';
  return (
    <div>
      <div className="flex items-center gap-2.5 pb-3 border-b border-ink-100">
        <span className="grid h-7 w-7 place-items-center rounded-md font-mono text-[10.5px] font-bold tabular-nums text-white" style={{ backgroundColor: isInvalid ? '#C0392B' : '#005CA9' }}>{String(v.n).padStart(2, '0')}</span>
        <h3 className="flex-1 text-[15.5px] font-semibold leading-tight tracking-tight text-ink-900 truncate">{v.titulo}</h3>
        <MiniStatus status={v.status} size="lg" />
      </div>
      <p className="mt-3 text-[12.5px] leading-relaxed text-ink-700">{v.detalhe}</p>
      {hasSubs ? (
        <div className="mt-5">
          <div className="mb-2 flex items-baseline justify-between text-[10.5px]">
            <span className="font-bold uppercase tracking-wider text-ink-500">Sub-validações</span>
            <span className="text-ink-500 tabular-nums">{v.subitems.filter((s) => s.status === 'valido').length}/{v.subitems.length} válidas</span>
          </div>
          <div className="space-y-1.5">
            {v.subitems.map((sub) => (<SubValidationCard key={sub.n} sub={sub} commentKey={`v${v.n}-${sub.n}`} comments={comments} onSaveComment={onSaveComment} />))}
          </div>
        </div>
      ) : (
        <div className="mt-5">
          <div className="mb-2 text-[10.5px] font-bold uppercase tracking-wider text-ink-500">Tratativa</div>
          <InlineComment commentKey={commentKey} savedComment={comments[commentKey]} onSave={(c) => onSaveComment(commentKey, c)} />
        </div>
      )}
    </div>
  );
}

function ResumoRow({ label, value, mono, accent }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <dt className="text-[11px] text-ink-500">{label}</dt>
      <dd className={`text-[12px] ${accent ? 'font-semibold text-brand-800' : 'font-medium text-ink-900'} ${mono ? 'font-mono tabular-nums' : ''}`}>{value}</dd>
    </div>
  );
}

function ResumoCard({ title, icon, children }) {
  const Comp = Icon[icon] || Icon.FileText;
  return (
    <div className="overflow-hidden rounded-md border border-ink-100 bg-white">
      <div className="flex items-center gap-2 border-b border-ink-100 bg-[#FAFBFD] px-3 py-2">
        <Comp size={12} color="#005CA9" />
        <span className="text-[11.5px] font-semibold text-ink-900 uppercase tracking-wide">{title}</span>
      </div>
      <dl className="divide-y divide-ink-100 px-3 py-0.5">{children}</dl>
    </div>
  );
}

function ResumoPanel({ comments }) {
  const c = MOCK.CONTRACT_DSB001;
  const commented = Object.keys(comments).filter((k) => comments[k]).slice(0, 3);
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        <ResumoCard title="Beneficiário" icon="User">
          <ResumoRow label="Contrato" value={c.contrato} mono accent />
          <ResumoRow label="Beneficiário" value={c.beneficiario.nome} />
          <ResumoRow label="CPF" value={c.beneficiario.cpf} mono />
          <ResumoRow label="Nascimento" value={c.beneficiario.nascimento} mono />
          <ResumoRow label="Renda Mensal" value={MOCK.BRL(c.beneficiario.renda)} mono />
          <ResumoRow label="Telefone" value={c.beneficiario.telefone} mono />
        </ResumoCard>
        <ResumoCard title="Financiamento" icon="Landmark">
          <ResumoRow label="Programa" value={c.financiamento.programa} />
          <ResumoRow label="Valor do Imóvel" value={MOCK.BRL(c.financiamento.valorImovel)} mono />
          <ResumoRow label="Financiamento" value={MOCK.BRL(c.financiamento.valorFinanciamento)} mono accent />
          <ResumoRow label="Nº Desembolso · Fase" value={`${c.financiamento.numeroDesembolso} · ${c.financiamento.fase}`} />
          <ResumoRow label="% Obra Atual" value={
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-20 overflow-hidden rounded-full bg-ink-100"><div className="h-full rounded-full bg-brand-700" style={{ width: `${c.financiamento.pctObra}%` }}></div></div>
              <span className="font-medium tabular-nums text-ink-900">{c.financiamento.pctObra}%</span>
            </div>
          } />
          <ResumoRow label="Amortização" value={c.financiamento.amortizacao} mono />
        </ResumoCard>
      </div>
      {commented.length > 0 && (
        <div>
          <div className="mb-2 text-[10.5px] font-bold uppercase tracking-wider text-ink-500">Tratativas recentes</div>
          <div className="space-y-1.5">
            {commented.map((key) => {
              const cmt = comments[key];
              const cm = COMMENT_TYPES[cmt.tipo];
              return (
                <div key={key} className="flex items-start gap-2 rounded-md border border-ink-100 bg-white px-3 py-2">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full text-[9px] font-bold text-white" style={{ background: 'linear-gradient(135deg,#00437A,#2D8AD8)' }}>{cmt.autor}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9.5px] font-semibold text-white" style={{ backgroundColor: cm.dot }}>{cm.label}</span>
                      <span className="font-mono text-[10.5px] text-ink-500">{key}</span>
                      <span className="ml-auto text-[10.5px] text-ink-500">{cmt.timestamp}</span>
                    </div>
                    <p className="mt-0.5 text-[12px] text-ink-700 line-clamp-2">{cmt.texto}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function DetailDialog({ id, onClose, allRows, onNavigate }) {
  const c = MOCK.CONTRACT_DSB001;
  const row = MOCK.DISBURSEMENTS.find((r) => r.id === id);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  const [comments, setComments] = useState(() => {
    const obj = {};
    MOCK.VALIDATIONS.forEach((v) => { if (v.prefilledComment) obj[`v${v.n}`] = v.prefilledComment; });
    return obj;
  });
  const saveComment = (key, c) => setComments((p) => ({ ...p, [key]: c }));

  const firstInvalid = MOCK.VALIDATIONS.find((v) => v.status === 'invalido');
  const [selected, setSelected] = useState(firstInvalid ? firstInvalid.n : ALL_KEY);

  useEffect(() => { setSelected(firstInvalid ? firstInvalid.n : ALL_KEY); }, [id]);

  const validCount = MOCK.VALIDATIONS.filter((v) => v.status === 'valido').length;
  const total = MOCK.VALIDATIONS.length;
  const pct = (validCount / total) * 100;
  const overallStatus = MOCK.VALIDATIONS.some((v) => v.status === 'invalido') ? 'pendencia' : validCount === total ? 'aprovado' : 'pendente';

  const idx = allRows.findIndex((r) => r.id === id);
  const prevId = idx > 0 ? allRows[idx - 1].id : null;
  const nextId = idx >= 0 && idx < allRows.length - 1 ? allRows[idx + 1].id : null;

  const invalids = MOCK.VALIDATIONS.filter((v) => v.status === 'invalido');
  const validos  = MOCK.VALIDATIONS.filter((v) => v.status === 'valido');

  const goNextInvalid = () => {
    const curIdx = invalids.findIndex((v) => v.n === selected);
    const nextIdx = (curIdx + 1) % invalids.length;
    setSelected(invalids[nextIdx].n);
  };

  const selectedV = typeof selected === 'number' ? MOCK.VALIDATIONS.find((v) => v.n === selected) : null;
  const ovMeta = STATUS_META[overallStatus];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-4" style={{ animation: 'fadeIn 200ms ease-out' }} role="dialog" aria-modal="true">
      <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } } @keyframes popIn { from { opacity: 0; transform: translateY(8px) scale(0.985); } to { opacity: 1; transform: translateY(0) scale(1); } }`}</style>
      <div onClick={onClose} className="absolute inset-0 bg-ink-900/50 backdrop-blur-[2px]"></div>
      <div className="relative flex h-full max-h-[900px] w-full max-w-[1240px] flex-col overflow-hidden rounded-xl bg-white shadow-pop" style={{ animation: 'popIn 240ms cubic-bezier(.22,.61,.36,1) both' }}>
        <div className="flex items-center gap-2 border-b border-ink-100 px-5 py-2">
          <div className="flex items-center gap-1.5 text-[11.5px] text-ink-500">
            <Icon.Folder size={11} color="#64747A" /><span>Macro Diária</span>
            <Icon.ChevronRight size={10} color="#9EB2BB" /><span>Ciclo 14/05/2025</span>
            <Icon.ChevronRight size={10} color="#9EB2BB" />
            <span className="font-mono font-semibold text-ink-700">{row?.id || id}</span>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <div className="flex items-center gap-0.5 rounded-md border border-ink-100 p-0.5">
              <button onClick={() => prevId && onNavigate(prevId)} disabled={!prevId} className="grid h-6 w-6 place-items-center rounded hover:bg-ink-50 disabled:opacity-30 disabled:hover:bg-transparent"><Icon.ChevronLeft size={12} color="#404B52" /></button>
              <span className="px-1.5 text-[10.5px] font-semibold tabular-nums text-ink-700">{idx + 1}/{allRows.length}</span>
              <button onClick={() => nextId && onNavigate(nextId)} disabled={!nextId} className="grid h-6 w-6 place-items-center rounded hover:bg-ink-50 disabled:opacity-30 disabled:hover:bg-transparent"><Icon.ChevronRight size={12} color="#404B52" /></button>
            </div>
            <button onClick={onClose} className="grid h-7 w-7 place-items-center rounded-md border border-ink-100 hover:bg-ink-50"><Icon.X size={13} color="#404B52" /></button>
          </div>
        </div>

        <div className="border-b border-ink-100 px-6 pt-4 pb-3">
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-bold uppercase tracking-wider shadow-sm" style={{ backgroundColor: ovMeta.bg, color: ovMeta.fg }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: ovMeta.dot }}></span>
              {ovMeta.label}<Icon.ChevronDown size={11} color={ovMeta.fg} />
            </button>
            <span className="text-[11.5px] text-ink-500">· {validCount}/{total} validações OK</span>
          </div>
          <h2 className="mt-2.5 text-[22px] font-semibold leading-tight tracking-tight text-ink-900">{c.beneficiario.nome}</h2>
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <PropPill label="Contrato" value={c.contrato} icon="Hash" accent="#005CA9" />
            <PropPill label="Programa" value={c.financiamento.programa} icon="Landmark" accent="#005CA9" />
            <PropPill label="Fase" value={c.financiamento.fase} icon="Flag" accent="#005CA9" />
            <PropPill label="Desembolso" value={c.financiamento.numeroDesembolso} icon="ListChecks" accent="#005CA9" />
            <PropPill label="Valor" value={MOCK.BRL(row?.valor || 45000)} icon="Wallet" accent="#005CA9" />
          </div>
        </div>

        <div className="flex items-center gap-3 border-b border-ink-100 bg-[#FAFBFD] px-6 py-2">
          <div className="text-[11px] font-bold tabular-nums uppercase tracking-wider text-ink-500">Progresso</div>
          <div className="text-[12px] font-semibold tabular-nums text-ink-700">{validCount}/{total} válidas</div>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink-100">
            <div className="h-full rounded-full bg-brand-700 transition-all duration-700" style={{ width: `${pct}%` }}></div>
          </div>
          {invalids.length > 0 && (
            <button onClick={goNextInvalid} className="inline-flex items-center gap-1.5 rounded-md border border-[#C0392B]/30 bg-white px-2.5 py-1 text-[11px] font-semibold text-[#9A2A1F] hover:bg-[#FCE6E3]">
              <span className="h-1.5 w-1.5 rounded-full bg-err"></span>
              {invalids.length} inválidas<Icon.ArrowRight size={10} color="#9A2A1F" />
            </button>
          )}
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-[280px_1fr]">
          <aside className="overflow-y-auto border-r border-ink-100 bg-[#F8FAFC]">
            <div className="space-y-0.5 p-2">
              <ResumoSidebarItem active={selected === ALL_KEY} onClick={() => setSelected(ALL_KEY)} />
              <div className="px-2 pb-1 pt-2.5 text-[9.5px] font-bold uppercase tracking-wider text-ink-500">Validações da Macro</div>
              <SidebarGroup statusKey="invalido" items={invalids} comments={comments} selected={selected} onSelect={setSelected} defaultOpen={true} />
              <SidebarGroup statusKey="valido" items={validos} comments={comments} selected={selected} onSelect={setSelected} defaultOpen={false} />
            </div>
          </aside>
          <section className="overflow-y-auto bg-white">
            <div className="px-6 py-5">
              {selected === ALL_KEY ? <ResumoPanel comments={comments} /> : selectedV ? <ValidationDetailPanel v={selectedV} comments={comments} onSaveComment={saveComment} /> : null}
            </div>
          </section>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-ink-100 bg-white px-6 py-2.5">
          <div className="flex items-center gap-1.5 text-[10.5px] text-ink-500">
            <kbd className="rounded border border-ink-100 bg-ink-50 px-1.5 py-0.5 font-mono">Esc</kbd><span>fechar</span>
            <span className="text-ink-300 mx-1">·</span>
            <kbd className="rounded border border-ink-100 bg-ink-50 px-1.5 py-0.5 font-mono">←</kbd>
            <kbd className="rounded border border-ink-100 bg-ink-50 px-1.5 py-0.5 font-mono">→</kbd>
            <span>trocar contrato</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="rounded-md border border-ink-100 bg-white px-3 py-1.5 text-[11.5px] font-medium text-ink-700 hover:bg-ink-50">Salvar rascunho</button>
            <button className="rounded-md border border-err/30 bg-white px-3 py-1.5 text-[11.5px] font-semibold text-err hover:bg-[#FCE6E3]">Recusar</button>
            <button className="rounded-md bg-brand-700 px-3.5 py-1.5 text-[11.5px] font-semibold text-white shadow-sm hover:bg-brand-800">Aprovar desembolso</button>
          </div>
        </div>
      </div>
    </div>
  );
}

window.DetailDialog = DetailDialog;
window.InlineComment = InlineComment;
