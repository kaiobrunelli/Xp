// Mock data for the disbursement macro tool.

const BRL = (n) =>
  n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 });

const DISBURSEMENTS = [
  {
    id: 'DSB-001',
    contrato: '0109.2024.00123-4',
    beneficiario: 'João Mendes Silva',
    valor: 45000,
    fase: '2ª Medição',
    validacoes: { ok: 7, total: 10 },
    status: 'pendente',
  },
  {
    id: 'DSB-002',
    contrato: '0109.2024.00456-1',
    beneficiario: 'Maria Aparecida Lima',
    valor: 32500,
    fase: '3ª Medição',
    validacoes: { ok: 10, total: 10 },
    status: 'aprovado',
  },
  {
    id: 'DSB-003',
    contrato: '0109.2024.00789-9',
    beneficiario: 'Carlos Eduardo Moura',
    valor: 60000,
    fase: '1ª Medição',
    validacoes: { ok: 5, total: 10 },
    status: 'pendencia',
  },
  {
    id: 'DSB-004',
    contrato: '0109.2024.01023-7',
    beneficiario: 'Fernanda Costa Reis',
    valor: 28750,
    fase: 'Final',
    validacoes: { ok: 8, total: 10 },
    status: 'pendente',
  },
  {
    id: 'DSB-005',
    contrato: '0109.2024.01245-8',
    beneficiario: 'Ricardo Alves Pinto',
    valor: 55200,
    fase: '2ª Medição',
    validacoes: { ok: 6, total: 10 },
    status: 'pendencia',
  },
  {
    id: 'DSB-006',
    contrato: '0109.2024.01567-2',
    beneficiario: 'Patrícia Souza Nunes',
    valor: 41000,
    fase: '1ª Medição',
    validacoes: { ok: 9, total: 10 },
    status: 'pendente',
  },
];

const CONTRACT_DSB001 = {
  id: 'DSB-001',
  contrato: '0109.2024.00123-4',
  beneficiario: {
    nome: 'João Mendes Silva',
    cpf: '111.100.136-71',
    nascimento: '15/06/1985',
    renda: 4200,
    telefone: '(31) 99712-3344',
  },
  financiamento: {
    programa: 'MCMV Classe Média',
    valorImovel: 285000,
    valorFinanciamento: 240000,
    numeroDesembolso: '2º',
    fase: '2ª Medição',
    pctObra: 42,
    amortizacao: 'PRICE / TR',
  },
  tags: [
    { label: 'FGTS', value: '3+ anos', icon: 'Wallet' },
    { label: 'Comprador único', value: 'Sim', icon: 'User' },
    { label: 'Benefício governo', value: 'Nunca utilizou', icon: 'ShieldCheck' },
    { label: 'Outro imóvel', value: 'Não possui', icon: 'Building2' },
  ],
};

