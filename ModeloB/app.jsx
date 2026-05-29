// ModeloB — Home (Dashboard com tabela e stats).
// Clique na linha → abre DetailView (slide-in).
// TopBar navega para os outros modelos.

function App() {
  const [view, setView] = useState({ name: 'home' });
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

  const openDetail = () => {
    setView({ name: 'detail' });
    window.scrollTo({ top: 0, behavior: 'instant' });
  };
  const back = () => {
    setView({ name: 'home' });
    window.scrollTo({ top: 0, behavior: 'instant' });
  };
  const navigate = (key) => {
    const map = { home2: '../ModeloC/', home3: '../ModeloD/', home4: '../ModeloE/' };
    if (map[key]) window.location.href = map[key];
  };

  return (
    <div className="min-h-screen">
      <UI.TopBar onLogo={back} currentView="home" onNavigate={navigate} />
      {view.name === 'home' && (
        <HomeView
          onOpenDetail={openDetail}
          loading={loading}
          runMacro={runMacro}
          lastRun={lastRun}
          processing={processing}
        />
      )}
      {view.name === 'detail' && <DetailView onBack={back} />}
      <footer className="mx-auto max-w-[1400px] px-6 py-6 text-center text-[11.5px] text-ink-500">
        Macro de Desembolsos · ModeloB — Home Dashboard
      </footer>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
