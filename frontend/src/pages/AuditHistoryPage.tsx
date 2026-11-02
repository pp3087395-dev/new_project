import { useState } from 'react';
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
  Activity,
  FolderOpen,
  Scan,
  ShieldCheck
} from 'lucide-react';
import { historyService } from '../services/historyService';
import type { AnalysisHistoryEntry, AnalysisResult } from '../types';

interface AuditHistoryPageProps {
  onNavigate: (route: string) => void;
  onSelectResult: (result: AnalysisResult) => void;
}

export const AuditHistoryPage: FC<AuditHistoryPageProps> = ({
  onNavigate,
  onSelectResult
}) => {
  const [historyItems, setHistoryItems] = useState<AnalysisHistoryEntry[]>(() => historyService.getHistory());
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const loadHistory = () => {
    setHistoryItems(historyService.getHistory());
  };

  const handleDelete = (id: string, e: MouseEvent) => {
    e.stopPropagation();
    historyService.deleteEntry(id);
    loadHistory();
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear your local forensic analysis history?')) {
      historyService.clearHistory();
      loadHistory();
    }
  };

  const handleViewItem = (id: string) => {
    const full = historyService.getFullResult(id);
    if (full) {
      onSelectResult(full);
      onNavigate('/analyze');
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
          class: 'bg-blue-50 text-blue-800 border-blue-300'
        };
      case 'potentially_manipulated':
        return {
          label: 'Likely fully AI-generated',
          icon: AlertTriangle,
          class: 'bg-rose-50 text-rose-900 border-rose-300'
        };
      case 'no_strong_signs':
        return {
          label: 'No signs of full AI generation',
          icon: CheckCircle2,
          class: 'bg-emerald-50 text-emerald-900 border-emerald-300'
        };
      case 'inconclusive':
      default:
        return {
          label: 'Inconclusive',
          icon: HelpCircle,
          class: 'bg-amber-50 text-amber-900 border-amber-300'
        };
    }
  };

  return (
    <div className="py-8 md:py-12 bg-transparent">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono bg-blue-100 text-blue-900 border border-blue-300 mb-2.5 font-extrabold shadow-2xs">
              <History className="w-3.5 h-3.5 text-blue-600" />
              <span>CASE ARCHIVE & AUDIT TRAIL</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-950 tracking-tight font-sans">
              Audit History
            </h1>
            <p className="text-sm sm:text-base text-slate-700 mt-1 font-medium">
              Review previously analyzed media records, prediction classifications, and timestamps.
            </p>
          </div>

          {historyItems.length > 0 && (
            <button
              onClick={handleClearAll}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold text-slate-700 hover:text-rose-600 hover:bg-rose-50 border border-slate-300 hover:border-rose-300 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear History</span>
            </button>
          )}
        </div>

        {/* ------------------------------------------------------------- */}
        {/* CASE 1: NO RECORDS AVAILABLE (PROFESSIONAL EMPTY STATE) */}
        {/* ------------------------------------------------------------- */}
        {historyItems.length === 0 ? (
          <div className="text-center py-16 px-8 rounded-2xl border-2 border-slate-200 bg-white space-y-5 max-w-2xl mx-auto shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 border-2 border-blue-200 flex items-center justify-center text-blue-600 mx-auto mb-2 shadow-2xs">
              <FolderOpen className="w-8 h-8" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 font-sans">
              No analysis records available.
            </h2>

            <p className="text-base text-slate-700 leading-relaxed font-sans max-w-md mx-auto font-medium">
              You have not conducted any image analyses in this browser session yet. All uploaded files are processed in-memory and stored in your local session cache for privacy.
            </p>

            <div className="pt-3">
              <button
                onClick={() => onNavigate('/analyze')}
                className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl text-base font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all shadow-md cursor-pointer font-sans"
              >
                <Scan className="w-5 h-5 text-white" />
                <span>Start New Analysis</span>
                <ArrowRight className="w-5 h-5 ml-0.5 text-white" />
              </button>
            </div>

            <div className="pt-6 border-t border-slate-100 flex items-center justify-center gap-2 text-xs font-mono text-slate-600 font-bold">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Client-Side Privacy Maintained • Zero Persistent Server Storage</span>
            </div>
          </div>
        ) : (
          /* ------------------------------------------------------------- */
          /* CASE 2: RECORDS EXIST IN STORAGE */
          /* ------------------------------------------------------------- */
          <div className="space-y-6">
            
            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search file names, audit IDs, or summary tags..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none font-mono shadow-2xs font-medium"
                />
              </div>

              {/* Category pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 font-mono text-xs sm:text-sm">
                {[
                  { id: 'all', label: 'All Cases' },
                  { id: 'potentially_manipulated', label: 'Likely AI' },
                  { id: 'no_strong_signs', label: 'No AI Signs' },
                  { id: 'inconclusive', label: 'Inconclusive' }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategoryFilter(cat.id)}
                    className={`px-3.5 py-2 rounded-xl transition-colors whitespace-nowrap cursor-pointer font-bold ${
                      categoryFilter === cat.id
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-white text-slate-700 hover:text-blue-600 border border-slate-300'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Results List */}
            {filteredItems.length === 0 ? (
              <div className="text-center py-14 p-6 rounded-2xl border border-slate-200 bg-white font-mono text-sm text-slate-600 font-medium">
                No records match your search filter "{searchQuery}".
              </div>
            ) : (
              <div className="space-y-3 font-mono">
                {filteredItems.map((item) => {
                  const badge = getCategoryBadge(item.resultCategory);
                  const BadgeIcon = badge.icon;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleViewItem(item.id)}
                      className="p-5 rounded-2xl border-2 border-slate-200 bg-white hover:border-blue-400 hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase border ${badge.class}`}>
                            <BadgeIcon className="w-3.5 h-3.5" />
                            {badge.label}
                          </span>
                          <span className="text-xs text-slate-500 font-semibold">
                            REF: {item.id}
                          </span>
                          <span className="text-xs text-slate-500 font-medium">
                            • {item.analyzedAt}
                          </span>
                        </div>

                        <h3 className="text-base font-black text-slate-950 truncate font-sans">
                          {item.fileName}
                        </h3>

                        <p className="text-sm text-slate-700 line-clamp-1 font-sans font-medium">
                          {item.summary}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 shrink-0 self-end sm:self-center">
                        {item.confidenceScore != null && (
                          <div className="text-right">
                            <div className="text-base sm:text-lg font-black text-slate-950">
                              {item.confidenceScore.toFixed(1)}%
                            </div>
                            <div className="text-[10px] text-slate-500 font-bold uppercase">
                              CONFIDENCE
                            </div>
                          </div>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewItem(item.id);
                          }}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-2xs cursor-pointer font-sans"
                        >
                          <Eye className="w-4 h-4 text-white" />
                          <span>Inspect Report</span>
                        </button>

                        <button
                          onClick={(e) => handleDelete(item.id, e)}
                          className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete log entry"
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
        )}

      </div>
    </div>
  );
};

