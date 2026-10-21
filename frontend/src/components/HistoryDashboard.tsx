import { useState, useEffect } from 'react';
import type { FC, MouseEvent } from 'react';
import { 
  History, 
  Trash2, 
  Eye, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  Search, 
  ArrowRight,
  Activity
} from 'lucide-react';
import { historyService } from '../services/historyService';
import type { AnalysisHistoryEntry, AnalysisResult } from '../types';

interface HistoryDashboardProps {
  onSelectResult: (result: AnalysisResult) => void;
  onNewAnalysis: () => void;
}

export const HistoryDashboard: FC<HistoryDashboardProps> = ({
  onSelectResult,
  onNewAnalysis
}) => {
  const [historyItems, setHistoryItems] = useState<AnalysisHistoryEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    setHistoryItems(historyService.getHistory());
  };

  const handleDelete = (id: string, e: MouseEvent) => {
    e.stopPropagation();
    historyService.deleteEntry(id);
    loadHistory();
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear your local analysis history?')) {
      historyService.clearHistory();
      loadHistory();
    }
  };

  const handleViewItem = (id: string) => {
    const full = historyService.getFullResult(id);
    if (full) {
      onSelectResult(full);
    } else {
      alert('Detailed cache for this scan has expired. Please run a new scan.');
    }
  };

  const filteredItems = historyItems.filter((item) => {
    const matchesSearch = item.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.resultCategory === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'forensic_signal_analysis':
        return {
          label: 'Signal Forensics',
          icon: Activity,
          class: 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40'
        };
      case 'potentially_manipulated':
        return {
          label: 'Manipulated',
          icon: AlertTriangle,
          class: 'bg-red-950/80 text-red-300 border border-red-500/40'
        };
      case 'no_strong_signs':
        return {
          label: 'No Strong Signs',
          icon: CheckCircle2,
          class: 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
        };
      case 'inconclusive':
      default:
        return {
          label: 'Inconclusive',
          icon: HelpCircle,
          class: 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
        };
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-cyan-950/60 text-cyan-300 border border-cyan-800/40 mb-2">
            <History className="w-3.5 h-3.5" />
            <span>Local Storage Log</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-heading">
            Audit Scan History
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Browse and review previous media analyses conducted on this device.
          </p>
        </div>

        {historyItems.length > 0 && (
          <button
            onClick={handleClearAll}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-red-400 hover:bg-red-950/30 border border-slate-800 hover:border-red-900 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search scans by file name..."
            className="w-full bg-slate-900/60 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Scans' },
            { id: 'potentially_manipulated', label: 'Manipulated' },
            { id: 'no_strong_signs', label: 'No Strong Signs' },
            { id: 'inconclusive', label: 'Inconclusive' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCategoryFilter(tab.id)}
              className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                categoryFilter === tab.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-slate-900/40 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* History Items List */}
      {filteredItems.length === 0 ? (
        <div className="glass-card rounded-2xl border border-slate-800 p-12 text-center bg-slate-900/30">
          <History className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">
            {historyItems.length === 0 ? 'No analyses logged yet' : 'No matching scans found'}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6">
            {historyItems.length === 0
              ? 'Files analyzed in the studio will be securely logged in your local browser storage.'
              : 'Try clearing your search query or selecting a different category filter.'}
          </p>
          <button
            onClick={onNewAnalysis}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 shadow-md cursor-pointer"
          >
            <span>Start First Analysis</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => {
            const badge = getCategoryBadge(item.resultCategory);
            const BadgeIcon = badge.icon;
            return (
              <div
                key={item.id}
                onClick={() => handleViewItem(item.id)}
                className="glass-card glass-card-hover rounded-xl border border-slate-800 bg-slate-900/50 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer group"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-white truncate max-w-xs group-hover:text-cyan-300 transition-colors">
                      {item.fileName}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 bg-black/40 px-2 py-0.5 rounded border border-slate-800">
                      {item.id}
                    </span>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${badge.class}`}>
                      <BadgeIcon className="w-3 h-3" />
                      {badge.label}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 truncate max-w-lg">
                    {item.summary}
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
                    <span>{item.analyzedAt}</span>
                    <span>•</span>
                    <span className="uppercase">{item.fileType}</span>
                    {item.confidenceScore !== null && (
                      <>
                        <span>•</span>
                        <span className="text-cyan-400">Score: {item.confidenceScore.toFixed(1)}%</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    onClick={() => handleViewItem(item.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 group-hover:border-cyan-500/40 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-cyan-400" />
                    <span>View Audit</span>
                  </button>

                  <button
                    onClick={(e) => handleDelete(item.id, e)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/30 transition-colors cursor-pointer"
                    title="Delete record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
