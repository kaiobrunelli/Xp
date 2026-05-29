'use strict';

// ═══════════════════════════════════════════════════════════════════
//  ESTADO GLOBAL
// ═══════════════════════════════════════════════════════════════════
const S = {
  macroRan:     {},   // { [cid]: boolean }
  macroResults: {},   // { [cid]: { [leafId]: 'valid'|'invalid' } }
  comments:     {},   // { [cid]: { [leafId]: { comment, classification } } }
  decisions:    {},   // { [cid]: 'approved'|'rejected' }
  globalMacro:  'idle',   // 'idle'|'running'|'done'
  dialogIdx:    null,     // number|null
  dialogSel:    '__overview__',
  cOpen:        {},   // comentário aberto: { [`${cid}_${leafId}`]: bool }
};

// ═══════════════════════════════════════════════════════════════════
//  HELPERS DE ESTADO
// ═══════════════════════════════════════════════════════════════════
function getVSt(v, cid) {
  if (!S.macroRan[cid]) return 'pending';
  const res = S.macroResults[cid] || {};
  if (v.type === 'group') {
    const ss = v.children.map(c => res[c.id] || 'pending');
    if (ss.every(s => s === 'valid'))   return 'valid';
    if (ss.some(s => s === 'invalid'))  return 'invalid';
    return 'pending';
  }
  return res[v.id] || 'pending';
}

function leafSt(id, cid) {
  if (!S.macroRan[cid]) return 'pending';
  return (S.macroResults[cid] || {})[id] || 'pending';
}

function getProg(cid) {
  if (!S.macroRan[cid]) return { valid:0, invalid:0, total:VALIDATIONS.length };
  const res = S.macroResults[cid] || {};
  const valid   = VALIDATIONS.filter(v => v.type==='group' ? v.children.every(c=>res[c.id]==='valid')   : res[v.id]==='valid').length;
  const invalid = VALIDATIONS.filter(v => v.type==='group' ? v.children.some(c=>res[c.id]==='invalid')  : res[v.id]==='invalid').length;
  return { valid, invalid, total:VALIDATIONS.length };
}

function getStats() {
  const done   = CONTRACTS.filter(c => getProg(c.id).valid === VALIDATIONS.length).length;
  const inv    = CONTRACTS.filter(c => S.macroRan[c.id] && getProg(c.id).invalid > 0).length;
  const notRan = CONTRACTS.filter(c => !S.macroRan[c.id]).length;
  return { total:CONTRACTS.length, done, inv, notRan };
}

function getCmt(cid, leafId) {
  return (S.comments[cid] || {})[leafId] || { comment:'', classification:null };
}

function setCmt(cid, leafId, field, val) {
  if (!S.comments[cid]) S.comments[cid] = {};
  if (!S.comments[cid][leafId]) S.comments[cid][leafId] = { comment:'', classification:null };
  S.comments[cid][leafId][field] = val;
}

