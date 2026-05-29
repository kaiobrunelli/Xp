// Reusable atoms & molecules.

const { useState, useEffect, useMemo, useRef } = React;

// ----- Status badge / pill -----
function StatusPill({ status, size = 'sm' }) {
  const map = {
    pendente:   { bg: '#FFEFD6', fg: '#663A00', dot: '#D87B00', label: 'Pendente' },
    aprovado:   { bg: '#E0F2E7', fg: '#1A7A4A', dot: '#1A7A4A', label: 'Aprovado' },
    pendencia:  { bg: '#FCE6E3', fg: '#9A2A1F', dot: '#C0392B', label: 'Com Pendência' },
    erro:       { bg: '#FCE6E3', fg: '#9A2A1F', dot: '#C0392B', label: 'Com Erro' },
    valido:     { bg: '#E0F2E7', fg: '#1A7A4A', dot: '#1A7A4A', label: 'Válido' },
    invalido:   { bg: '#FCE6E3', fg: '#9A2A1F', dot: '#C0392B', label: 'Inválido' },
  };
  const c = map[status] || map.pendente;
  const padding = size === 'sm' ? 'px-2.5 py-0.5 text-[12px]' : 'px-3 py-1 text-[13px]';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${padding}`}
      style={{ backgroundColor: c.bg, color: c.fg }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: c.dot }}></span>
      {c.label}
    </span>
  );
}

// ----- Status icon (the leading colored circle on a validation row) -----
function StatusIcon({ status }) {
  if (status === 'valido') {
    return (
      <div className="h-9 w-9 shrink-0 rounded-full flex items-center justify-center"
           style={{ backgroundColor: '#E0F2E7' }}>
        <Icon.Check size={18} color="#1A7A4A" strokeWidth={2.6} />
      </div>
    );
  }
  if (status === 'invalido') {
    return (
      <div className="h-9 w-9 shrink-0 rounded-full flex items-center justify-center"
           style={{ backgroundColor: '#FCE6E3' }}>
        <Icon.X size={18} color="#C0392B" strokeWidth={2.6} />
      </div>
    );
  }
  return (
    <div className="h-9 w-9 shrink-0 rounded-full flex items-center justify-center"
         style={{ backgroundColor: '#FFEFD6' }}>
      <Icon.AlertTriangle size={16} color="#D87B00" strokeWidth={2.4} />
    </div>
  );
}

// ----- Tag chip (for contract tags row) -----
function TagChip({ label, value, icon }) {
  const Comp = icon && Icon[icon] ? Icon[icon] : Icon.Info;
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-ink-100 bg-white px-3 py-1.5 text-[12.5px]">
      <Comp size={14} color="#005CA9" />
      <span className="text-ink-500">{label}:</span>
      <span className="font-medium text-ink-900">{value}</span>
    </div>
  );
}

// ----- Top bar (shared) -----
function TopBar({ onLogo, currentView, onNavigate }) {
  const navBtn = (key, label, icon) => {
    const active = currentView === key;
    const IconComp = Icon[icon] || Icon.Home;
    return (
      <button
        onClick={() => onNavigate && onNavigate(key)}
        className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[13px] transition ${
          active
            ? 'bg-brand-50 font-semibold text-brand-800'
            : 'text-ink-700 hover:bg-ink-50'
        }`}
      >
        <IconComp size={14} color={active ? '#00437A' : '#64747A'} />
        {label}
      </button>
    );
  };

  return (
    <header className="sticky top-0 z-30 border-b border-ink-100 bg-white">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center gap-4 px-6">
        <button onClick={onLogo} className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg" style={{ background: 'linear-gradient(135deg,#005CA9,#2D8AD8)' }}>
            <Icon.LayoutDashboard size={16} color="#fff" />
          </div>
          <div className="leading-none">
            <div className="text-[12px] text-ink-500">Painel interno</div>
            <div className="text-[14px] font-semibold text-ink-900">Macro de Desembolsos</div>
          </div>
        </button>

        <div className="ml-2 hidden md:flex items-center gap-1 text-[13px] text-ink-700">
          {navBtn('home',  'Home',  'Home')}
          {navBtn('home2', 'Home2', 'LayoutGrid')}
          {navBtn('home3', 'Home3', 'Table2')}
          {navBtn('home4', 'Home4', 'Sparkles')}
          <span className="rounded-md px-2 py-1.5 hover:bg-ink-50 cursor-pointer text-ink-700">Contratos</span>
          <span className="rounded-md px-2 py-1.5 hover:bg-ink-50 cursor-pointer text-ink-700">Relatórios</span>
          <span className="rounded-md px-2 py-1.5 hover:bg-ink-50 cursor-pointer text-ink-700">Auditoria</span>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2 rounded-lg border border-ink-100 px-3 py-1.5 text-[13px] text-ink-500 w-72">
            <Icon.Search size={14} color="#64747A" />
            <span>Buscar contrato, CPF, beneficiário...</span>
            <kbd className="ml-auto rounded border border-ink-100 bg-ink-50 px-1.5 text-[11px] text-ink-500">⌘K</kbd>
          </div>
          <button className="rounded-lg p-2 hover:bg-ink-50 relative" title="Notificações">
            <Icon.Bell size={16} color="#404B52" />
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-amber-500"></span>
          </button>
          <button className="rounded-lg p-2 hover:bg-ink-50" title="Ajuda">
            <Icon.HelpCircle size={16} color="#404B52" />
          </button>
          <div className="ml-1 flex items-center gap-2 rounded-lg pl-2 pr-1 py-1 hover:bg-ink-50 cursor-pointer">
            <div className="text-right hidden md:block leading-tight">
              <div className="text-[12.5px] font-medium text-ink-900">Karina Souto</div>
              <div className="text-[11px] text-ink-500">Analista de Crédito</div>
            </div>
            <div className="grid h-8 w-8 place-items-center rounded-full text-[12px] font-semibold text-white"
                 style={{ background: 'linear-gradient(135deg,#00437A,#2D8AD8)' }}>
              KS
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

// ----- Validations / fraction chip -----
function FractionChip({ ok, total }) {
  const ratio = ok / total;
  return (
    <div className="inline-flex items-center gap-2">
      <div className="h-1.5 w-16 rounded-full bg-ink-100 overflow-hidden">
        <div className="h-full rounded-full bg-brand-700" style={{ width: `${ratio*100}%` }}></div>
      </div>
      <span className="inline-flex items-center rounded-md bg-brand-50 px-1.5 py-0.5 text-[12px] font-medium tabular-nums text-brand-800">
        {ok}/{total}
      </span>
    </div>
  );
}

// ----- Filter chip -----
function FilterChip({ label, active, count, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[13px] font-medium transition ${
        active
          ? 'bg-brand-700 text-white shadow-sm'
          : 'bg-white text-ink-700 border border-ink-100 hover:bg-ink-50'
      }`}
    >
      {label}
      {count != null && (
        <span className={`rounded-full px-1.5 text-[11px] tabular-nums ${active ? 'bg-white/20' : 'bg-ink-100 text-ink-700'}`}>
          {count}
        </span>
      )}
    </button>
  );
}

window.UI = { StatusPill, StatusIcon, TagChip, TopBar, FractionChip, FilterChip };

const STATUS_META = {
  pendencia: { label: 'Com Pendência', dot: '#C0392B', bg: '#FCE6E3', fg: '#9A2A1F' },
  pendente:  { label: 'Pendente',      dot: '#D87B00', bg: '#FFEFD6', fg: '#663A00' },
  aprovado:  { label: 'Aprovado',      dot: '#1A7A4A', bg: '#E0F2E7', fg: '#1A7A4A' },
};
window.STATUS_META = STATUS_META;