// 10 validations for DSB-001.
const VALIDATIONS = [
  {
    n: 1,
    titulo: 'Certidão Negativa de Débitos Municipais',
    resultado: 'CND Municipal válida até 08/11/2025.',
    status: 'valido',
    icon: 'Receipt',
    detalhe:
      'CND Municipal emitida em 08/05/2025, válida até 08/11/2025. Nenhum débito identificado perante a Prefeitura.',
  },
  {
    n: 2,
    titulo: 'Certidão Negativa de Débitos Previdenciários (INSS)',
    resultado: 'Situação regular — emitida 03/05/2025.',
    status: 'valido',
    icon: 'ShieldCheck',
    detalhe:
      'CND Previdenciária emitida em 03/05/2025, dentro do prazo de validade de 180 dias. Situação regular perante o INSS.',
  },
  {
    n: 3,
    titulo: 'Percentual de Desembolso',
    resultado: '2 de 3 sub-validações com pendência.',
    status: 'invalido',
    icon: 'Percent',
    detalhe:
      'Análise do percentual solicitado em relação ao avanço físico da obra e ao cronograma financeiro aprovado.',
    subitems: [
      {
        n: '3a',
        titulo: 'É o último desembolso do contrato?',
        status: 'invalido',
        detalhe:
          'Este não é o último desembolso previsto. Existem 2 desembolsos remanescentes no cronograma físico-financeiro.',
      },
      {
        n: '3b',
        titulo: 'O desembolso atingiu o percentual mínimo exigido?',
        status: 'invalido',
        detalhe:
          'O percentual solicitado é de 18%, porém o avanço físico medido é de 12%. A diferença de 6% está fora da tolerância permitida de 5%.',
      },
      {
        n: '3c',
        titulo: 'O valor solicitado é compatível com a fase da obra?',
        status: 'valido',
        detalhe:
          'Valor de R$ 45.000,00 está dentro do limite aprovado para 2ª Medição (máx. R$ 52.000,00 conforme cronograma).',
      },
    ],
  },
  {
    n: 4,
    titulo: 'Número do Desembolso',
    resultado: '2º desembolso — sequência consistente.',
    status: 'valido',
    icon: 'ListChecks',
    detalhe:
      'Este é o 2º desembolso do contrato. Sequência de desembolsos está consistente com o cronograma físico-financeiro aprovado.',
  },
  {
    n: 5,
    titulo: 'Situação Cadastral do Beneficiário',
    resultado: 'CPF ativo, sem restrições.',
    status: 'valido',
    icon: 'User',
    detalhe:
      'CPF 111.100.136-71 ativo na Receita Federal. Sem restrições cadastrais identificadas nos sistemas internos.',
  },
  {
    n: 6,
    titulo: 'Aprovação de Medição pelo Engenheiro',
    resultado: '2 de 3 sub-validações com pendência.',
    status: 'invalido',
    icon: 'HardHat',
    detalhe:
      'Verificação dos documentos de medição emitidos pelo engenheiro responsável pela obra.',
    subitems: [
      {
        n: '6a',
        titulo: 'Laudo de medição assinado pelo engenheiro responsável?',
        status: 'invalido',
        detalhe:
          'Documento de medição não localizado no sistema. Upload necessário para prosseguir com a análise.',
      },
      {
        n: '6b',
        titulo: 'Laudo fotográfico da obra está anexado?',
        status: 'valido',
        detalhe:
          '12 fotos anexadas em 10/05/2025 pelo engenheiro Marcos Vieira — CREA 45.678/MG.',
      },
      {
        n: '6c',
        titulo: 'Percentual físico da obra é compatível com a medição?',
        status: 'invalido',
        detalhe:
          'Medição registra 42% de avanço físico, porém o sistema SIOPI registra 38%. Divergência de 4% requer justificativa.',
      },
    ],
  },
  {
    n: 7,
    titulo: 'Situação do FGTS do Beneficiário',
    resultado: '4 anos e 3 meses de contribuição.',
    status: 'valido',
    icon: 'Wallet',
    detalhe:
      'Extrato FGTS verificado. Tempo de contribuição: 4 anos e 3 meses. Beneficiário elegível para uso do FGTS.',
  },
  {
    n: 8,
    titulo: 'Limite de Prazo do Contrato',
    resultado: 'Prazo extrapolado em 46 dias.',
    status: 'invalido',
    icon: 'CalendarClock',
    detalhe:
      'Data prevista para conclusão da obra: 15/08/2025. O contrato prevê prazo máximo até 30/06/2025. Prazo extrapolado em 46 dias.',
    prefilledComment: {
      tipo: 'negativo',
      texto:
        'Prazo contratual expirado. Necessário aditivo de prazo antes de prosseguir com o desembolso.',
      autor: 'KS',
      timestamp: '14/05/2025 09:52',
    },
  },
  {
    n: 9,
    titulo: 'Regularidade Fiscal da Construtora (Receita Federal)',
    resultado: '3 de 3 sub-validações válidas.',
    status: 'valido',
    icon: 'Landmark',
    detalhe:
      'Verificações cruzadas junto à Receita Federal e PGFN sobre a construtora responsável pela obra.',
    subitems: [
      {
        n: '9a',
        titulo: 'CNPJ ativo na Receita Federal?',
        status: 'valido',
        detalhe:
          'CNPJ 12.345.678/0001-90 ativo. Situação: ATIVA desde 14/03/2008.',
      },
      {
        n: '9b',
        titulo: 'Construtora sem débitos na Dívida Ativa da União?',
        status: 'valido',
        detalhe:
          'Nenhum débito encontrado na consulta à PGFN realizada em 13/05/2025.',
      },
      {
        n: '9c',
        titulo: 'Certidão FGTS da empresa está válida?',
        status: 'valido',
        detalhe:
          'CRF (Certidão de Regularidade do FGTS) válida até 30/09/2025. Emitida em 01/04/2025.',
      },
    ],
  },
  {
    n: 10,
    titulo: 'Regularidade Trabalhista da Construtora',
    resultado: 'CRT válida — emitida 01/05/2025.',
    status: 'valido',
    icon: 'Briefcase',
    detalhe:
      'CNPJ 12.345.678/0001-90 — Construtora São Jorge Ltda. Certidão de Regularidade Trabalhista válida, emitida em 01/05/2025.',
  },
];

window.MOCK = { BRL, DISBURSEMENTS, CONTRACT_DSB001, VALIDATIONS };
