import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { EvidenceGuidePage } from './pages/EvidenceGuidePage';
import { AuditHistoryPage } from './pages/AuditHistoryPage';
import { AnalyzePage } from './pages/AnalyzePage';
import type { AnalysisResult } from './types';

function normalizePath(pathname: string): string {
  const clean = pathname.toLowerCase().replace(/\/+$/, '') || '/';
  if (clean === '/home') return '/';
  if (['/', '/how-it-works', '/evidence-guide', '/audit-history', '/analyze'].includes(clean)) {
    return clean;
  }
  return '/';
}

export function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => 
    normalizePath(window.location.pathname)
  );
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null);
  const [preSelectedSampleId, setPreSelectedSampleId] = useState<string | null>(null);

  // Sync with browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(normalizePath(window.location.pathname));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    const normalized = normalizePath(path);
    if (window.location.pathname !== normalized) {
      window.history.pushState({}, '', normalized);
    }
    setCurrentPath(normalized);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectSample = (sampleId: string) => {
    setPreSelectedSampleId(sampleId);
    setCurrentResult(null);
    navigate('/analyze');
  };

  const handleNewAnalysis = () => {
    setCurrentResult(null);
    setPreSelectedSampleId(null);
    navigate('/analyze');
  };

  const handleAnalysisComplete = (result: AnalysisResult) => {
    setCurrentResult(result);
  };

  const handleSelectFromHistory = (result: AnalysisResult) => {
    setCurrentResult(result);
    navigate('/analyze');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 forensic-grid-light">
      
      {/* Top Global Navigation Bar */}
      <Navbar
        currentPath={currentPath}
        onNavigate={navigate}
      />

      {/* Main Dedicated Page Routing */}
      <main className="flex-1">
        {currentPath === '/' && (
          <HomePage
            onNavigate={navigate}
            onSelectSample={handleSelectSample}
          />
        )}

        {currentPath === '/how-it-works' && (
          <HowItWorksPage
            onNavigate={navigate}
          />
        )}

        {currentPath === '/evidence-guide' && (
          <EvidenceGuidePage
            onNavigate={navigate}
          />
        )}

        {currentPath === '/audit-history' && (
          <AuditHistoryPage
            onNavigate={navigate}
            onSelectResult={handleSelectFromHistory}
          />
        )}

        {currentPath === '/analyze' && (
          <AnalyzePage
            currentResult={currentResult}
            onAnalysisComplete={handleAnalysisComplete}
            onNewAnalysis={handleNewAnalysis}
            preSelectedSampleId={preSelectedSampleId}
          />
        )}
      </main>

      {/* Consistent System Footer */}
      <Footer onNavigate={navigate} />

    </div>
  );
}

export default App;
