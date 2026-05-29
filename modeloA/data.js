'use strict';

// ─── Cor principal ────────────────────────────────────────────────────────────
const B = '#005CA9';

// ─── Contratos ────────────────────────────────────────────────────────────────
const CONTRACTS = [
  { id:'DSB-001', mutuario:'Maria Santos Silva',      valor:2450000, tipo:'Habitação',      programa:'MCMV Classe Média',  fase:'1ª Medição', desembolso:'1º', responsavel:'Karina Souto', obra:'38%' },
  { id:'DSB-002', mutuario:'Construtora ABC Ltda',    valor:8750000, tipo:'Saneamento',     programa:'PAC Saneamento',      fase:'3ª Medição', desembolso:'3º', responsavel:'Rafael Costa',  obra:'72%' },
  { id:'DSB-003', mutuario:'João Mendes Silva',       valor:60000,   tipo:'Habitação',      programa:'MCMV Classe Média',  fase:'2ª Medição', desembolso:'2º', responsavel:'Karina Souto', obra:'42%' },
  { id:'DSB-004', mutuario:'Infraestrutura DEF Eng.', valor:3200000, tipo:'Infraestrutura', programa:'PAC Infraestrutura', fase:'1ª Medição', desembolso:'1º', responsavel:'Marcos Lima',   obra:'15%' },
  { id:'DSB-005', mutuario:'Saneamento XYZ S.A.',     valor:5100000, tipo:'Saneamento',     programa:'PAC Saneamento',      fase:'2ª Medição', desembolso:'2º', responsavel:'Rafael Costa',  obra:'55%' },
  { id:'DSB-006', mutuario:'Empreiteira GHI Ltda',    valor:1850000, tipo:'Habitação',      programa:'PMCMV Faixa 2',      fase:'4ª Medição', desembolso:'4º', responsavel:'Ana Oliveira',  obra:'91%' },
];

// ─── Validações ───────────────────────────────────────────────────────────────
const VALIDATIONS = [
  { id:'v1',  num:'01', icon:'ti-file-certificate', label:'Certidão Negativa de Débitos Municipais',             type:'bool' },
  { id:'v2',  num:'02', icon:'ti-shield-check',     label:'Certidão Negativa de Débitos Previdenciários (INSS)', type:'bool' },
  { id:'v3',  num:'03', icon:'ti-percentage',       label:'Percentual de Desembolso',                            type:'group',
    children:[
      { id:'v3a', num:'3a', label:'É o último desembolso do contrato?' },
      { id:'v3b', num:'3b', label:'O desembolso atingiu o percentual mínimo exigido?' },
      { id:'v3c', num:'3c', label:'O valor solicitado é compatível com a fase da obra?' },
    ]},
  { id:'v4',  num:'04', icon:'ti-list-numbers',  label:'Número do Desembolso',                    type:'text' },
  { id:'v5',  num:'05', icon:'ti-user-check',    label:'Situação Cadastral do Beneficiário',       type:'bool' },
  { id:'v6',  num:'06', icon:'ti-tools',         label:'Aprovação de Medição pelo Engenheiro',     type:'group',
    children:[
      { id:'v6a', num:'6a', label:'ART / RRT emitida e registrada no CREA / CAU' },
      { id:'v6b', num:'6b', label:'Relatório de vistoria técnica emitido e aprovado' },
      { id:'v6c', num:'6c', label:'Medição do período aprovada pelo fiscal' },
    ]},
  { id:'v7',  num:'07', icon:'ti-bolt',          label:'Situação do FGTS do Beneficiário',         type:'bool' },
  { id:'v8',  num:'08', icon:'ti-clock',         label:'Limite de Prazo do Contrato',              type:'group',
    children:[
      { id:'v8a', num:'8a', label:'Parcelas de amortização em dia' },
      { id:'v8b', num:'8b', label:'Sem pendências cadastrais em aberto' },
      { id:'v8c', num:'8c', label:'Prazo contratual vigente' },
    ]},
  { id:'v9',  num:'09', icon:'ti-building',      label:'Regularidade Fiscal da Construtora',       type:'bool' },
  { id:'v10', num:'10', icon:'ti-briefcase',     label:'Regularidade Trabalhista da Construtora',  type:'bool' },
];

