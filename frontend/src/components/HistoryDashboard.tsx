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
  FolderOpen
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
          class: 'bg-[#80B9A5]/15 text-[#80B9A5] border-[#80B9A5]/30'
        };
      case 'potentially_manipulated':
        return {
          label: 'Likely fully AI-generated',
          icon: AlertTriangle,
          class: 'bg-[#E47777]/15 text-[#E47777] border-[#E47777]/30'
        };
      case 'no_strong_signs':
        return {
          label: 'No signs of full AI generation',
          icon: CheckCircle2,
          class: 'bg-[#70B68A]/15 text-[#70B68A] border-[#70B68A]/30'
        };
      case 'inconclusive':
      default:
        return {
          label: 'Inconclusive',
          icon: HelpCircle,
          class: 'bg-[#D9AB68]/15 text-[#D9AB68] border-[#D9AB68]/30'
        };
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-5 border-b border-[#303A33]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono bg-[#1D2420] text-[#80B9A5] border border-[#303A33] mb-2">
            <History className="w-3.5 h-3.5" />
            <span>LOCAL AUDIT LOG // CASE ARCHIVE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#F0F2ED] tracking-tight font-sans">
            Forensic Examination History
          </h1>
          <p className="text-xs text-[#A0AAA1] mt-0.5 font-mono">
            Review previous media analyses and audit reports conducted in this browser session.
          </p>
        </div>

        {historyItems.length > 0 && (
          <button
            onClick={handleClearAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono text-[#A0AAA1] hover:text-[#E47777] hover:bg-[#E47777]/10 border border-[#303A33] hover:border-[#E47777]/40 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#707B72] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search files, summaries, or metadata tags..."
            className="w-full pl-9 pr-4 py-2 rounded bg-[#171C19] border border-[#303A33] text-xs text-[#F0F2ED] placeholder-[#707B72] focus:border-[#80B9A5] focus:outline-none font-mono"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 font-mono text-xs">
          {[
            { id: 'all', label: 'All Cases' },
            { id: 'potentially_manipulated', label: 'Likely AI' },
            { id: 'no_strong_signs', label: 'No AI Signs' },
            { id: 'inconclusive', label: 'Inconclusive' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap cursor-pointer ${
                categoryFilter === cat.id
                  ? 'bg-[#1D2420] text-[#80B9A5] border border-[#80B9A5]/40'
                  : 'bg-[#171C19] text-[#707B72] hover:text-[#F0F2ED] border border-[#303A33]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Log Entries List */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-16 p-6 rounded-lg border border-[#303A33] bg-[#171C19]">
          <FolderOpen className="w-10 h-10 text-[#707B72] mx-auto mb-3" />
          <h3 className="text-sm font-bold text-[#F0F2ED] font-sans mb-1">
            No Forensic Cases Found
          </h3>
          <p className="text-xs text-[#A0AAA1] max-w-sm mx-auto mb-4 font-mono">
            {historyItems.length === 0
              ? 'You have not conducted any media analyses in this browser yet.'
              : 'No entries match your search query or filter selection.'}
          </p>
          <button
            onClick={onNewAnalysis}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded text-xs font-medium text-[#101311] bg-[#80B9A5] hover:bg-[#93c7b6] transition-colors cursor-pointer"
          >
            <span>Analyze an Image</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="space-y-2.5 font-mono">
          {filteredItems.map((item) => {
            const badge = getCategoryBadge(item.resultCategory);
            const BadgeIcon = badge.icon;
            return (
              <div
                key={item.id}
                onClick={() => handleViewItem(item.id)}
                className="p-4 rounded-lg border border-[#303A33] bg-[#171C19] hover:bg-[#1D2420] hover:border-[#435248] transition-colors cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase border ${badge.class}`}>
                      <BadgeIcon className="w-3 h-3" />
                      {badge.label}
                    </span>
                    <span className="text-[10px] text-[#707B72]">
                      REF: {item.id}
                    </span>
                    <span className="text-[10px] text-[#707B72]">
                      • {item.analyzedAt}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-[#F0F2ED] truncate">
                    {item.fileName}
                  </h3>

                  <p className="text-[11px] text-[#A0AAA1] line-clamp-1">
                    {item.summary}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  {item.confidenceScore != null && (
                    <div className="text-right">
                      <div className="text-xs font-bold text-[#F0F2ED]">
                        {item.confidenceScore.toFixed(1)}%
                      </div>
                      <div className="text-[9px] text-[#707B72] uppercase">
                        CONFIDENCE
                      </div>
                    </div>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewItem(item.id);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded text-xs text-[#80B9A5] bg-[#101311] border border-[#303A33] hover:border-[#80B9A5]/50 transition-colors"
                  >
                    <Eye className="w-3 h-3" />
                    <span>View Report</span>
                  </button>

                  <button
                    onClick={(e) => handleDelete(item.id, e)}
                    className="p-1.5 rounded text-[#707B72] hover:text-[#E47777] transition-colors"
                    title="Delete log entry"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
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
