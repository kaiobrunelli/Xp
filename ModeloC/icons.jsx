// Lucide icon React wrappers — keeps JSX clean.
// Lucide UMD exposes `lucide.icons` with PascalCase keys.
const L = window.lucide;

function makeIcon(name) {
  const node = L && L.icons && L.icons[name];
  return function Icon({ size = 16, className = '', strokeWidth = 2, color = 'currentColor', ...rest }) {
    if (!node) return null;
    // Lucide nodes can be either [tag, attrs, children] OR an array of [tag, attrs] child tuples
    // depending on UMD version. Normalize: detect children as either node[2] or the node itself.
    let children;
    if (Array.isArray(node[0])) {
      // node is itself an array of child tuples
      children = node;
    } else {
      children = node[2] || [];
    }
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
        {...rest}
      >
        {children.map((c, i) => {
          const [t, a] = c;
          return React.createElement(t, { key: i, ...a });
        })}
      </svg>
    );
  };
}

const Icon = {
  ChevronDown:     makeIcon('ChevronDown'),
  ChevronRight:    makeIcon('ChevronRight'),
  ChevronLeft:     makeIcon('ChevronLeft'),
  CheckCircle:     makeIcon('CheckCircle2'),
  XCircle:         makeIcon('XCircle'),
  AlertTriangle:   makeIcon('AlertTriangle'),
  Check:           makeIcon('Check'),
  X:               makeIcon('X'),
  MessageSquare:   makeIcon('MessageSquare'),
  FileText:        makeIcon('FileText'),
  Home:            makeIcon('Home'),
  ArrowLeft:       makeIcon('ArrowLeft'),
  ArrowRight:      makeIcon('ArrowRight'),
  User:            makeIcon('User'),
  Users:           makeIcon('Users'),
  Building2:       makeIcon('Building2'),
  Briefcase:       makeIcon('Briefcase'),
  Calendar:        makeIcon('Calendar'),
  Clock:           makeIcon('Clock'),
  Search:          makeIcon('Search'),
  Filter:          makeIcon('Filter'),
  Play:            makeIcon('Play'),
  Pause:           makeIcon('Pause'),
  RefreshCw:       makeIcon('RefreshCw'),
  Settings:        makeIcon('Settings'),
  Bell:            makeIcon('Bell'),
  LayoutDashboard: makeIcon('LayoutDashboard'),
  FolderOpen:      makeIcon('FolderOpen'),
  ListChecks:      makeIcon('ListChecks'),
  HelpCircle:      makeIcon('HelpCircle'),
  Info:            makeIcon('Info'),
  ThumbsUp:        makeIcon('ThumbsUp'),
  ThumbsDown:      makeIcon('ThumbsDown'),
  Plus:            makeIcon('Plus'),
  Download:        makeIcon('Download'),
  MoreHorizontal:  makeIcon('MoreHorizontal'),
  Loader:          makeIcon('Loader2'),
  TrendingUp:      makeIcon('TrendingUp'),
  CircleAlert:     makeIcon('AlertCircle'),
  Edit3:           makeIcon('Edit3'),
  ShieldCheck:     makeIcon('ShieldCheck'),
  Receipt:         makeIcon('Receipt'),
  HardHat:         makeIcon('HardHat'),
  Percent:         makeIcon('Percent'),
  Wallet:          makeIcon('Wallet'),
  Landmark:        makeIcon('Landmark'),
  Camera:          makeIcon('Camera'),
  CalendarClock:   makeIcon('CalendarClock'),
  FileCheck2:      makeIcon('FileCheck2'),
  Sparkles:        makeIcon('Sparkles'),
  Star:            makeIcon('Star'),
  Inbox:           makeIcon('Inbox'),
  CalendarDays:    makeIcon('CalendarDays'),
  Hash:            makeIcon('Hash'),
  ChevronsUpDown:  makeIcon('ChevronsUpDown'),
  LayoutGrid:      makeIcon('LayoutGrid'),
  Kanban:          makeIcon('Kanban'),
  Table2:          makeIcon('Table2'),
  Maximize2:       makeIcon('Maximize2'),
  Minimize2:       makeIcon('Minimize2'),
  ExternalLink:    makeIcon('ExternalLink'),
  PanelLeftClose:  makeIcon('PanelLeftClose'),
  PanelLeftOpen:   makeIcon('PanelLeftOpen'),
  Flag:            makeIcon('Flag'),
  Tag:             makeIcon('Tag'),
  Slash:           makeIcon('Slash'),
  Eye:             makeIcon('Eye'),
  Folder:          makeIcon('Folder'),
  CircleDot:       makeIcon('CircleDot'),
  Activity:        makeIcon('Activity'),
  Paperclip:       makeIcon('Paperclip'),
};

window.Icon = Icon;
