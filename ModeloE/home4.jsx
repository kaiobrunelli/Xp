// Home 4 — "Modo Foco / Triage" — single-contract focused workflow.
// Concept: instead of a list-and-detail, the analyst processes ONE contract at a time
// with a queue strip on top, big centered focus card with interactive validations.
// Inspired by inbox triage tools, with keyboard-first navigation.

const STATUS_DOT = {
  pendencia: '#C0392B',
  pendente:  '#D87B00',
  aprovado:  '#1A7A4A',
};
const STATUS_LABEL = {
  pendencia: 'Com Pendência',
  pendente:  'Pendente',
  aprovado:  'Aprovado',
};

function Home4View({ loading }) {
  const allRows = MOCK.DISBURSEMENTS;
  const [activeIdx, setActiveIdx] = useState(0);
  const [selectedV, setSelectedV] = useState(null); // selected validation n
  const [processed, setProcessed] = useState({}); // {DSB-XXX: 'approved' | 'refused' | 'skipped'}
  const [comments, setComments] = useState(() => {
    const obj = {};
    MOCK.VALIDATIONS.forEach((v) => {
      if (v.prefilledComment) obj[`v${v.n}`] = v.prefilledComment;
    });
    return obj;
  });
  const saveComment = (key, c) => setComments((p) => ({ ...p, [key]: c }));

  // Light bg for this mode
  useEffect(() => {
    const prev = document.body.style.background;
    document.body.style.background = '#F4F6FB';
    return () => { document.body.style.background = prev; };
  }, []);

  const active = allRows[activeIdx];
  const isLast = activeIdx === allRows.length - 1;

  // Auto-focus first invalid validation when contract changes
  useEffect(() => {
    const firstInvalid = MOCK.VALIDATIONS.find((v) => v.status === 'invalido');
    setSelectedV(firstInvalid ? firstInvalid.n : null);
  }, [activeIdx]);

  // Keyboard nav
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;
      if (e.key === 'j' || e.key === 'ArrowRight') goNext();
      if (e.key === 'k' || e.key === 'ArrowLeft')  goPrev();
      if (e.key === 'a') decide('approved');
      if (e.key === 'r') decide('refused');
      if (e.key === 's') decide('skipped');
      // 1-9 jump to validation
      if (/^[1-9]$/.test(e.key)) setSelectedV(parseInt(e.key, 10));
      if (e.key === '0') setSelectedV(10);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIdx]);

  const goNext = () => setActiveIdx((i) => Math.min(i + 1, allRows.length - 1));
  const goPrev = () => setActiveIdx((i) => Math.max(i - 1, 0));
  const decide = (verdict) => {
    setProcessed((p) => ({ ...p, [active.id]: verdict }));
    if (!isLast) setTimeout(goNext, 250);
  };

  const processedCount = Object.keys(processed).length;
  const dayProgress = (processedCount / allRows.length) * 100;

  return (
    <div className="min-h-[calc(100vh-56px)]" data-screen-label="Home4 Focus Triage">
      {/* Progress bar — sticky on top, full width */}
      <div className="border-b border-ink-100 bg-white">
        <div className="mx-auto flex max-w-[1400px] items-center gap-4 px-6 py-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-700 px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wider text-white">
              <Icon.Sparkles size={10} color="#fff" />
              Modo Foco
            </span>
            <span className="text-[12px] text-ink-500">
              Análise um a um · processamento dirigido
            </span>
          </div>

          <div className="ml-auto flex items-center gap-5 text-[12px]">
            <div className="flex items-center gap-2">
              <span className="text-ink-500">Hoje</span>
              <span className="font-semibold tabular-nums text-ink-900">{processedCount}/{allRows.length}</span>
            </div>
            <div className="h-1.5 w-40 overflow-hidden rounded-full bg-ink-100">
              <div className="h-full rounded-full bg-brand-700 transition-all duration-500"
                   style={{ width: `${dayProgress}%` }}></div>
            </div>
            <span className="text-ink-500">·</span>
            <span className="inline-flex items-center gap-1.5 text-ink-500">
              <Icon.Clock size={11} color="#64747A" />
              Tempo médio: <span className="font-medium text-ink-700">4m 32s</span>
            </span>
          </div>
        </div>
      </div>

      {/* Queue strip — contracts as scrolling chips */}
      <QueueStrip
        rows={allRows}
        activeIdx={activeIdx}
        processed={processed}
        onSelect={setActiveIdx}
      />

      {/* Focus area */}
      <div className="mx-auto grid max-w-[1400px] grid-cols-[1fr_320px] gap-6 px-6 py-8">
        <FocusCard
          row={active}
          activeIdx={activeIdx}
          total={allRows.length}
          selectedV={selectedV}
          setSelectedV={setSelectedV}
          comments={comments}
          saveComment={saveComment}
          decision={processed[active.id]}
        />
        <SidePanel
          row={active}
          decision={processed[active.id]}
          onDecide={decide}
          onPrev={goPrev}
          onNext={goNext}
          isLast={isLast}
          canPrev={activeIdx > 0}
        />
      </div>
    </div>
  );
}

