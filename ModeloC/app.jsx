// ModeloC — Home2 (Lista estilo ClickUp com hero escuro).
// Dialog de detalhe abre inline (gerenciado pelo próprio Home2View).
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
    const map = { home: '../ModeloB/', home3: '../ModeloD/', home4: '../ModeloE/' };
    if (map[key]) window.location.href = map[key];
  };

  return (
    <div className="min-h-screen">
      <UI.TopBar onLogo={() => {}} currentView="home2" onNavigate={navigate} />
      <Home2View
        loading={loading}
        runMacro={runMacro}
        lastRun={lastRun}
        processing={processing}
      />
      <footer className="mx-auto max-w-[1400px] px-6 py-6 text-center text-[11.5px] text-ink-500">
        Macro de Desembolsos · ModeloC — Home2 Lista ClickUp
      </footer>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
