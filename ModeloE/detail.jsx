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
          <button key={t} type="button" onClick={() => onChange(t)}
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[12.5px] font-medium transition ${active ? 'text-white shadow-sm' : 'text-ink-700 hover:bg-white'}`}
            style={active ? { backgroundColor: c.activeBg } : {}}>
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
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-[11.5px] font-medium" style={{ backgroundColor: c.bg, color: c.fg }}>
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: c.dot }}></span>
          {c.label}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-[11.5px] text-ink-500">
            <div className="grid h-4 w-4 place-items-center rounded-full text-[9px] font-semibold text-white" style={{ background: 'linear-gradient(135deg,#00437A,#2D8AD8)' }}>{comment.autor}</div>
            <span>Salvo por <span className="font-medium text-ink-700">{comment.autor}</span></span>
            <span>·</span>
            <span>{comment.timestamp}</span>
          </div>
          <div className="mt-1.5 text-[13px] text-ink-900 leading-relaxed">{comment.texto}</div>
        </div>
        <button onClick={onEdit} className="inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-1 text-[12px] font-medium text-brand-700 hover:bg-brand-50">
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
        <SavedComment comment={savedComment} onEdit={() => { setTipo(savedComment.tipo); setTexto(savedComment.texto); setEditing(true); }} />
      </div>
    );
  }

  const canSave = tipo && texto.trim().length > 0;

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between">
        <label className="text-[12.5px] font-medium text-ink-700">Adicionar comentário do analista</label>
        <CommentTypeSelector value={tipo} onChange={setTipo} />
      </div>
      <textarea value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Descreva a tratativa ou observação..." rows={3}
        className="mt-2 w-full resize-none rounded-lg border border-ink-100 bg-white px-3 py-2 text-[13px] text-ink-900 placeholder:text-ink-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-50" />
      <div className="mt-2 flex items-center justify-between">
        <span className="text-[11.5px] text-ink-500">{texto.length > 0 ? `${texto.length} caracteres` : 'O comentário ficará vinculado a esta validação.'}</span>
        <div className="flex items-center gap-2">
          {editing && <button onClick={() => setEditing(false)} className="rounded-md px-3 py-1.5 text-[12.5px] font-medium text-ink-700 hover:bg-ink-50">Cancelar</button>}
          <button onClick={() => { if (!canSave) return; onSave({ tipo, texto: texto.trim(), autor: 'KS', timestamp: new Date().toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(',', ' às') }); setEditing(false); }}
            disabled={!canSave}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12.5px] font-semibold transition ${canSave ? 'bg-brand-700 text-white hover:bg-brand-800 shadow-sm' : 'bg-ink-100 text-ink-300 cursor-not-allowed'}`}>
            <Icon.Check size={13} strokeWidth={2.6} />
            Salvar comentário
          </button>
        </div>
      </div>
      {!savedComment && !editing && (
        <div className="mt-3 rounded-lg border border-dashed border-ink-200 bg-white px-3 py-3 text-center text-[12.5px] text-ink-500">Nenhum comentário adicionado</div>
      )}
    </div>
  );
}

window.CommentBlock = CommentBlock;
window.SavedComment = SavedComment;
window.CommentTypeSelector = CommentTypeSelector;
window.COMMENT_TYPES = COMMENT_TYPES;
