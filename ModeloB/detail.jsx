// Detail view — contract info + validations accordion + comments.

const COMMENT_TYPES = {
  positivo:    { label: 'Positivo',    bg: '#E0F2E7', fg: '#1A7A4A', dot: '#1A7A4A', activeBg: '#1A7A4A' },
  informativo: { label: 'Informativo', bg: '#E5F1FC', fg: '#00437A', dot: '#005CA9', activeBg: '#005CA9' },
  negativo:    { label: 'Negativo',    bg: '#FCE6E3', fg: '#9A2A1F', dot: '#C0392B', activeBg: '#C0392B' },
};

function CommentTypeSelector({ value, onChange }) {
  const types = ['positivo', 'informativo', 'negativo'];
  return (
    <div className="inline-flex items-center gap-1 rounded-lg border border-ink-100 bg-ink-50 p-1">
      {types.map((t) => {
        const c = COMMENT_TYPES[t];
        const active = value === t;
        return (
          <button
            key={t}
            type="button"
            onClick={() => onChange(t)}
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[12.5px] font-medium transition ${
              active ? 'text-white shadow-sm' : 'text-ink-700 hover:bg-white'
            }`}
            style={active ? { backgroundColor: c.activeBg } : {}}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: active ? '#fff' : c.dot }}></span>
            {c.label}
          </button>
        );
      })}
    </div>
  );
}

function SavedComment({ comment, onEdit }) {
  const c = COMMENT_TYPES[comment.tipo];
  return (
    <div className="rounded-lg border border-ink-100 bg-ink-50/60 p-3">
      <div className="flex items-start gap-3">
        <span
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-[11.5px] font-medium"
          style={{ backgroundColor: c.bg, color: c.fg }}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: c.dot }}></span>
          {c.label}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-[11.5px] text-ink-500">
            <div className="grid h-4 w-4 place-items-center rounded-full text-[9px] font-semibold text-white"
                 style={{ background: 'linear-gradient(135deg,#00437A,#2D8AD8)' }}>
              {comment.autor}
            </div>
            <span>Salvo por <span className="font-medium text-ink-700">{comment.autor}</span></span>
            <span>·</span>
            <span>{comment.timestamp}</span>
          </div>
          <div className="mt-1.5 text-[13px] text-ink-900 leading-relaxed">{comment.texto}</div>
        </div>
        <button onClick={onEdit}
                className="inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-1 text-[12px] font-medium text-brand-700 hover:bg-brand-50">
          <Icon.Edit3 size={12} color="#005CA9" />
          Editar
        </button>
      </div>
    </div>
  );
}

function CommentBlock({ commentKey, savedComment, onSave }) {
  const [tipo, setTipo] = useState(savedComment?.tipo || null);
  const [texto, setTexto] = useState(savedComment?.texto || '');
  const [editing, setEditing] = useState(false);

  if (savedComment && !editing) {
    return (
      <div className="mt-3">
        <SavedComment
          comment={savedComment}
          onEdit={() => {
            setTipo(savedComment.tipo);
            setTexto(savedComment.texto);
            setEditing(true);
          }}
        />
      </div>
    );
  }

  const canSave = tipo && texto.trim().length > 0;

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between">
        <label className="text-[12.5px] font-medium text-ink-700">
          Adicionar comentário do analista
        </label>
        <CommentTypeSelector value={tipo} onChange={setTipo} />
      </div>
      <textarea
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="Descreva a tratativa ou observação..."
        rows={3}
        className="mt-2 w-full resize-none rounded-lg border border-ink-100 bg-white px-3 py-2 text-[13px] text-ink-900 placeholder:text-ink-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-50"
      />
      <div className="mt-2 flex items-center justify-between">
        <span className="text-[11.5px] text-ink-500">
          {texto.length > 0 ? `${texto.length} caracteres` : 'O comentário ficará vinculado a esta validação.'}
        </span>
        <div className="flex items-center gap-2">
          {editing && (
            <button
              onClick={() => setEditing(false)}
              className="rounded-md px-3 py-1.5 text-[12.5px] font-medium text-ink-700 hover:bg-ink-50"
            >
              Cancelar
            </button>
          )}
          <button
            onClick={() => {
              if (!canSave) return;
              onSave({
                tipo,
                texto: texto.trim(),
                autor: 'KS',
                timestamp: new Date().toLocaleString('pt-BR', {
                  day: '2-digit', month: '2-digit', year: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                }).replace(',', ' às'),
              });
              setEditing(false);
            }}
            disabled={!canSave}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12.5px] font-semibold transition ${
              canSave
                ? 'bg-brand-700 text-white hover:bg-brand-800 shadow-sm'
                : 'bg-ink-100 text-ink-300 cursor-not-allowed'
            }`}
          >
            <Icon.Check size={13} strokeWidth={2.6} />
            Salvar comentário
          </button>
        </div>
      </div>

      {!savedComment && !editing && (
        <div className="mt-3 rounded-lg border border-dashed border-ink-200 bg-white px-3 py-3 text-center text-[12.5px] text-ink-500">
          Nenhum comentário adicionado
        </div>
      )}
    </div>
  );
}

// ----- A single sub-item card (3a, 3b, 6a, ...) -----
function SubValidation({ sub, parentN, commentKey, comments, onSaveComment }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative pl-4">
      <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-full" style={{ backgroundColor: '#2D8AD8' }}></div>
      <div className="rounded-lg border border-ink-100 bg-brand-50/40">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center gap-3 px-4 py-3 text-left"
        >
          <UI.StatusIcon status={sub.status} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-semibold text-brand-800">{sub.n}</span>
              <span className="text-[13px] font-medium text-ink-900">{sub.titulo}</span>
            </div>
            <div className="mt-0.5 truncate text-[12.5px] text-ink-500">{sub.detalhe}</div>
          </div>
          <UI.StatusPill status={sub.status} />
          <Icon.ChevronDown
            size={16}
            color="#64747A"
            className={`transition-transform ${open ? 'rotate-180' : ''}`}
          />
        </button>
        <div className={`acc-body ${open ? 'open' : ''}`}>
          <div className="acc-inner">
            <div className="border-t border-ink-100 px-4 pb-4 pt-3">
              <p className="text-[13px] leading-relaxed text-ink-700">{sub.detalhe}</p>
              <CommentBlock
                commentKey={commentKey}
                savedComment={comments[commentKey]}
                onSave={(c) => onSaveComment(commentKey, c)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ----- A single validation row -----
function ValidationItem({ v, comments, onSaveComment }) {
  const [open, setOpen] = useState(false);
  const ParentIcon = v.icon && Icon[v.icon] ? Icon[v.icon] : Icon.FileText;
  const commentKey = `v${v.n}`;
  const hasSubs = v.subitems && v.subitems.length > 0;

  return (
    <div className="rounded-xl border border-ink-100 bg-white shadow-card">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 px-5 py-4 text-left"
      >
        <UI.StatusIcon status={v.status} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11.5px] font-semibold text-brand-800">
              {String(v.n).padStart(2, '0')}
            </span>
            <ParentIcon size={14} color="#64747A" />
            <span className="text-[14px] font-semibold text-ink-900">{v.titulo}</span>
            {hasSubs && (
              <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-medium text-brand-800">
                <Icon.ChevronsUpDown size={11} color="#005CA9" />
                {v.subitems.length} sub-validações
              </span>
            )}
            {comments[commentKey] && !hasSubs && (
              <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-ink-50 px-2 py-0.5 text-[11px] font-medium text-ink-700">
                <Icon.MessageSquare size={10} color="#64747A" />
                comentário
              </span>
            )}
          </div>
          <div className="mt-0.5 truncate text-[12.5px] text-ink-500">{v.resultado}</div>
        </div>
        <UI.StatusPill status={v.status} />
        <Icon.ChevronDown
          size={16}
          color="#64747A"
          className={`transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <div className={`acc-body ${open ? 'open' : ''}`}>
        <div className="acc-inner">
          <div className="border-t border-ink-100 px-5 pb-5 pt-4">
            <div className="rounded-lg bg-ink-50/60 px-3.5 py-2.5 text-[13px] leading-relaxed text-ink-700">
              {v.detalhe}
            </div>

            {hasSubs ? (
              <div className="mt-4 space-y-2.5">
                {v.subitems.map((sub) => (
                  <SubValidation
                    key={sub.n}
                    sub={sub}
                    parentN={v.n}
                    commentKey={`v${v.n}-${sub.n}`}
                    comments={comments}
                    onSaveComment={onSaveComment}
                  />
                ))}
              </div>
            ) : (
              <CommentBlock
                commentKey={commentKey}
                savedComment={comments[commentKey]}
                onSave={(c) => onSaveComment(commentKey, c)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ----- Info row utilities -----
function InfoRow({ label, value, mono, accent }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-ink-100 py-2.5 last:border-b-0">
      <div className="text-[12.5px] text-ink-500">{label}</div>
      <div className={`text-[13px] ${accent ? 'font-semibold text-brand-800' : 'font-medium text-ink-900'} ${mono ? 'font-mono tabular-nums' : ''}`}>
        {value}
      </div>
    </div>
  );
}

function CardSection({ title, icon, children, accent }) {
  const IconComp = icon ? Icon[icon] : Icon.FileText;
  return (
    <div className="rounded-xl border border-ink-100 bg-white shadow-card">
      <div className="flex items-center gap-2 border-b border-ink-100 px-5 py-3">
        <div className="grid h-7 w-7 place-items-center rounded-md" style={{ backgroundColor: accent?.bg || '#E5F1FC' }}>
          <IconComp size={14} color={accent?.fg || '#005CA9'} />
        </div>
        <div className="text-[13.5px] font-semibold text-ink-900">{title}</div>
      </div>
      <div className="px-5 py-2">{children}</div>
    </div>
  );
}

// ----- The full Detail view -----
function DetailView({ onBack }) {
  const c = MOCK.CONTRACT_DSB001;

  // Build initial comments from any pre-filled.
  const initial = useMemo(() => {
    const obj = {};
    MOCK.VALIDATIONS.forEach((v) => {
      if (v.prefilledComment) obj[`v${v.n}`] = v.prefilledComment;
    });
    return obj;
  }, []);

  const [comments, setComments] = useState(initial);

  const saveComment = (key, comment) => {
    setComments((prev) => ({ ...prev, [key]: comment }));
  };

  const validCount = MOCK.VALIDATIONS.filter((v) => v.status === 'valido').length;
  const totalCount = MOCK.VALIDATIONS.length;
  const pct = (validCount / totalCount) * 100;

  // Dynamic status chip based on validation states
  const overallStatus =
    MOCK.VALIDATIONS.some((v) => v.status === 'invalido') ? 'pendencia' :
    validCount === totalCount ? 'aprovado' : 'pendente';

  return (
    <div className="slide-in mx-auto max-w-[1400px] px-6 py-8" data-screen-label="Detail DSB-001">
      {/* Breadcrumb + back */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[13px] font-medium text-ink-700 hover:bg-ink-50"
        >
          <Icon.ArrowLeft size={14} color="#404B52" />
          Voltar
        </button>
        <div className="flex items-center gap-1.5 text-[12.5px] text-ink-500">
          <Icon.Home size={12} color="#9EB2BB" />
          <span>Home</span>
          <Icon.ChevronRight size={12} color="#9EB2BB" />
          <span>Desembolsos</span>
          <Icon.ChevronRight size={12} color="#9EB2BB" />
          <span className="font-mono font-medium text-ink-700">DSB-001</span>
        </div>
      </div>

      {/* Title row */}
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[12.5px] font-semibold text-brand-700">DSB-001</span>
            <span className="text-ink-300">·</span>
            <span className="font-mono text-[12.5px] text-ink-500">{c.contrato}</span>
          </div>
          <h1 className="mt-1 text-[24px] font-semibold leading-tight text-ink-900">
            Contrato {c.contrato} — {c.beneficiario.nome}
          </h1>
          <p className="mt-1 text-[13px] text-ink-500">
            {c.financiamento.programa} · {c.financiamento.fase} · {c.financiamento.numeroDesembolso} desembolso
          </p>
        </div>
        <div className="flex items-center gap-3">
          <UI.StatusPill status={overallStatus} size="lg" />
          <button className="inline-flex items-center gap-1.5 rounded-lg border border-ink-100 bg-white px-3 py-2 text-[13px] font-medium text-ink-700 hover:bg-ink-50">
            <Icon.MoreHorizontal size={14} color="#404B52" />
            Ações
          </button>
        </div>
      </div>

      {/* Contract info cards */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <CardSection title="Beneficiário" icon="User" accent={{ bg: '#E5F1FC', fg: '#005CA9' }}>
          <InfoRow label="Número do Contrato" value={c.contrato} mono accent />
          <InfoRow label="Beneficiário" value={c.beneficiario.nome} />
          <InfoRow label="CPF" value={c.beneficiario.cpf} mono />
          <InfoRow label="Data Nascimento" value={c.beneficiario.nascimento} mono />
          <InfoRow label="Renda Mensal" value={MOCK.BRL(c.beneficiario.renda)} mono />
          <InfoRow label="Telefone" value={c.beneficiario.telefone} mono />
        </CardSection>

        <CardSection title="Financiamento" icon="Landmark" accent={{ bg: '#FFEFD6', fg: '#A65E00' }}>
          <InfoRow label="Programa" value={c.financiamento.programa} />
          <InfoRow label="Valor do Imóvel" value={MOCK.BRL(c.financiamento.valorImovel)} mono />
          <InfoRow label="Valor do Financiamento" value={MOCK.BRL(c.financiamento.valorFinanciamento)} mono accent />
          <InfoRow label="Nº do Desembolso" value={c.financiamento.numeroDesembolso} />
          <InfoRow label="Fase" value={c.financiamento.fase} />
          <InfoRow label="% Obra Atual" value={
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-24 overflow-hidden rounded-full bg-ink-100">
                <div className="h-full rounded-full bg-brand-700" style={{ width: `${c.financiamento.pctObra}%` }}></div>
              </div>
              <span className="tabular-nums">{c.financiamento.pctObra}%</span>
            </div>
          } />
          <InfoRow label="Sistema de Amortização" value={c.financiamento.amortizacao} mono />
        </CardSection>
      </div>

      {/* Tags row */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {c.tags.map((t) => (
          <UI.TagChip key={t.label} {...t} />
        ))}
      </div>

      {/* Validations section */}
      <section className="mt-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-[18px] font-semibold text-ink-900">Validações da Macro</h2>
            <p className="mt-0.5 text-[12.5px] text-ink-500">
              Cada validação foi executada automaticamente pela macro. Expanda para adicionar tratativa.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[11.5px] uppercase tracking-wide text-ink-500">Status geral</div>
              <div className="text-[15px] font-semibold tabular-nums text-ink-900">
                {validCount}/{totalCount} <span className="text-[12.5px] font-medium text-ink-500">válidas</span>
              </div>
            </div>
            <div className="h-2 w-48 overflow-hidden rounded-full bg-ink-100">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#005CA9,#2D8AD8)' }}
              ></div>
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-2.5">
          {MOCK.VALIDATIONS.map((v) => (
            <ValidationItem
              key={v.n}
              v={v}
              comments={comments}
              onSaveComment={saveComment}
            />
          ))}
        </div>

        {/* Footer actions */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink-100 bg-white p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-brand-50">
              <Icon.FileCheck2 size={18} color="#005CA9" />
            </div>
            <div>
              <div className="text-[13.5px] font-semibold text-ink-900">Finalizar análise</div>
              <div className="text-[12.5px] text-ink-500">
                Revise as validações inválidas e adicione tratativas antes de aprovar.
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="rounded-lg border border-ink-100 bg-white px-3 py-2 text-[13px] font-medium text-ink-700 hover:bg-ink-50">
              Salvar rascunho
            </button>
            <button className="rounded-lg border border-err/30 bg-white px-3 py-2 text-[13px] font-medium text-err hover:bg-[#FCE6E3]">
              Recusar desembolso
            </button>
            <button className="rounded-lg bg-brand-700 px-4 py-2 text-[13px] font-semibold text-white shadow-sm hover:bg-brand-800">
              Aprovar desembolso
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

window.DetailView = DetailView;
window.CommentBlock = CommentBlock;
window.SavedComment = SavedComment;
window.CommentTypeSelector = CommentTypeSelector;
window.COMMENT_TYPES = COMMENT_TYPES;
window.InfoRow = InfoRow;
window.CardSection = CardSection;
