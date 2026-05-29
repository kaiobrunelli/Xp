// ModeloE — Home4 (Modo Foco / Triage — análise contrato a contrato).
// Teclado: J/K ou setas para navegar, A aprovar, R recusar, S adiar.
// TopBar navega para os outros modelos.

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(t);
  }, []);

  const navigate = (key) => {
    const map = { home: '../ModeloB/', home2: '../ModeloC/', home3: '../ModeloD/' };
    if (map[key]) window.location.href = map[key];
  };

  return (
    <div className="min-h-screen">
      <UI.TopBar onLogo={() => {}} currentView="home4" onNavigate={navigate} />
      <Home4View loading={loading} />
      <footer className="mx-auto max-w-[1400px] px-6 py-6 text-center text-[11.5px] text-ink-500">
        Macro de Desembolsos · ModeloE — Home4 Modo Foco
      </footer>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