function esc(str) {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ═══════════════════════════════════════════════════════════════════
//  FRAGMENTOS HTML — componentes reutilizáveis
// ═══════════════════════════════════════════════════════════════════

/* Círculo de status (✓ / ✕ / –) */
function circleH(status, size=34) {
  const ui = SUI[status];
  const sym = status==='valid' ? '✓' : status==='invalid' ? '✕' : '–';
  return `<div style="width:${size}px;height:${size}px;border-radius:50%;flex-shrink:0;
    background:${ui.bg};border:2px solid ${ui.border};
    display:flex;align-items:center;justify-content:center;">
    <span style="color:${ui.dot};font-size:${size*.43}px;font-weight:900;line-height:1;">${sym}</span>
  </div>`;
}

/* Badge de status */
function bdgH(status, sm=false) {
  const ui = SUI[status];
  return `<span style="padding:${sm?'2px 9px':'4px 11px'};border-radius:20px;font-size:${sm?10.5:11.5}px;
    font-weight:700;background:${ui.bg};color:${ui.color};border:1.5px solid ${ui.border};white-space:nowrap;">• ${ui.label}</span>`;
}

/* Pills de classificação */
function pillsH(cid, leafId) {
  const c = getCmt(cid, leafId);
  return PILLS.map(p => {
    const a = c.classification === p.v;
    return `<button data-action="set-pill" data-cid="${cid}" data-leaf="${leafId}" data-pill="${p.v}"
      style="padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;cursor:pointer;
        border:1.5px solid ${a?p.border:'#e2e8f0'};background:${a?p.bg:'white'};color:${a?p.color:'#94a3b8'};">
      ${p.label}</button>`;
  }).join('');
}

/* Campo de tratativa / observação */
function treatmentH(leafId, cid, subtle=false) {
  const c = getCmt(cid, leafId);
  const bg     = subtle ? '#f8fafc' : '#fefce8';
  const border  = subtle ? '1.5px dashed #cbd5e1' : '1.5px dashed #fde68a';
  const lbl    = subtle ? 'Observação / Anotação' : 'Tratativa / Observação';
  const ph     = subtle ? 'Adicione uma observação...' : 'Descreva a tratativa adotada...';
  const lc     = subtle ? '#64748b' : '#92400e';
  const showSave = c.comment.length > 0;
  return `
    <div class="treatment-box" style="margin-top:10px;padding:12px 14px;background:${bg};border-radius:8px;border:${border};">
      <div style="font-size:10px;font-weight:700;color:${lc};text-transform:uppercase;letter-spacing:.06em;margin-bottom:7px;">${lbl}</div>
      <textarea data-action="cmt-input" data-cid="${cid}" data-leaf="${leafId}"
        placeholder="${ph}" rows="2"
        style="width:100%;border:1.5px solid #e2e8f0;border-radius:8px;padding:7px 10px;
          font-size:12.5px;color:#475569;background:white;box-sizing:border-box;"
      >${esc(c.comment)}</textarea>
      <div class="save-row" style="margin-top:8px;display:${showSave?'flex':'none'};justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px;">
        <div style="display:flex;gap:5px;flex-wrap:wrap;">${pillsH(cid, leafId)}</div>
        <button data-action="save-cmt" style="padding:5px 14px;border-radius:7px;background:${B};color:white;border:none;font-size:12px;font-weight:600;cursor:pointer;">✓ Salvar</button>
      </div>
    </div>`;
}

/* Seção de comentário expansível */
function commentSectionH(leafId, cid, subtle=false, vSt='pending') {
  const c = getCmt(cid, leafId);
  const hasCmt = c.comment.length > 0;
  const pill   = PILLS.find(p => p.v === c.classification);
  const key    = `${cid}_${leafId}`;
  if (!(key in S.cOpen)) S.cOpen[key] = (vSt === 'invalid') || hasCmt;
  const open   = S.cOpen[key];
  const bc     = open ? '#64748b' : subtle ? '#16a34a' : '#dc2626';
  const ico    = open ? 'ti-chevron-up' : 'ti-message-circle-plus';
  const lbl    = open ? 'Ocultar comentário' : hasCmt ? 'Comentário adicionado' : 'Adicionar comentário';
  const pillBdg = hasCmt && !open && pill
    ? `<span style="padding:1px 7px;border-radius:10px;font-size:10px;font-weight:700;background:${pill.bg};color:${pill.color};margin-left:4px;">${pill.label}</span>`
    : hasCmt && !open
      ? `<span style="width:7px;height:7px;border-radius:50%;background:#3b82f6;display:inline-block;margin-left:4px;"></span>`
      : '';
  return `
    <div class="cmt-section" style="margin-top:8px;">
      <button data-action="toggle-cmt" data-cid="${cid}" data-leaf="${leafId}"
        style="display:flex;align-items:center;gap:6px;background:none;border:none;cursor:pointer;
          padding:5px 0;font-size:11.5px;font-weight:600;color:${bc};">
        <i class="ti ${ico}" style="font-size:13px;"></i>
        ${lbl}${pillBdg}
      </button>
      ${open ? treatmentH(leafId, cid, subtle) : ''}
    </div>`;
}

// ═══════════════════════════════════════════════════════════════════
//  CARD DE RESUMO CONSOLIDADO
// ═══════════════════════════════════════════════════════════════════
function summaryCardH() {
  const st = getStats();
  const gm = S.globalMacro;
  const items = [
    { label:'Contratos',        value:st.total,  color:B,         bg:'#EFF6FF', icon:'ti-files' },
    { label:'Todos válidos',    value:st.done,   color:'#16a34a', bg:'#f0fdf4', icon:'ti-circle-check' },
    { label:'Com inválidas',    value:st.inv,    color:'#dc2626', bg:'#fef2f2', icon:'ti-alert-triangle' },
    { label:'Aguardando macro', value:st.notRan, color:'#d97706', bg:'#fffbeb', icon:'ti-clock' },
  ];
  const btnBg  = gm==='done'?'#16a34a':gm==='running'?'#3b82f6':B;
  const btnIco = gm==='running'?'ti-loader-2 spinning':gm==='done'?'ti-check':'ti-player-play';
  const btnLbl = gm==='running'?'Executando...':gm==='done'?'Macro executada!':'Executar Macro Global';
  const statsH = items.map((it,i) => `
    <div style="text-align:center;padding:6px 20px;${i<items.length-1?'border-right:1px solid #f1f5f9;':''}">
      <div style="width:36px;height:36px;border-radius:10px;background:${it.bg};display:flex;align-items:center;justify-content:center;margin:0 auto 6px;">
        <i class="ti ${it.icon}" style="font-size:17px;color:${it.color};"></i>
      </div>
      <div style="font-size:26px;font-weight:800;color:${it.color};line-height:1;">${it.value}</div>
      <div style="font-size:10.5px;color:#64748b;margin-top:3px;font-weight:500;white-space:nowrap;">${it.label}</div>
    </div>`).join('');
  return `
    <div style="background:white;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;box-shadow:0 2px 12px rgba(0,92,169,.08);margin-bottom:20px;">
      <div style="height:4px;background:linear-gradient(90deg,${B} 0%,#3b82f6 45%,#06b6d4 100%);"></div>
      <div style="padding:18px 24px;display:flex;align-items:center;gap:24px;">
        <div style="flex-shrink:0;">
          <div style="display:flex;align-items:center;gap:8px;">
            <div style="width:30px;height:30px;border-radius:8px;background:${B};display:flex;align-items:center;justify-content:center;">
              <i class="ti ti-chart-bar" style="font-size:15px;color:white;"></i>
            </div>
            <div>
              <div style="font-size:13.5px;font-weight:700;color:#0f172a;">Resumo Consolidado</div>
              <div style="font-size:10.5px;color:#94a3b8;">Macro Diária · ${new Date().toLocaleDateString('pt-BR')}</div>
            </div>
          </div>
        </div>
        <div style="width:1px;height:48px;background:#f1f5f9;flex-shrink:0;"></div>
        <div style="display:flex;flex:1;justify-content:space-around;">${statsH}</div>
        <div style="width:1px;height:48px;background:#f1f5f9;flex-shrink:0;"></div>
        <button data-action="run-global" ${gm==='running'?'disabled':''}
          style="flex-shrink:0;padding:12px 22px;border-radius:12px;background:${btnBg};color:white;
            font-weight:700;font-size:13px;border:none;cursor:${gm==='running'?'wait':'pointer'};
            box-shadow:0 4px 14px ${B}40;display:flex;align-items:center;gap:8px;transition:all .2s;">
          <i class="ti ${btnIco}" style="font-size:15px;"></i>${btnLbl}
        </button>
      </div>
    </div>`;
}

// ═══════════════════════════════════════════════════════════════════
//  TABELA DE CONTRATOS
// ═══════════════════════════════════════════════════════════════════
function rowAccent(c) {
  const dec = S.decisions[c.id];
  const { invalid } = getProg(c.id);
  if (dec==='approved')              return '#16a34a';
  if (dec==='rejected')              return '#dc2626';
  if (S.macroRan[c.id] && invalid>0) return '#f59e0b';
  if (S.macroRan[c.id])              return '#16a34a';
  return '#94a3b8';
}

function contractRowH(c, i) {
  const { valid, invalid } = getProg(c.id);
  const ran = S.macroRan[c.id];
  const dec = S.decisions[c.id];
  const ts  = TIPO_S[c.tipo] || {};
  const acc = rowAccent(c);
  let statusH = '';
  if (dec) {
    statusH = `<span style="font-size:10.5px;font-weight:700;padding:3px 10px;border-radius:20px;background:${dec==='approved'?'#dcfce7':'#fee2e2'};color:${dec==='approved'?'#166534':'#991b1b'};">${dec==='approved'?'✓ Aprovado':'✕ Recusado'}</span>`;
  } else if (!ran) {
    statusH = `<span style="font-size:10.5px;color:#94a3b8;background:#f1f5f9;padding:3px 10px;border-radius:20px;font-weight:600;">Não executada</span>`;
  } else if (invalid===0) {
    statusH = `<span style="font-size:10.5px;color:#166534;background:#dcfce7;padding:3px 10px;border-radius:20px;font-weight:700;display:inline-flex;align-items:center;gap:4px;"><span style="width:7px;height:7px;border-radius:50%;background:#16a34a;display:inline-block;"></span>${valid}/${VALIDATIONS.length} válidas</span>`;
  } else {
    statusH = `<span style="font-size:10.5px;color:#991b1b;background:#fee2e2;padding:3px 10px;border-radius:20px;font-weight:700;display:inline-flex;align-items:center;gap:4px;"><span style="width:7px;height:7px;border-radius:50%;background:#dc2626;display:inline-block;"></span>${invalid} inválida${invalid>1?'s':''}</span>`;
  }
  return `
    <div class="contract-row" data-action="open-dialog" data-idx="${i}"
      style="display:grid;grid-template-columns:100px 1fr 120px 170px 110px 70px 160px;
        padding:13px 20px;${i<CONTRACTS.length-1?'border-bottom:1px solid #f1f5f9;':''}
        align-items:center;cursor:pointer;background:white;border-left:4px solid transparent;
        --row-accent:${acc};">
      <div style="font-size:11.5px;font-weight:700;color:${B};font-family:monospace;">${c.id}</div>
      <div>
        <div style="font-size:13px;font-weight:600;color:#0f172a;">${c.mutuario}</div>
        <div style="display:flex;align-items:center;gap:6px;margin-top:2px;">
          <span style="font-size:10.5px;color:#94a3b8;">${c.responsavel}</span>
          <span style="font-size:10px;font-weight:600;background:${ts.bg||'#f1f5f9'};color:${ts.color||'#64748b'};padding:1px 7px;border-radius:20px;">${c.tipo}</span>
        </div>
      </div>
      <div style="font-size:12.5px;color:#475569;font-weight:600;">${fmtBRL(c.valor)}</div>
      <div style="font-size:11.5px;color:#475569;">${c.programa}</div>
      <div style="font-size:12px;color:#475569;">${c.fase}</div>
      <div style="font-size:12px;font-weight:700;color:#475569;">${c.obra}</div>
      <div style="display:flex;align-items:center;gap:6px;">${statusH}</div>
    </div>`;
}

function contractsTableH() {
  const heads = ['ID','Mutuário / Responsável','Valor','Programa','Fase','Obra','Status'];
  const hH = heads.map(h=>`<div style="font-size:9.5px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.07em;">${h}</div>`).join('');
  return `
    <div style="background:white;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;box-shadow:0 1px 6px rgba(0,0,0,.05);">
      <div style="display:grid;grid-template-columns:100px 1fr 120px 170px 110px 70px 160px;padding:9px 20px;background:#f8fafc;border-bottom:1px solid #e2e8f0;">${hH}</div>
      ${CONTRACTS.map((c,i)=>contractRowH(c,i)).join('')}
    </div>`;
}

// ═══════════════════════════════════════════════════════════════════
//  DIALOG — SIDEBAR
// ═══════════════════════════════════════════════════════════════════
function sideItemH(v, status, cid) {
  const active = S.dialogSel === v.id;
  const cfg = {
    invalid:{ abg:'#fff0f0', abrd:'#dc2626', atxt:'#7f1d1d' },
    valid:  { abg:'#f0fff4', abrd:'#16a34a', atxt:'#14532d' },
    pending:{ abg:'#EFF6FF', abrd:B,         atxt:'#1e3a5f' },
  };
  const c = cfg[status];
  const ids = v.type==='group' ? v.children.map(c=>c.id) : [v.id];
  const hasCmt = ids.some(id => (S.comments[cid]?.[id]?.comment||'').length>0);
  return `
    <button data-action="select-val" data-vid="${v.id}"
      class="side-btn"
      style="width:100%;text-align:left;background:${active?c.abg:'transparent'};border:none;
        border-left:3px solid ${active?c.abrd:'transparent'};border-radius:0 8px 8px 0;
        padding:6px 10px;cursor:pointer;display:flex;align-items:center;gap:8px;margin-bottom:2px;transition:all .13s;">
      ${circleH(status, 22)}
      <span style="font-size:10px;font-family:monospace;color:#94a3b8;flex-shrink:0;">${v.num}</span>
      <span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
        font-size:12px;font-weight:${active?700:400};color:${active?c.atxt:'#475569'};">${v.label}</span>
      ${hasCmt?'<i class="ti ti-message-circle" style="font-size:12px;color:#3b82f6;flex-shrink:0;"></i>':''}
    </button>`;
}

function dialogSidebarH(cid) {
  const invV = VALIDATIONS.filter(v => getVSt(v,cid)==='invalid');
  const valV = VALIDATIONS.filter(v => getVSt(v,cid)==='valid');
  const penV = VALIDATIONS.filter(v => getVSt(v,cid)==='pending');
  const oa   = S.dialogSel==='__overview__';
  let h = `
    <button data-action="select-val" data-vid="__overview__"
      class="side-btn"
      style="width:100%;text-align:left;padding:8px 12px;border-radius:0 8px 8px 0;border:none;
        border-left:3px solid ${oa?B:'transparent'};background:${oa?'#EFF6FF':'transparent'};
        cursor:pointer;margin-bottom:10px;display:flex;align-items:center;gap:8px;
        font-size:12.5px;font-weight:${oa?700:500};color:${oa?B:'#475569'};">
      <i class="ti ti-layout-dashboard" style="font-size:14px;color:${oa?B:'#94a3b8'};"></i>
      Resumo geral
    </button>`;
  const section = (label, color, dot, items, status) => items.length===0?'':
    `<div style="font-size:9.5px;font-weight:800;color:${color};text-transform:uppercase;letter-spacing:.08em;
        padding:4px 14px 5px;margin-top:6px;display:flex;align-items:center;gap:5px;">
      <span style="width:6px;height:6px;border-radius:50%;background:${dot};display:inline-block;"></span>
      ${label} · ${items.length}</div>
    ${items.map(v=>sideItemH(v, status, cid)).join('')}`;
  h += section('Inválidas','#dc2626','#dc2626',invV,'invalid');
  h += section('Válidas',  '#16a34a','#16a34a',valV,'valid');
  h += section('Pendentes','#94a3b8','#94a3b8',penV,'pending');
  return h;
}

// ═══════════════════════════════════════════════════════════════════
//  DIALOG — CARD DE VALIDAÇÃO
// ═══════════════════════════════════════════════════════════════════
function childCardH(child, cid) {
  const cSt = leafSt(child.id, cid);
  const cui  = SUI[cSt];
  const ran  = S.macroRan[cid];
  const cText = ran ? (MT[cSt]?.[child.id]||'') : '';
  const acc  = cSt==='valid'?'#16a34a':cSt==='invalid'?'#dc2626':'#e2e8f0';
  return `
    <div style="border-radius:10px;border:1.5px solid ${cui.border};border-left:4px solid ${acc};
      background:${cSt==='invalid'?'#fff8f8':cSt==='valid'?'#f9fefb':'#f8fafc'};padding:13px 15px;">
      <div style="display:flex;align-items:flex-start;gap:10px;">
        ${circleH(cSt, 28)}
        <div style="flex:1;min-width:0;">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;">
            <div style="display:flex;align-items:center;gap:7px;flex-wrap:wrap;">
              <span style="font-size:10.5px;color:#94a3b8;font-family:monospace;font-weight:700;">${child.num}</span>
              <span style="font-size:13px;font-weight:600;color:#0f172a;">${child.label}</span>
            </div>
            ${ran?bdgH(cSt,true):''}
          </div>
          ${cText?`<div style="font-size:12px;color:${cSt==='invalid'?'#991b1b':cSt==='valid'?'#166534':'#64748b'};margin-top:4px;line-height:1.5;">${cText}</div>`:''}
          ${ran?commentSectionH(child.id, cid, cSt==='valid', cSt):''}
        </div>
      </div>
    </div>`;
}

function vCardDetailH(v, cid) {
  const ran  = S.macroRan[cid];
  const vSt  = getVSt(v, cid);
  const ui   = SUI[vSt];
  const acc  = vSt==='valid'?'#16a34a':vSt==='invalid'?'#dc2626':'#e2e8f0';
  const res  = S.macroResults[cid]||{};
  let subtitle = '';
  if (ran && v.type==='group') {
    const ss  = v.children.map(c=>res[c.id]||'pending');
    const inv = ss.filter(s=>s==='invalid').length;
    subtitle = vSt==='invalid' ? `${inv} de ${v.children.length} sub-validações com pendência.`
                                : `${v.children.length} sub-validações — todas válidas.`;
  } else if (ran) {
    subtitle = MT[vSt]?.[v.id]||'';
  }
  let bodyH = '';
  if (v.type !== 'group') {
    if (ran) {
      const mb = vSt==='valid'?'#f0fdf4':'#fef2f2';
      const bb = vSt==='valid'?'#86efac':'#fca5a5';
      const mc = vSt==='valid'?'#166534':'#991b1b';
      const ms = vSt==='valid'?'✓':'✕';
      const mt = vSt==='valid'?(MT.valid[v.id]||'Validação aprovada.'):(MT.invalid[v.id]||'Validação reprovada.');
      bodyH = `
        <div style="font-size:12.5px;color:${mc};padding:10px 14px;background:${mb};border-radius:8px;
          border:1px solid ${bb};display:flex;align-items:center;gap:8px;margin-bottom:2px;">
          <span style="font-size:16px;">${ms}</span> ${mt}
        </div>
        ${commentSectionH(v.id, cid, vSt==='valid', vSt)}`;
    } else {
      bodyH = `<div style="font-size:12.5px;color:#94a3b8;text-align:center;padding:20px;">Execute a macro para ver o resultado.</div>`;
    }
  } else {
    bodyH = `<div style="display:flex;flex-direction:column;gap:10px;">${v.children.map(ch=>childCardH(ch,cid)).join('')}</div>`;
  }
  return `
    <div style="background:white;border-radius:12px;border:1.5px solid ${ui.border};overflow:hidden;border-left:4px solid ${acc};">
      <div style="display:flex;align-items:center;gap:14px;padding:14px 18px;background:${vSt==='invalid'?'#fff8f8':vSt==='valid'?'#f9fefb':'white'};">
        ${circleH(vSt, 36)}
        <div style="flex:1;min-width:0;">
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
            <span style="font-size:11px;color:#94a3b8;font-family:monospace;font-weight:700;">${v.num}</span>
            ${v.icon?`<i class="ti ${v.icon}" style="font-size:15px;color:#64748b;"></i>`:''}
            <span style="font-size:14px;font-weight:700;color:#0f172a;">${v.label}</span>
            ${v.type==='group'&&ran?`<span style="font-size:10.5px;background:#f1f5f9;color:#64748b;padding:2px 9px;border-radius:20px;font-weight:600;">${v.children.length} sub-validações</span>`:''}
          </div>
          ${subtitle?`<div style="font-size:12px;color:${vSt==='invalid'?'#991b1b':vSt==='valid'?'#166534':'#64748b'};margin-top:3px;line-height:1.5;">${subtitle}</div>`:''}
          ${!ran?`<div style="font-size:12px;color:#94a3b8;margin-top:3px;">Aguardando execução da macro...</div>`:''}
        </div>
        <div style="flex-shrink:0;">${ran?bdgH(vSt):''}</div>
      </div>
      <div style="border-top:1px solid ${ui.border}30;padding:14px 18px 18px;background:${vSt==='invalid'?'#fff8f8':vSt==='valid'?'#f9fefb':'#f8fafc'};">
        ${bodyH}
      </div>
    </div>`;
}

// ═══════════════════════════════════════════════════════════════════
//  DIALOG — PAINEL PRINCIPAL
// ═══════════════════════════════════════════════════════════════════
function dialogMainH(idx) {
  const sel = CONTRACTS[idx];
  const cid = sel.id;
  const ran = S.macroRan[cid];
  const { valid, invalid, total } = getProg(cid);
  const sel2 = S.dialogSel;

  if (sel2 === '__overview__') {
    if (!ran) return `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:300px;gap:12px;">
        <div style="width:60px;height:60px;border-radius:18px;background:#EFF6FF;display:flex;align-items:center;justify-content:center;">
          <i class="ti ti-player-play" style="font-size:28px;color:${B};"></i>
        </div>
        <div style="font-size:16px;font-weight:700;color:#64748b;">Execute a macro para analisar as validações</div>
        <div style="font-size:12.5px;text-align:center;max-width:360px;color:#94a3b8;line-height:1.6;">
          A macro verificará automaticamente cada um dos ${VALIDATIONS.length} critérios deste contrato.
        </div>
        <button data-action="run-contract" data-cid="${cid}" data-cidx="${idx}"
          style="margin-top:6px;padding:11px 32px;border-radius:11px;background:${B};color:white;font-weight:700;
            font-size:14px;border:none;cursor:pointer;box-shadow:0 4px 14px ${B}40;display:flex;align-items:center;gap:8px;">
          <i class="ti ti-player-play" style="font-size:16px;"></i> Executar Macro Agora
        </button>
      </div>`;

    // Overview com resultados
    const statsH = [
      { label:'Válidas',  value:valid,   color:'#16a34a', bg:'#f0fdf4', border:'#86efac', icon:'ti-circle-check' },
      { label:'Inválidas',value:invalid, color:'#dc2626', bg:'#fef2f2', border:'#fca5a5', icon:'ti-alert-circle' },
      { label:'Total',    value:total,   color:B,         bg:'#EFF6FF', border:'#93c5fd', icon:'ti-files' },
    ].map(s=>`
      <div style="background:${s.bg};border-radius:14px;border:1.5px solid ${s.border};padding:16px;display:flex;align-items:center;gap:12px;">
        <div style="width:38px;height:38px;border-radius:10px;background:white;display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 2px 6px ${s.color}25;">
          <i class="ti ${s.icon}" style="font-size:18px;color:${s.color};"></i>
        </div>
        <div>
          <div style="font-size:24px;font-weight:800;color:${s.color};line-height:1;">${s.value}</div>
          <div style="font-size:11px;color:${s.color};margin-top:2px;font-weight:600;">${s.label}</div>
        </div>
      </div>`).join('');
    const dataH = [
      ['Mutuário',sel.mutuario],['Valor',fmtBRL(sel.valor)],
      ['Programa',sel.programa],['Fase',sel.fase],
      ['Desembolso',sel.desembolso+'º'],['Avanço Obra',sel.obra],
      ['Tipo',sel.tipo],['Responsável',sel.responsavel],
    ].map(([k,v])=>`<div>
      <div style="font-size:9.5px;color:#94a3b8;font-weight:700;margin-bottom:2px;text-transform:uppercase;letter-spacing:.04em;">${k}</div>
      <div style="font-size:13px;color:#0f172a;font-weight:600;">${v}</div>
    </div>`).join('');
    const invBtn = invalid>0?`
      <button data-action="jump-invalid"
        style="width:100%;padding:10px;border-radius:11px;background:linear-gradient(135deg,#fee2e2,#fecaca);
          color:#991b1b;border:1.5px solid #fca5a5;font-weight:700;font-size:13px;cursor:pointer;
          display:flex;align-items:center;justify-content:center;gap:8px;margin-top:12px;">
        <i class="ti ti-alert-triangle" style="font-size:15px;"></i>
        Tratar ${invalid} validaç${invalid>1?'ões':'ão'} inválida${invalid>1?'s':''}
      </button>`:''
    return `
      <div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:14px;">${statsH}</div>
        <div style="background:white;border-radius:14px;border:1.5px solid #e2e8f0;padding:14px 18px;">
          <div style="font-size:10.5px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.07em;margin-bottom:10px;">Dados do Contrato</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:9px 24px;">${dataH}</div>
        </div>
        ${invBtn}
      </div>`;
  }

  const selV = VALIDATIONS.find(v=>v.id===sel2);
  return selV ? vCardDetailH(selV, cid) : '';
}

// ═══════════════════════════════════════════════════════════════════
//  DIALOG — MODAL COMPLETO
// ═══════════════════════════════════════════════════════════════════
function dialogH() {
  const idx = S.dialogIdx;
  if (idx===null) return '';
  const sel = CONTRACTS[idx];
  const cid = sel.id;
  const ran = S.macroRan[cid];
  const { valid, invalid, total } = getProg(cid);
  const pct = Math.round((valid/total)*100);
  const dec = S.decisions[cid];
  const ts  = TIPO_S[sel.tipo]||{};
  const approveOk = ran && invalid===0;

  const chips = [
    { icon:'ti-file',            label:sel.id,                     mono:true  },
    { icon:'ti-layout-grid',     label:sel.programa,               mono:false },
    { icon:'ti-flag',            label:'Fase: '+sel.fase,          mono:false },
    { icon:'ti-credit-card',     label:'Desembolso: '+sel.desembolso+'º', mono:false },
    { icon:'ti-currency-dollar', label:fmtBRL(sel.valor),          mono:false },
    { icon:'ti-percentage',      label:'Obra: '+sel.obra,          mono:false },
    { icon:'ti-user',            label:sel.responsavel,            mono:false },
  ].map(({icon,label,mono})=>`
    <span style="display:inline-flex;align-items:center;gap:4px;font-size:11.5px;color:#475569;
      background:#f8fafc;padding:3px 9px;border-radius:20px;border:1px solid #e2e8f0;">
      <i class="ti ${icon}" style="font-size:12px;color:#94a3b8;"></i>
      <span style="${mono?`font-family:monospace;font-weight:700;color:${B};`:''}">${label}</span>
    </span>`).join('');

  const prevBtnStyle = `width:28px;height:28px;border-radius:6px;border:1px solid #e2e8f0;background:white;
    display:flex;align-items:center;justify-content:center;font-size:13px;`;
  const navBtns = `
    <button data-action="nav" data-delta="-1" ${idx===0?'disabled':''} style="${prevBtnStyle}cursor:${idx===0?'default':'pointer'};color:${idx===0?'#cbd5e1':'#475569'};">←</button>
    <span style="font-size:11px;color:#94a3b8;font-weight:600;min-width:36px;text-align:center;">${idx+1} / ${CONTRACTS.length}</span>
    <button data-action="nav" data-delta="1" ${idx===CONTRACTS.length-1?'disabled':''} style="${prevBtnStyle}cursor:${idx===CONTRACTS.length-1?'default':'pointer'};color:${idx===CONTRACTS.length-1?'#cbd5e1':'#475569'};">→</button>`;

  const progressH = ran ? `
    <div style="margin-top:14px;display:flex;align-items:center;gap:10px;">
      <span style="font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.05em;flex-shrink:0;">Progresso</span>
      <div style="flex:1;height:7px;border-radius:4px;background:#e2e8f0;overflow:hidden;">
        <div style="height:100%;border-radius:4px;width:${pct}%;background:${invalid>0?'linear-gradient(90deg,#ef4444,#dc2626)':'linear-gradient(90deg,#22c55e,#16a34a)'};transition:width .5s;"></div>
      </div>
      <span style="font-size:12.5px;font-weight:800;color:${invalid>0?'#dc2626':pct===100?'#16a34a':B};flex-shrink:0;min-width:60px;text-align:right;">${valid}/${total} válidas</span>
      ${invalid>0?`<button data-action="jump-invalid" style="padding:3px 12px;border-radius:20px;background:#dc2626;color:white;border:none;font-size:11px;font-weight:700;cursor:pointer;flex-shrink:0;">↓ ${invalid} inválida${invalid>1?'s':''}</button>`:''}
    </div>` : '';

  const runBg  = ran?'#f1f5f9':B;
  const runClr = ran?'#64748b':'white';
  const runIco = ran?'ti-refresh':'ti-player-play';
  const runLbl = ran?'Reexecutar Macro':'Executar Macro';

  return `
    <div id="dlg-overlay" class="dialog-overlay" data-action="close-backdrop">
      <div style="background:white;border-radius:18px;width:100%;max-width:1160px;max-height:92vh;
        display:flex;flex-direction:column;box-shadow:0 32px 100px rgba(0,0,0,.4);overflow:hidden;">

        <!-- TOP BAR -->
        <div style="border-bottom:1px solid #e2e8f0;padding:11px 20px;display:flex;align-items:center;
          justify-content:space-between;flex-shrink:0;background:#f8fafc;">
          <div style="display:flex;align-items:center;gap:6px;font-size:12.5px;color:#64748b;">
            <span style="font-weight:700;color:#0f172a;">DesembolsoOps</span>
            <span style="color:#cbd5e1;">›</span>
            <span data-action="close-dlg" style="color:${B};font-weight:600;cursor:pointer;">Contratos</span>
            <span style="color:#cbd5e1;">›</span>
            <span style="font-family:monospace;font-weight:700;color:#0f172a;background:#EFF6FF;padding:1px 7px;border-radius:5px;">${sel.id}</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;">
            ${navBtns}
            <div style="width:1px;height:20px;background:#e2e8f0;margin:0 4px;"></div>
            <button data-action="close-dlg" style="width:30px;height:30px;border-radius:7px;border:1px solid #e2e8f0;background:white;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:15px;color:#64748b;">✕</button>
          </div>
        </div>

        <!-- TITLE -->
        <div style="padding:16px 22px 14px;border-bottom:1px solid #e2e8f0;flex-shrink:0;">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:16px;">
            <div style="flex:1;">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;flex-wrap:wrap;">
                ${bdgH(!ran?'pending':invalid>0?'invalid':'valid')}
                <span style="font-size:11.5px;font-weight:700;background:${ts.bg||'#f1f5f9'};color:${ts.color||'#64748b'};padding:3px 10px;border-radius:20px;">${sel.tipo}</span>
                ${dec?`<span style="font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;background:${dec==='approved'?'#dcfce7':'#fee2e2'};color:${dec==='approved'?'#166534':'#991b1b'};">${dec==='approved'?'✓ Aprovado':'✕ Recusado'}</span>`:''}
              </div>
              <h2 style="font-size:20px;font-weight:800;color:#0f172a;margin-bottom:10px;line-height:1.2;">${sel.mutuario}</h2>
              <div style="display:flex;gap:6px;flex-wrap:wrap;">${chips}</div>
            </div>
            <button data-action="run-contract" data-cid="${cid}" data-cidx="${idx}"
              style="padding:10px 20px;border-radius:11px;border:none;background:${runBg};color:${runClr};
                font-weight:700;font-size:12.5px;cursor:pointer;flex-shrink:0;transition:all .2s;
                display:flex;align-items:center;gap:7px;${!ran?`box-shadow:0 4px 14px ${B}35;`:''}">
              <i class="ti ${runIco}" style="font-size:14px;"></i>${runLbl}
            </button>
          </div>
          ${progressH}
        </div>

        <!-- BODY -->
        <div style="flex:1;display:grid;grid-template-columns:240px 1fr;overflow:hidden;min-height:0;">
          <!-- SIDEBAR -->
          <div style="border-right:1px solid #e2e8f0;overflow-y:auto;padding:12px 0 12px 8px;background:#fafafa;">
            ${dialogSidebarH(cid)}
          </div>
          <!-- PAINEL -->
          <div id="dlg-main" style="overflow-y:auto;padding:18px 22px;">
            ${dialogMainH(idx)}
          </div>
        </div>

        <!-- FOOTER -->
        <div style="height:54px;flex-shrink:0;border-top:1px solid #e2e8f0;background:white;
          display:flex;align-items:center;justify-content:space-between;padding:0 22px;">
          <div style="display:flex;gap:14px;align-items:center;">
            <span style="font-size:11px;color:#94a3b8;"><kbd style="background:#f1f5f9;border:1px solid #e2e8f0;border-radius:4px;padding:1px 6px;font-family:monospace;font-size:10px;">Esc</kbd> fechar</span>
            <span style="font-size:11px;color:#94a3b8;"><kbd style="background:#f1f5f9;border:1px solid #e2e8f0;border-radius:4px;padding:1px 6px;font-family:monospace;font-size:10px;">← →</kbd> navegar</span>
          </div>
          <div style="display:flex;gap:8px;">
            <button style="padding:7px 16px;border-radius:9px;border:1.5px solid #e2e8f0;background:white;color:#64748b;font-weight:600;font-size:12.5px;cursor:pointer;">Salvar rascunho</button>
            <button data-action="reject" data-cid="${cid}" style="padding:7px 18px;border-radius:9px;border:1.5px solid #fca5a5;background:#fef2f2;color:#991b1b;font-weight:700;font-size:12.5px;cursor:pointer;display:flex;align-items:center;gap:5px;">
              <i class="ti ti-x" style="font-size:12px;"></i>Recusar
            </button>
            <button data-action="approve" data-cid="${cid}"
              style="padding:7px 22px;border-radius:9px;border:none;
                background:${approveOk?`linear-gradient(135deg,${B},#3b82f6)`:'#e2e8f0'};
                color:${approveOk?'white':'#94a3b8'};font-weight:700;font-size:12.5px;
                cursor:${approveOk?'pointer':'default'};
                ${approveOk?`box-shadow:0 4px 14px ${B}40;`:''}
                display:flex;align-items:center;gap:6px;transition:all .2s;">
              <i class="ti ti-check" style="font-size:13px;"></i> Aprovar desembolso
            </button>
          </div>
        </div>
      </div>
    </div>`;
}

// ═══════════════════════════════════════════════════════════════════
//  RENDER PRINCIPAL
// ═══════════════════════════════════════════════════════════════════
function render() {
  const dateStr = new Date().toLocaleDateString('pt-BR',{weekday:'long',day:'2-digit',month:'long',year:'numeric'});
  document.getElementById('app').innerHTML = `
    <div style="min-height:100vh;background:#f1f5f9;font-family:'Inter',system-ui,sans-serif;color:#1e293b;">

      <!-- HEADER -->
      <div style="position:sticky;top:0;z-index:200;background:white;border-bottom:1px solid #e2e8f0;
        height:52px;padding:0 28px;display:flex;align-items:center;gap:12px;box-shadow:0 1px 4px rgba(0,0,0,.06);">
        <div style="width:32px;height:32px;border-radius:9px;background:linear-gradient(135deg,${B},#3b82f6);
          display:flex;align-items:center;justify-content:center;color:white;font-weight:900;font-size:14px;box-shadow:0 2px 8px ${B}40;">D</div>
        <div>
          <div style="font-weight:700;font-size:13.5px;color:#0f172a;line-height:1.1;">DesembolsoOps</div>
          <div style="font-size:10px;color:#94a3b8;">Sistema de Validação de Desembolsos</div>
        </div>
        <div style="flex:1;"></div>
        <div style="font-size:11.5px;color:#94a3b8;font-weight:500;">${dateStr}</div>
      </div>

      <!-- CONTEÚDO -->
      <div style="padding:24px 28px;">
        ${summaryCardH()}
        <div style="margin-bottom:14px;display:flex;align-items:center;justify-content:space-between;">
          <div>
            <h2 style="font-size:17px;font-weight:700;color:#0f172a;margin-bottom:3px;">Contratos do Dia</h2>
            <p style="font-size:12px;color:#94a3b8;">Clique em um contrato para abrir o painel de validação</p>
          </div>
          <span style="font-size:11.5px;color:#64748b;background:#f1f5f9;padding:4px 12px;border-radius:20px;font-weight:600;border:1px solid #e2e8f0;">${CONTRACTS.length} contratos</span>
        </div>
        ${contractsTableH()}
      </div>

      ${dialogH()}
    </div>`;
}

// ═══════════════════════════════════════════════════════════════════
//  AÇÕES DA MACRO
// ═══════════════════════════════════════════════════════════════════
function runForContract(cid, cidx) {
  const res = MOCK_MACRO[cidx % MOCK_MACRO.length];
  S.macroResults[cid] = res;
  S.macroRan[cid] = true;
  LEAF_IDS.forEach(id => {
    if (res[id] === 'invalid') S.cOpen[`${cid}_${id}`] = true;
  });
}

// ═══════════════════════════════════════════════════════════════════
//  EVENTOS
// ═══════════════════════════════════════════════════════════════════

// Keyboard (registrado uma vez)
document.addEventListener('keydown', e => {
  if (S.dialogIdx === null) return;
  if (e.target.tagName === 'TEXTAREA') return;
  if (e.key === 'Escape') { S.dialogIdx = null; render(); attachEvents(); }
  else if (e.key === 'ArrowLeft' && S.dialogIdx > 0) {
    S.dialogIdx--; S.dialogSel = '__overview__'; render(); attachEvents();
  } else if (e.key === 'ArrowRight' && S.dialogIdx < CONTRACTS.length - 1) {
    S.dialogIdx++; S.dialogSel = '__overview__'; render(); attachEvents();
  }
});

// Click delegation (re-attached após cada render)
let clickHandler = null;
let inputHandler = null;

function attachEvents() {
  const app = document.getElementById('app');
  if (!app) return;

  if (clickHandler) app.removeEventListener('click', clickHandler);
  if (inputHandler) app.removeEventListener('input', inputHandler);

  clickHandler = function(e) {
    const el = e.target.closest('[data-action]');
    if (!el) return;
    const a = el.dataset.action;

    if (a === 'open-dialog') {
      S.dialogIdx = parseInt(el.dataset.idx);
      S.dialogSel = '__overview__';
      render(); attachEvents();
    }
    else if (a === 'close-dlg' || a === 'close-backdrop') {
      if (a === 'close-backdrop' && e.target !== el) return;
      S.dialogIdx = null;
      render(); attachEvents();
    }
    else if (a === 'nav') {
      const next = S.dialogIdx + parseInt(el.dataset.delta);
      if (next >= 0 && next < CONTRACTS.length) { S.dialogIdx = next; S.dialogSel = '__overview__'; }
      render(); attachEvents();
    }
    else if (a === 'run-global') {
      if (S.globalMacro === 'running') return;
      S.globalMacro = 'running';
      render(); attachEvents();
      setTimeout(() => {
        CONTRACTS.forEach((c,i) => runForContract(c.id, i));
        S.globalMacro = 'done';
        render(); attachEvents();
        setTimeout(() => { S.globalMacro = 'idle'; render(); attachEvents(); }, 3500);
      }, 2000);
    }
    else if (a === 'run-contract') {
      runForContract(el.dataset.cid, parseInt(el.dataset.cidx));
      render(); attachEvents();
    }
    else if (a === 'select-val') {
      S.dialogSel = el.dataset.vid;
      render(); attachEvents();
    }
    else if (a === 'toggle-cmt') {
      const key = `${el.dataset.cid}_${el.dataset.leaf}`;
      S.cOpen[key] = !S.cOpen[key];
      render(); attachEvents();
    }
    else if (a === 'jump-invalid') {
      const cid = CONTRACTS[S.dialogIdx].id;
      const fst = VALIDATIONS.find(v => getVSt(v,cid) === 'invalid');
      if (fst) { S.dialogSel = fst.id; render(); attachEvents(); }
    }
    else if (a === 'set-pill') {
      const { cid, leaf, pill } = el.dataset;
      const cur = getCmt(cid, leaf).classification;
      setCmt(cid, leaf, 'classification', cur===pill ? null : pill);
      render(); attachEvents();
    }
    else if (a === 'save-cmt') {
      el.textContent = '✓ Salvo!';
      el.style.background = '#16a34a';
      setTimeout(() => { el.textContent = '✓ Salvar'; el.style.background = B; }, 1800);
    }
    else if (a === 'approve') {
      const cid = el.dataset.cid;
      const { invalid } = getProg(cid);
      if (S.macroRan[cid] && invalid === 0) {
        S.decisions[cid] = 'approved'; S.dialogIdx = null;
        render(); attachEvents();
      }
    }
    else if (a === 'reject') {
      S.decisions[el.dataset.cid] = 'rejected'; S.dialogIdx = null;
      render(); attachEvents();
    }
  };

  inputHandler = function(e) {
    const el = e.target.closest('[data-action="cmt-input"]');
    if (!el) return;
    const { cid, leaf } = el.dataset;
    setCmt(cid, leaf, 'comment', el.value);
    const saveRow = el.closest('.treatment-box')?.querySelector('.save-row');
    if (saveRow) saveRow.style.display = el.value ? 'flex' : 'none';
  };

  app.addEventListener('click', clickHandler);
  app.addEventListener('input', inputHandler);
}

// ═══════════════════════════════════════════════════════════════════
//  INICIALIZAÇÃO
// ═══════════════════════════════════════════════════════════════════
render();
attachEvents();
