import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { HowItWorks } from './components/HowItWorks';
import { ResponsibleAI } from './components/ResponsibleAI';
import { AnalyzeMedia } from './components/AnalyzeMedia';
import { ResultsDashboard } from './components/ResultsDashboard';
import { ExplainabilityGuide } from './components/ExplainabilityGuide';
import { HistoryDashboard } from './components/HistoryDashboard';
import { ReportModal } from './components/ReportModal';
import { Footer } from './components/Footer';
import { historyService } from './services/historyService';
import type { AnalysisResult } from './types';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null);
  const [preSelectedSampleId, setPreSelectedSampleId] = useState<string | null>(null);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);

  // When an analysis completes in AnalyzeMedia
  const handleAnalysisComplete = (result: AnalysisResult) => {
    setCurrentResult(result);
    historyService.saveResult(result);
    setActiveTab('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // When user clicks "Load in Studio" on the scanner demo
  const handleSelectSampleFromHero = (sampleId: string) => {
    setPreSelectedSampleId(sampleId);
    setActiveTab('analyze');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // When user clicks "Analyze Media" button from anywhere
  const handleNewAnalysis = () => {
    setPreSelectedSampleId(null);
    setActiveTab('analyze');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // When user clicks an entry in the History dashboard
  const handleSelectFromHistory = (result: AnalysisResult) => {
    setCurrentResult(result);
    setActiveTab('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#070A13] text-slate-100">
      
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNewAnalysis={handleNewAnalysis}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {activeTab === 'landing' && (
          <div>
            <Hero
              onStartAnalysis={handleNewAnalysis}
              onLearnMore={() => {
                const el = document.getElementById('how-it-works-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                else setActiveTab('how-it-works');
              }}
              onSelectSample={handleSelectSampleFromHero}
            />
            <Features />
            <HowItWorks onStartAnalysis={handleNewAnalysis} />
            <ResponsibleAI />
          </div>
        )}

        {activeTab === 'analyze' && (
          <div className="py-8">
            <AnalyzeMedia
              onAnalysisComplete={handleAnalysisComplete}
              preSelectedSampleId={preSelectedSampleId}
            />
          </div>
        )}

        {activeTab === 'results' && currentResult && (
          <div className="py-8">
            <ResultsDashboard
              result={currentResult}
              onNewAnalysis={handleNewAnalysis}
              onOpenReport={() => setShowReportModal(true)}
            />
          </div>
        )}

        {activeTab === 'how-it-works' && (
          <div className="py-8">
            <HowItWorks onStartAnalysis={handleNewAnalysis} />
            <ResponsibleAI />
          </div>
        )}

        {activeTab === 'evidence' && (
          <div className="py-8">
            <ExplainabilityGuide />
          </div>
        )}

        {activeTab === 'history' && (
          <div className="py-8">
            <HistoryDashboard
              onSelectResult={handleSelectFromHistory}
              onNewAnalysis={handleNewAnalysis}
            />
          </div>
        )}
      </main>

      {/* Printable / Downloadable Audit Report Modal */}
      {showReportModal && currentResult && (
        <ReportModal
          result={currentResult}
          onClose={() => setShowReportModal(false)}
        />
      )}

      {/* Footer */}
      <Footer setActiveTab={setActiveTab} />

    </div>
  );
}

export default App;
