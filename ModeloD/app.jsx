// ModeloD — Home3 (Tabela compacta + Dialog modal inline).
// Dialog de detalhe abre inline (gerenciado pelo próprio Home3View).
// TopBar navega para os outros modelos.

function App() {
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [lastRun, setLastRun] = useState('14/05/2025 às 09:41');

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(t);
  }, []);

  const runMacro = () => {
    setProcessing(true);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setProcessing(false);
      setLastRun(
        new Date().toLocaleString('pt-BR', {
          day: '2-digit', month: '2-digit', year: 'numeric',
          hour: '2-digit', minute: '2-digit',
        }).replace(',', ' às')
      );
    }, 1800);
  };

  const navigate = (key) => {
    const map = { home: '../ModeloB/', home2: '../ModeloC/', home4: '../ModeloE/' };
    if (map[key]) window.location.href = map[key];
  };

  return (
    <div className="min-h-screen">
      <UI.TopBar onLogo={() => {}} currentView="home3" onNavigate={navigate} />
      <Home3View
        loading={loading}
        runMacro={runMacro}
        lastRun={lastRun}
        processing={processing}
      />
      <footer className="mx-auto max-w-[1400px] px-6 py-6 text-center text-[11.5px] text-ink-500">
        Macro de Desembolsos · ModeloD — Home3 Tabela + Dialog
      </footer>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
