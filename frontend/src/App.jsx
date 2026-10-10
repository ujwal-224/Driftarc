import React, { useState, useEffect } from 'react';
import { Layers, Check, ShieldCheck, Cpu, ArrowLeft, ArrowRight, Sparkles, Sun, Moon } from 'lucide-react';
import { checkHealth, runScan } from './api.js';
import LandingPage from './components/LandingPage.jsx';
import UploadStep from './components/UploadStep.jsx';
import ReviewStep from './components/ReviewStep.jsx';
import Results from './components/Results.jsx';
import IssuePanel from './components/IssuePanel.jsx';

export default function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('driftarc_theme') || 'dark';
  });
  const [view, setView] = useState('landing'); // 'landing' | 'studio'
  const [currentStep, setCurrentStep] = useState(1);
  const [backendHealthy, setBackendHealthy] = useState(null);

  // Sync theme to document element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }
    localStorage.setItem('driftarc_theme', theme);
  }, [theme]);

  // Workflow State
  const [diagramImage, setDiagramImage] = useState(null);
  const [diagramPreview, setDiagramPreview] = useState(null);
  const [repoUrl, setRepoUrl] = useState('');
  const [branch, setBranch] = useState('main');
  const [token, setToken] = useState('');

  // Extracted Architecture
  const [components, setComponents] = useState([]);
  const [connections, setConnections] = useState([]);

  // Scan Results
  const [scanData, setScanData] = useState({
    findings: [],
    summary: { total: 0, match: 0, mismatch: 0, undocumented: 0, unknown: 0 },
    connectionsCheck: [],
    filesScanned: 0
  });

  const [scanLoading, setScanLoading] = useState(false);
  const [globalError, setGlobalError] = useState(null);

  // Check backend health
  useEffect(() => {
    checkHealth()
      .then(() => setBackendHealthy(true))
      .catch((err) => {
        console.warn('Backend health check error:', err);
        setBackendHealthy(false);
      });
  }, []);

  const handleDiagramExtracted = ({ components: extractedComps, connections: extractedConns }) => {
    setComponents(extractedComps || []);
    setConnections(extractedConns || []);
    setCurrentStep(2);
  };

  const handleStartScan = async () => {
    setScanLoading(true);
    setGlobalError(null);

    try {
      const isLocal = repoUrl.startsWith('./') || repoUrl.startsWith('/') || repoUrl === '.';
      const payload = {
        components,
        connections,
        token
      };

      if (isLocal) {
        payload.localPath = repoUrl;
      } else {
        payload.repoUrl = repoUrl;
      }
      payload.branch = branch;

      const res = await runScan(payload);
      setScanData(res);
      setCurrentStep(3);
    } catch (err) {
      setGlobalError(err.message || 'Scan failed');
    } finally {
      setScanLoading(false);
    }
  };

  const steps = [
    { num: 1, label: 'Upload Diagram' },
    { num: 2, label: 'Review Extraction' },
    { num: 3, label: 'Audit Findings' },
    { num: 4, label: 'Draft Issues' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080c14] text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-sky-500/30 selection:text-sky-900 dark:selection:text-sky-200 relative transition-colors duration-200">
      {/* Ambient background atmosphere */}
      <div className="fixed inset-0 bg-dot-pattern opacity-40 pointer-events-none z-0"></div>

      {/* Modern Frosted Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/90 dark:bg-[#080c14]/90 border-b border-slate-200 dark:border-white/[0.08] px-6 h-16 flex items-center justify-between transition-colors">
        {/* Brand */}
        <div
          onClick={() => setView('landing')}
          className="flex items-center gap-3 cursor-pointer group"
          title="Back to Landing Page"
        >
          <div className="w-9 h-9 rounded-xl bg-sky-600 flex items-center justify-center text-white shadow-md ring-1 ring-white/10 group-hover:bg-sky-500 transition-colors">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                DriftArc
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 font-semibold tracking-wide">
                v2.4
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-none mt-0.5 hidden sm:block">
              Architecture vs Codebase Integrity
            </p>
          </div>
        </div>

        {/* Dynamic Center Nav: Landing vs Studio Stepper */}
        {view === 'landing' ? (
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-600 dark:text-slate-300">
            <a href="#how-it-works" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              How It Works
            </a>
            <a href="#drift-cases" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Live Scenarios
            </a>
            <button
              onClick={() => setView('studio')}
              className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors flex items-center gap-1 font-semibold"
            >
              <span>Audit Studio</span>
              <Sparkles className="w-3 h-3 text-sky-600 dark:text-sky-400" />
            </button>
          </nav>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setView('landing')}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-white/[0.04] transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Landing</span>
            </button>
            <nav className="flex items-center gap-1 sm:gap-1.5 bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-white/[0.08] p-1 rounded-xl shadow-inner">
              {steps.map((s) => {
                const isActive = currentStep === s.num;
                const isCompleted = currentStep > s.num;
                const isAccessible =
                  s.num === 1 ||
                  (s.num === 2 && components.length > 0) ||
                  (s.num >= 3 && scanData.findings.length > 0);

                return (
                  <button
                    key={s.num}
                    onClick={() => isAccessible && setCurrentStep(s.num)}
                    disabled={!isAccessible}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-sky-600 text-white shadow-sm'
                        : isCompleted
                        ? 'text-emerald-600 dark:text-emerald-400 hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
                        : isAccessible
                        ? 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-black/[0.04] dark:hover:bg-white/[0.04]'
                        : 'text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-30'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    ) : (
                      <span
                        className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {s.num}
                      </span>
                    )}
                    <span className="hidden md:inline">{s.label}</span>
                    <span className="md:hidden">Step {s.num}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        )}

        {/* Right Action: Studio Button + Theme Switcher + Health Status */}
        <div className="flex items-center gap-2.5">
          {view === 'landing' ? (
            <button
              onClick={() => setView('studio')}
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
            >
              <span>Launch Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : null}

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 transition-colors shadow-sm"
            title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 transition-transform rotate-0 hover:rotate-45" />
            ) : (
              <Moon className="w-4 h-4 text-sky-600 transition-transform -rotate-12 hover:rotate-0" />
            )}
          </button>

          {/* Engine Health Status */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-white/[0.08] text-xs shadow-sm">
            <span
              className={`w-2 h-2 rounded-full ${
                backendHealthy === true
                  ? 'bg-emerald-500 dark:bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                  : backendHealthy === false
                  ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]'
                  : 'bg-amber-400 animate-pulse'
              }`}
            ></span>
            <span className="text-slate-700 dark:text-slate-300 font-medium hidden sm:inline">
              {backendHealthy === true ? 'Engine Ready' : backendHealthy === false ? 'Offline' : 'Connecting...'}
            </span>
          </div>
        </div>
      </header>

      {/* Global Error Banner */}
      {globalError && (
        <div className="relative z-10 w-full bg-rose-100 dark:bg-rose-950/60 border-b border-rose-300 dark:border-rose-500/30 px-4 py-2.5 text-center text-rose-800 dark:text-rose-200 text-xs flex items-center justify-center gap-2 backdrop-blur-md">
          <span>{globalError}</span>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative z-10">
        {view === 'landing' ? (
          <LandingPage onLaunchStudio={() => setView('studio')} theme={theme} />
        ) : (
          <>
            {currentStep === 1 && (
              <UploadStep
                diagramImage={diagramImage}
                setDiagramImage={setDiagramImage}
                diagramPreview={diagramPreview}
                setDiagramPreview={setDiagramPreview}
                repoUrl={repoUrl}
                setRepoUrl={setRepoUrl}
                branch={branch}
                setBranch={setBranch}
                token={token}
                setToken={setToken}
                onExtracted={handleDiagramExtracted}
              />
            )}

            {currentStep === 2 && (
              <ReviewStep
                components={components}
                setComponents={setComponents}
                connections={connections}
                setConnections={setConnections}
                repoUrl={repoUrl}
                branch={branch}
                onBack={() => setCurrentStep(1)}
                onStartScan={handleStartScan}
                loading={scanLoading}
              />
            )}

            {currentStep === 3 && (
              <Results
                findings={scanData.findings}
                summary={scanData.summary}
                connectionsCheck={scanData.connectionsCheck}
                diagramPreview={diagramPreview}
                filesScanned={scanData.filesScanned}
                repoUrl={repoUrl}
                branch={branch}
                onProceedToIssues={() => setCurrentStep(4)}
                onBack={() => setCurrentStep(2)}
                loading={scanLoading}
              />
            )}

            {currentStep === 4 && (
              <IssuePanel
                findings={scanData.findings}
                repoUrl={repoUrl}
                token={token}
                onBack={() => setCurrentStep(3)}
              />
            )}
          </>
        )}
      </div>

      {/* Premium Footer */}
      <footer className="w-full border-t border-slate-200 dark:border-white/[0.06] bg-white/90 dark:bg-[#080c14]/90 backdrop-blur-md py-4 px-6 mt-auto relative z-10 transition-colors">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-slate-800 dark:text-slate-300 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              100% Deterministic Code Scanner
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="flex items-center gap-1.5 text-slate-800 dark:text-slate-300 font-medium">
              <Cpu className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              Gemma 4 Multimodal Vision
            </span>
          </div>
          <div className="text-slate-500 font-mono text-[11px]">
            Zero Hallucinations • Zero Secret Persistence
          </div>
        </div>
      </footer>
    </div>
  );
}
