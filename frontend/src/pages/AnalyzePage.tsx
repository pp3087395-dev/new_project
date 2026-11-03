import { useState } from 'react';
import type { FC } from 'react';
import { AnalyzeMedia } from '../components/AnalyzeMedia';
import { ResultsDashboard } from '../components/ResultsDashboard';
import { ReportModal } from '../components/ReportModal';
import { historyService } from '../services/historyService';
import type { AnalysisResult } from '../types';

interface AnalyzePageProps {
  currentResult: AnalysisResult | null;
  onAnalysisComplete: (result: AnalysisResult) => void;
  onNewAnalysis: () => void;
  preSelectedSampleId?: string | null;
}

export const AnalyzePage: FC<AnalyzePageProps> = ({
  currentResult,
  onAnalysisComplete,
  onNewAnalysis,
  preSelectedSampleId
}) => {
  const [showReportModal, setShowReportModal] = useState(false);

  const handleComplete = (result: AnalysisResult) => {
    historyService.saveResult(result);
    onAnalysisComplete(result);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartNew = () => {
    onNewAnalysis();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="py-8 bg-transparent min-h-[calc(100vh-140px)]">
      {!currentResult ? (
        <AnalyzeMedia
          onAnalysisComplete={handleComplete}
          preSelectedSampleId={preSelectedSampleId}
        />
      ) : (
        <ResultsDashboard
          result={currentResult}
          onNewAnalysis={handleStartNew}
          onOpenReport={() => setShowReportModal(true)}
        />
      )}

      {/* Printable / Downloadable Audit Report Modal */}
      {showReportModal && currentResult && (
        <ReportModal
          result={currentResult}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </div>
  );
};

