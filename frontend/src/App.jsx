import React, { useState, useEffect } from 'react';
import { Layers, Check } from 'lucide-react';
import { checkHealth, runScan } from './api.js';
import UploadStep from './components/UploadStep.jsx';
import ReviewStep from './components/ReviewStep.jsx';
import Results from './components/Results.jsx';
import IssuePanel from './components/IssuePanel.jsx';

export default function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [backendHealthy, setBackendHealthy] = useState(null);

  // Workflow State
  const [diagramImage, setDiagramImage] = useState(null);
  const [diagramPreview, setDiagramPreview] = useState(null);
  const [repoUrl, setRepoUrl] = useState('demo/planted-drift');
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

  // Verify backend health
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
      const isLocal = repoUrl.startsWith('demo/') || repoUrl.startsWith('./') || repoUrl.startsWith('/');
      const payload = {
        components,
        connections,
        token
      };

      if (isLocal) {
        payload.localPath = repoUrl;
      } else {
        payload.repoUrl = repoUrl;
        payload.branch = branch;
      }

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
    { num: 1, label: 'Upload' },
    { num: 2, label: 'Review' },
    { num: 3, label: 'Findings' },
    { num: 4, label: 'Issues' }
  ];

  return (
    <div className="bg-[#0b0f17] text-slate-200 antialiased min-h-screen flex flex-col font-sans selection:bg-sky-500/30 selection:text-sky-200">
      {/* Sleek, Modern Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#0b0f17]/85 border-b border-slate-800/80 px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-bold text-white tracking-tight">DriftCheck</span>
            <span className="hidden sm:inline-block ml-2 text-xs text-slate-400 font-medium">
              Architecture Drift Detector
            </span>
          </div>
        </div>

        {/* Minimal Stepper Navigation */}
        <nav className="flex items-center gap-1 sm:gap-2 bg-slate-900/60 border border-slate-800 p-1 rounded-xl">
          {steps.map((s) => {
            const isActive = currentStep === s.num;
            const isCompleted = currentStep > s.num;
            const isAccessible = s.num === 1 || (s.num === 2 && components.length > 0) || (s.num >= 3 && scanData.findings.length > 0);

            return (
              <button
                key={s.num}
                onClick={() => isAccessible && setCurrentStep(s.num)}
                disabled={!isAccessible}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/30'
                    : isCompleted
                    ? 'text-emerald-400 hover:bg-slate-800/60'
                    : isAccessible
                    ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                    : 'text-slate-600 cursor-not-allowed opacity-40'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                ) : (
                  <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] bg-slate-800 border border-slate-700">
                    {s.num}
                  </span>
                )}
                <span>{s.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Live Status Pill */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                backendHealthy === true ? 'bg-emerald-400 animate-pulse' : backendHealthy === false ? 'bg-rose-500' : 'bg-amber-400'
              }`}
            ></span>
            <span className="text-slate-400 hidden sm:inline">
              {backendHealthy === true ? 'Connected' : backendHealthy === false ? 'Offline' : 'Connecting'}
            </span>
          </div>
        </div>
      </header>

      {/* Global Error Banner */}
      {globalError && (
        <div className="w-full bg-rose-950/40 border-b border-rose-800/60 px-4 py-2.5 text-center text-rose-300 text-xs flex items-center justify-center gap-2">
          <span>{globalError}</span>
        </div>
      )}

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col">
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
      </div>

      {/* Minimal Clean Footer */}
      <footer className="w-full border-t border-slate-900 bg-[#080c14] py-3 px-6 mt-auto">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-xs text-slate-500">
          <span>DriftCheck • Pure Deterministic Code Scanner</span>
          <span>Gemma 4 Multimodal Vision</span>
        </div>
      </footer>
    </div>
  );
}