// IDs folha (não-grupo)
const LEAF_IDS = [];
VALIDATIONS.forEach(v => {
  if (v.type === 'group') v.children.forEach(c => LEAF_IDS.push(c.id));
  else LEAF_IDS.push(v.id);
});

// Resultados mock da macro
const mk = (inv) => Object.fromEntries(LEAF_IDS.map(id => [id, inv.includes(id) ? 'invalid' : 'valid']));
const MOCK_MACRO = [
  mk(['v3b','v6b']),
  mk(['v2','v3c','v7']),
  mk(['v3a','v3b','v6b']),
  mk(['v8c']),
  mk(['v1','v3b','v6c','v8a']),
  mk([]),
];

// Textos de resultado
const MT = {
  valid: {
    v1:'CND Municipal válida até 08/11/2025.', v2:'CRP — situação regular, emitida em 03/05/2025.',
    v3a:'Este é o último desembolso previsto no cronograma.', v3b:'Percentual solicitado dentro da tolerância de 5%.',
    v3c:'Valor compatível com a fase atual da obra.', v4:'2º desembolso — sequência consistente.',
    v5:'CPF ativo, sem restrições cadastrais.', v6a:'ART nº 2024/0045123 registrada no CREA-MG.',
    v6b:'Relatório de vistoria emitido e aprovado em 10/05/2025.', v6c:'Medição aprovada pelo fiscal Eng. Carlos Lima.',
    v7:'FGTS regular — CRF vigente até 30/06/2025.', v8a:'Parcelas em dia. Nenhum atraso registrado.',
    v8b:'Sem pendências cadastrais no sistema.', v8c:'Prazo vigente até 30/12/2025.',
    v9:'Certidão de regularidade fiscal vigente.', v10:'CNDT válida — sem débitos trabalhistas.',
  },
  invalid: {
    v1:'CND Municipal vencida em 01/03/2025. Necessária renovação.',
    v2:'Irregularidade previdenciária — débito de R$ 12.400 em aberto.',
    v3a:'Existem 2 desembolsos remanescentes no cronograma físico-financeiro.',
    v3b:'Percentual solicitado (18%) excede avanço físico medido (12%). Diferença de 6% acima da tolerância de 5%.',
    v3c:'Valor solicitado (R$ 60.000) incompatível. Previsto pela fase: R$ 45.000.',
    v4:'Número inconsistente. Sistema registra 1º; solicitante indica 2º.',
    v5:'CPF com restrição cadastral ativa no sistema.',
    v6a:'ART não localizada no CREA. Necessária regularização.',
    v6b:'Relatório de vistoria não apresentado ou desatualizado.',
    v6c:'Medição pendente de aprovação do fiscal responsável.',
    v7:'FGTS irregular — CRF vencida em 15/04/2025.',
    v8a:'Parcela de 04/2025 em atraso — R$ 1.240.',
    v8b:'Pendência cadastral: atualização de endereço necessária.',
    v8c:'Prazo vencido em 30/04/2025. Prorrogação necessária.',
    v9:'Certidão fiscal vencida — construtora com débitos federais.',
    v10:'CNDT negativa — ação trabalhista em andamento.',
  }
};

// Status UI
const SUI = {
  valid:   { label:'Válido',   color:'#166534', bg:'#dcfce7', border:'#86efac', dot:'#16a34a' },
  invalid: { label:'Inválido', color:'#991b1b', bg:'#fee2e2', border:'#fca5a5', dot:'#dc2626' },
  pending: { label:'Pendente', color:'#475569', bg:'#f1f5f9', border:'#e2e8f0', dot:'#94a3b8' },
};

const PILLS = [
  { v:'positive',    label:'Positivo',    color:'#166534', bg:'#dcfce7', border:'#86efac' },
  { v:'informative', label:'Informativo', color:'#004F97', bg:'#dbeafe', border:'#93c5fd' },
  { v:'negative',    label:'Negativo',    color:'#991b1b', bg:'#fee2e2', border:'#fca5a5' },
];

const TIPO_S = {
  'Habitação':      { bg:'#EFF8FF', color:'#1558A0' },
  'Saneamento':     { bg:'#EDFBF3', color:'#14643A' },
  'Infraestrutura': { bg:'#FFFBEA', color:'#7A5200' },
};

const fmtBRL = (v) => v.toLocaleString('pt-BR', { style:'currency', currency:'BRL', minimumFractionDigits:0 });
