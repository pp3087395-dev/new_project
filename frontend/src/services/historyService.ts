import type { AnalysisHistoryEntry, AnalysisResult } from '../types';

const STORAGE_KEY = 'truthlens_analysis_history';
const FULL_RESULTS_KEY = 'truthlens_saved_results';

export const historyService = {
  getHistory(): AnalysisHistoryEntry[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.warn('Failed to load history from localStorage', e);
      return [];
    }
  },

  saveResult(result: AnalysisResult): void {
    try {
      const history = this.getHistory();
      const newEntry: AnalysisHistoryEntry = {
        id: result.id,
        fileName: result.fileName,
        fileType: result.fileType,
        analyzedAt: result.analyzedAt,
        resultCategory: result.resultCategory,
        confidenceScore: result.confidenceScore,
        summary: result.summary,
        mode: result.mode,
      };

      // Keep recent 30 items
      const updated = [newEntry, ...history.filter(h => h.id !== result.id)].slice(0, 30);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

      // Also save full result for detailed viewing (avoiding huge blob storage by storing small media url/reference)
      const existingResultsStr = localStorage.getItem(FULL_RESULTS_KEY);
      const existingResults: Record<string, AnalysisResult> = existingResultsStr ? JSON.parse(existingResultsStr) : {};
      
      // Store result; if mediaUrl is a large base64, keep it but prevent overflow
      existingResults[result.id] = {
        ...result,
        // If mediaUrl is a giant data-uri over 500KB, avoid quota exhaustion by storing truncated placeholder
        mediaUrl: result.mediaUrl.length > 500000 ? '' : result.mediaUrl
      };
      
      // Limit to 10 stored full results
      const keys = Object.keys(existingResults);
      if (keys.length > 10) {
        delete existingResults[keys[0]];
      }
      localStorage.setItem(FULL_RESULTS_KEY, JSON.stringify(existingResults));
    } catch (e) {
      console.warn('Failed to persist history to localStorage', e);
    }
  },

  getFullResult(id: string): AnalysisResult | null {
    try {
      const data = localStorage.getItem(FULL_RESULTS_KEY);
      if (!data) return null;
      const dict = JSON.parse(data);
      return dict[id] || null;
    } catch {
      return null;
    }
  },

  deleteEntry(id: string): void {
    try {
      const history = this.getHistory().filter(item => item.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));

      const existingResultsStr = localStorage.getItem(FULL_RESULTS_KEY);
      if (existingResultsStr) {
        const dict = JSON.parse(existingResultsStr);
        delete dict[id];
        localStorage.setItem(FULL_RESULTS_KEY, JSON.stringify(dict));
      }
    } catch (e) {
      console.warn('Failed to delete history item', e);
    }
  },

  clearHistory(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(FULL_RESULTS_KEY);
    } catch (e) {
      console.warn('Failed to clear history', e);
    }
  }
};