// ====== Queue strip ======
function QueueStrip({ rows, activeIdx, processed, onSelect }) {
  return (
    <div className="border-b border-ink-100 bg-white">
      <div className="mx-auto flex max-w-[1400px] items-center gap-2 overflow-x-auto px-6 py-3">
        <span className="shrink-0 text-[10.5px] font-bold uppercase tracking-wider text-ink-500">
          Fila ·
        </span>
        {rows.map((row, i) => {
          const active = i === activeIdx;
          const isDone = processed[row.id];
          const verdict = processed[row.id];
          const verdictIcon = verdict === 'approved' ? Icon.Check : verdict === 'refused' ? Icon.X : Icon.Slash;
          const verdictColor = verdict === 'approved' ? '#1A7A4A' : verdict === 'refused' ? '#C0392B' : '#64747A';
          return (
            <button
              key={row.id}
              onClick={() => onSelect(i)}
              className={`group relative flex shrink-0 items-center gap-2 rounded-lg border px-3 py-1.5 transition ${
                active
                  ? 'border-brand-700 bg-brand-50 shadow-[0_0_0_1px_#005CA9]'
                  : isDone
                    ? 'border-ink-100 bg-ink-50/60 opacity-70'
                    : 'border-ink-100 bg-white hover:border-ink-200'
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: STATUS_DOT[row.status] }}></span>
              <span className="font-mono text-[10.5px] font-bold text-brand-800">{row.id}</span>
              <span className={`text-[11px] ${active ? 'font-semibold text-ink-900' : 'text-ink-700'}`}>
                {row.beneficiario.split(' ').slice(0, 2).join(' ')}
              </span>
              {isDone && (
                <span className="ml-1 grid h-4 w-4 place-items-center rounded-full" style={{ backgroundColor: verdictColor + '20' }}>
                  {React.createElement(verdictIcon, { size: 10, color: verdictColor, strokeWidth: 2.6 })}
                </span>
              )}
              {active && (
                <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-[9px] font-bold uppercase tracking-wider text-brand-700">
                  ▼ ATUAL
                </span>
              )}
            </button>
          );
        })}
        <span className="ml-auto shrink-0 inline-flex items-center gap-1.5 text-[11px] text-ink-500">
          <kbd className="rounded border border-ink-100 bg-ink-50 px-1.5 py-0.5 font-mono">J</kbd>
          <kbd className="rounded border border-ink-100 bg-ink-50 px-1.5 py-0.5 font-mono">K</kbd>
          ou setas
        </span>
      </div>
    </div>
  );
}

// ====== Main focus card ======
function FocusCard({ row, activeIdx, total, selectedV, setSelectedV, comments, saveComment, decision }) {
  const c = MOCK.CONTRACT_DSB001;
  const initials = row.beneficiario.split(' ').map((p) => p[0]).slice(0, 2).join('');
  const sv = selectedV != null ? MOCK.VALIDATIONS.find((v) => v.n === selectedV) : null;
  const validCount = MOCK.VALIDATIONS.filter((v) => v.status === 'valido').length;
  const total10 = MOCK.VALIDATIONS.length;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card">
      {/* Decoration: top stripe colored by status */}
      <div className="h-1" style={{ backgroundColor: STATUS_DOT[row.status] }}></div>

      {/* Header */}
      <div className="px-7 pt-6 pb-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full text-[18px] font-bold text-white"
                 style={{ background: 'linear-gradient(135deg,#00437A,#2D8AD8)' }}>
              {initials}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-brand-50 px-1.5 py-0.5 font-mono text-[11px] font-bold text-brand-800">
                  {row.id}
                </span>
                <span className="font-mono text-[11.5px] text-ink-500">{row.contrato}</span>
                <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wider"
                      style={{ backgroundColor: STATUS_DOT[row.status] + '22', color: STATUS_DOT[row.status] }}>
                  <span className="h-1 w-1 rounded-full" style={{ backgroundColor: STATUS_DOT[row.status] }}></span>
                  {STATUS_LABEL[row.status]}
                </span>
              </div>
              <h1 className="mt-1.5 text-[26px] font-semibold leading-tight tracking-tight text-ink-900">
                {row.beneficiario}
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[12px] text-ink-500">
                <span>{c.financiamento.programa}</span>
                <span className="text-ink-200">•</span>
                <span>{row.fase}</span>
                <span className="text-ink-200">•</span>
                <span>{c.financiamento.numeroDesembolso} desembolso</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10.5px] font-bold uppercase tracking-wider text-ink-500">Valor</div>
            <div className="mt-1 text-[24px] font-semibold tabular-nums tracking-tight text-ink-900">
              {MOCK.BRL(row.valor)}
            </div>
          </div>
        </div>

        {/* Quick property strip */}
        <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-2 rounded-lg border border-ink-100 bg-[#FAFBFD] px-4 py-3 text-[12px] md:grid-cols-4">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-ink-500">CPF</div>
            <div className="font-mono font-medium text-ink-900">{c.beneficiario.cpf}</div>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-ink-500">Financiamento</div>
            <div className="font-semibold tabular-nums text-brand-800">{MOCK.BRL(c.financiamento.valorFinanciamento)}</div>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-ink-500">% Obra</div>
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-14 overflow-hidden rounded-full bg-ink-100">
                <div className="h-full rounded-full bg-brand-700" style={{ width: `${c.financiamento.pctObra}%` }}></div>
              </div>
              <span className="font-medium tabular-nums text-ink-900">{c.financiamento.pctObra}%</span>
            </div>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-ink-500">Renda</div>
            <div className="font-medium tabular-nums text-ink-900">{MOCK.BRL(c.beneficiario.renda)}</div>
          </div>
        </div>
      </div>

      {/* Validation pills bar */}
      <div className="border-y border-ink-100 bg-[#FAFBFD] px-7 py-4">
        <div className="mb-2.5 flex items-center justify-between">
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-ink-500">
            Validações da macro
          </span>
          <span className="text-[12px] font-semibold tabular-nums text-ink-700">
            {validCount}/{total10} válidas
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {MOCK.VALIDATIONS.map((v) => {
            const active = selectedV === v.n;
            const invalid = v.status === 'invalido';
            const commentKey = `v${v.n}`;
            const hasComment = !!comments[commentKey] || (v.subitems && v.subitems.some((s) => comments[`v${v.n}-${s.n}`]));
            return (
              <button
                key={v.n}
                onClick={() => setSelectedV(v.n)}
                title={v.titulo}
                className={`relative inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11.5px] font-medium transition ${
                  active
                    ? 'bg-white text-ink-900 shadow-[0_0_0_2px_#005CA9]'
                    : invalid
                      ? 'bg-white text-ink-900 ring-1 ring-[#FBC2BC] hover:ring-[#C0392B]'
                      : 'bg-white text-ink-700 ring-1 ring-ink-100 hover:ring-ink-200'
                }`}
              >
                <span className="grid h-4 w-4 place-items-center rounded-full text-[8.5px] font-bold text-white"
                      style={{ backgroundColor: invalid ? '#C0392B' : '#1A7A4A' }}>
                  {invalid ? '!' : '✓'}
                </span>
                <span className="font-mono text-[10px] tabular-nums text-ink-500">{String(v.n).padStart(2,'0')}</span>
                <span className="max-w-[160px] truncate">{v.titulo}</span>
                {hasComment && (
                  <Icon.MessageSquare size={10} color="#64747A" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected validation panel */}
      <div className="px-7 py-5">
        {sv ? (
          <ValidationFocusPanel
            v={sv}
            comments={comments}
            saveComment={saveComment}
          />
        ) : (
          <EmptySelect />
        )}
      </div>

      {/* Decision overlay if decided */}
      {decision && (
        <DecisionBanner verdict={decision} />
      )}
    </div>
  );
}

function EmptySelect() {
  return (
    <div className="grid place-items-center rounded-lg border border-dashed border-ink-200 py-10 text-center">
      <Icon.LayoutGrid size={20} color="#9EB2BB" />
      <div className="mt-2 text-[12.5px] text-ink-500">
        Selecione uma validação acima para começar a tratativa.
      </div>
      <div className="mt-1 text-[11px] text-ink-500">
        Atalho: <kbd className="rounded border border-ink-100 bg-ink-50 px-1.5 py-0.5 font-mono">1</kbd>–
        <kbd className="rounded border border-ink-100 bg-ink-50 px-1.5 py-0.5 font-mono">9</kbd>
      </div>
    </div>
  );
}

function DecisionBanner({ verdict }) {
  const map = {
    approved: { label: 'Aprovado', bg: '#E0F2E7', fg: '#1A7A4A', icon: Icon.Check },
    refused:  { label: 'Recusado', bg: '#FCE6E3', fg: '#9A2A1F', icon: Icon.X },
    skipped:  { label: 'Adiado',   bg: '#FFEFD6', fg: '#663A00', icon: Icon.Slash },
  };
  const m = map[verdict];
  return (
    <div className="absolute inset-x-7 bottom-5 flex items-center gap-2 rounded-lg border px-3 py-2 shadow-sm"
         style={{ backgroundColor: m.bg, borderColor: m.fg + '33' }}>
      <m.icon size={14} color={m.fg} strokeWidth={2.6} />
      <span className="text-[12.5px] font-semibold" style={{ color: m.fg }}>
        Contrato {m.label.toLowerCase()} · próximo em instantes
      </span>
    </div>
  );
}

// ====== Validation focus panel (selected validation detail + tratativa) ======
function ValidationFocusPanel({ v, comments, saveComment }) {
  const commentKey = `v${v.n}`;
  const hasSubs = v.subitems && v.subitems.length > 0;
  const isInvalid = v.status === 'invalido';

  return (
    <div>
      <div className="flex items-center gap-3 pb-4 border-b border-ink-100">
        <span className="grid h-8 w-8 place-items-center rounded-lg font-mono text-[11.5px] font-bold tabular-nums text-white"
              style={{ backgroundColor: isInvalid ? '#C0392B' : '#005CA9' }}>
          {String(v.n).padStart(2, '0')}
        </span>
        <h3 className="flex-1 text-[17px] font-semibold leading-tight tracking-tight text-ink-900">
          {v.titulo}
        </h3>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider"
              style={{ backgroundColor: isInvalid ? '#FCE6E3' : '#E0F2E7', color: isInvalid ? '#9A2A1F' : '#1A7A4A' }}>
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: isInvalid ? '#C0392B' : '#1A7A4A' }}></span>
          {isInvalid ? 'Inválido' : 'Válido'}
        </span>
      </div>

      <p className="mt-3 text-[13px] leading-relaxed text-ink-700">{v.detalhe}</p>

      {hasSubs ? (
        <div className="mt-5">
          <div className="mb-2 text-[10.5px] font-bold uppercase tracking-wider text-ink-500">
            Sub-validações ({v.subitems.length})
          </div>
          <div className="space-y-1.5">
            {v.subitems.map((sub) => (
              <SubFocusCard
                key={sub.n}
                sub={sub}
                commentKey={`v${v.n}-${sub.n}`}
                comments={comments}
                saveComment={saveComment}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-5">
          <div className="mb-2 text-[10.5px] font-bold uppercase tracking-wider text-ink-500">
            Tratativa
          </div>
          <InlineComment
            commentKey={commentKey}
            savedComment={comments[commentKey]}
            onSave={(c) => saveComment(commentKey, c)}
          />
        </div>
      )}
    </div>
  );
}

function SubFocusCard({ sub, commentKey, comments, saveComment }) {
  const [open, setOpen] = useState(sub.status === 'invalido');
  const dot = sub.status === 'invalido' ? '#C0392B' : '#1A7A4A';

  return (
    <div className="overflow-hidden rounded-md border border-ink-100 bg-white">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-[#FAFBFD]"
      >
        <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: dot }}></span>
        <span className="w-7 shrink-0 font-mono text-[10.5px] font-semibold text-ink-500">{sub.n}</span>
        <span className="flex-1 truncate text-[12px] font-medium text-ink-900">{sub.titulo}</span>
        {comments[commentKey] && <Icon.MessageSquare size={10} color="#64747A" />}
        <span className="inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
              style={{ backgroundColor: sub.status === 'invalido' ? '#FCE6E3' : '#E0F2E7', color: sub.status === 'invalido' ? '#9A2A1F' : '#1A7A4A' }}>
          {sub.status === 'invalido' ? 'Inválido' : 'Válido'}
        </span>
        <Icon.ChevronDown size={12} color="#9EB2BB" className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <div className={`acc-body ${open ? 'open' : ''}`}>
        <div className="acc-inner">
          <div className="border-t border-ink-100 bg-[#FAFBFD] px-3 py-2.5 space-y-2">
            <p className="text-[12px] leading-relaxed text-ink-700">{sub.detalhe}</p>
            <InlineComment
              commentKey={commentKey}
              savedComment={comments[commentKey]}
              onSave={(c) => saveComment(commentKey, c)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ====== Side panel ======
function SidePanel({ row, decision, onDecide, onPrev, onNext, isLast, canPrev }) {
  return (
    <div className="space-y-4">
      {/* Quick decision card */}
      <div className="rounded-2xl border border-ink-100 bg-white p-4 shadow-card">
        <div className="text-[10.5px] font-bold uppercase tracking-wider text-ink-500">
          Decisão deste contrato
        </div>
        <div className="mt-3 space-y-2">
          <button
            onClick={() => onDecide('approved')}
            disabled={!!decision}
            className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-[13px] font-semibold transition ${
              decision === 'approved'
                ? 'bg-[#1A7A4A] text-white'
                : 'border border-[#1A7A4A]/30 bg-white text-[#1A7A4A] hover:bg-[#E0F2E7]'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <span className="inline-flex items-center gap-2">
              <Icon.Check size={14} strokeWidth={2.6} />
              Aprovar desembolso
            </span>
            <kbd className={`rounded border px-1.5 py-0.5 font-mono text-[10px] ${decision === 'approved' ? 'border-white/30 text-white/80' : 'border-current opacity-60'}`}>A</kbd>
          </button>
          <button
            onClick={() => onDecide('refused')}
            disabled={!!decision}
            className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-[13px] font-semibold transition ${
              decision === 'refused'
                ? 'bg-[#C0392B] text-white'
                : 'border border-[#C0392B]/30 bg-white text-[#C0392B] hover:bg-[#FCE6E3]'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <span className="inline-flex items-center gap-2">
              <Icon.X size={14} strokeWidth={2.6} />
              Recusar
            </span>
            <kbd className={`rounded border px-1.5 py-0.5 font-mono text-[10px] ${decision === 'refused' ? 'border-white/30 text-white/80' : 'border-current opacity-60'}`}>R</kbd>
          </button>
          <button
            onClick={() => onDecide('skipped')}
            disabled={!!decision}
            className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-[13px] font-semibold transition ${
              decision === 'skipped'
                ? 'bg-ink-700 text-white'
                : 'border border-ink-100 bg-white text-ink-700 hover:bg-ink-50'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <span className="inline-flex items-center gap-2">
              <Icon.Slash size={14} strokeWidth={2.4} />
              Adiar
            </span>
            <kbd className={`rounded border px-1.5 py-0.5 font-mono text-[10px] ${decision === 'skipped' ? 'border-white/30 text-white/80' : 'border-current opacity-60'}`}>S</kbd>
          </button>
        </div>

        <div className="mt-4 flex items-center gap-1">
          <button
            onClick={onPrev}
            disabled={!canPrev}
            className="flex flex-1 items-center justify-center gap-1 rounded-md border border-ink-100 bg-white px-2 py-1.5 text-[11.5px] font-medium text-ink-700 hover:bg-ink-50 disabled:opacity-40 disabled:hover:bg-white"
          >
            <Icon.ChevronLeft size={12} color="#404B52" />
            Anterior
          </button>
          <button
            onClick={onNext}
            disabled={isLast}
            className="flex flex-1 items-center justify-center gap-1 rounded-md bg-brand-700 px-2 py-1.5 text-[11.5px] font-semibold text-white shadow-sm hover:bg-brand-800 disabled:opacity-40 disabled:hover:bg-brand-700"
          >
            Próximo
            <Icon.ChevronRight size={12} color="#fff" />
          </button>
        </div>
      </div>

      {/* Atalhos */}
      <div className="rounded-2xl border border-ink-100 bg-white p-4">
        <div className="text-[10.5px] font-bold uppercase tracking-wider text-ink-500">
          Atalhos
        </div>
        <div className="mt-3 space-y-2 text-[11.5px]">
          {[
            ['J / →', 'Próximo contrato'],
            ['K / ←', 'Contrato anterior'],
            ['1–9, 0', 'Validação 1–10'],
            ['A', 'Aprovar'],
            ['R', 'Recusar'],
            ['S', 'Adiar'],
          ].map(([k, label]) => (
            <div key={k} className="flex items-center justify-between gap-2">
              <span className="text-ink-700">{label}</span>
              <kbd className="rounded border border-ink-100 bg-ink-50 px-1.5 py-0.5 font-mono text-[10px] text-ink-700">{k}</kbd>
            </div>
          ))}
        </div>
      </div>

      {/* Atividade */}
      <div className="rounded-2xl border border-ink-100 bg-white p-4">
        <div className="text-[10.5px] font-bold uppercase tracking-wider text-ink-500">
          Atividade do contrato
        </div>
        <div className="mt-3 space-y-3 text-[11.5px]">
          <ActivityItem
            who="Macro"
            when="14/05/2025 09:41"
            text={<>Executou validações · <span className="font-semibold text-ink-900">7/10 OK</span></>}
            dot="#005CA9"
          />
          <ActivityItem
            who="KS"
            when="14/05/2025 09:52"
            text={<>Adicionou tratativa em <span className="font-mono text-brand-800">v08</span></>}
            dot="#A65E00"
          />
          <ActivityItem
            who="Sistema"
            when="14/05/2025 09:21"
            text={<>Contrato recebido para análise</>}
            dot="#64747A"
          />
        </div>
      </div>
    </div>
  );
}

function ActivityItem({ who, when, text, dot }) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: dot }}></span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="grid h-4 w-4 place-items-center rounded-full text-[8px] font-bold text-white"
                style={{ background: 'linear-gradient(135deg,#00437A,#2D8AD8)' }}>
            {who[0]}
          </span>
          <span className="text-[11px] font-semibold text-ink-900">{who}</span>
          <span className="text-[10px] text-ink-500">· {when}</span>
        </div>
        <div className="ml-5 text-[11.5px] text-ink-700">{text}</div>
      </div>
    </div>
  );
}

window.Home4View = Home4View;
