import React, { useState, useEffect } from 'react';
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

  // Check health on mount (verifies Vite proxy -> Express backend)
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

  return (
    <div class="bg-background text-on-surface antialiased min-h-screen flex flex-col font-body-sm text-body-sm selection:bg-primary-container selection:text-on-primary-container">
      {/* TopNavBar */}
      <header class="flex justify-between items-center w-full px-space-md h-14 border-b border-outline-variant bg-surface-container-low sticky top-0 z-50">
        {/* Brand Info */}
        <div class="flex items-center gap-space-md">
          <div class="flex items-center gap-space-sm">
            <div class="w-8 h-8 rounded bg-surface-container flex items-center justify-center border border-outline-variant text-primary-container">
              <span class="material-symbols-outlined text-primary-container text-[20px]">developer_board</span>
            </div>
            <div>
              <span class="text-headline-sm font-headline-sm font-semibold text-primary tracking-tight">DriftCheck</span>
              <span class="hidden xl:inline-block ml-space-xs text-mono-label font-mono-label text-outline border-l border-outline-variant pl-space-xs">
                Diagram vs Codebase Architectural Drift Detector
              </span>
            </div>
          </div>
        </div>

        {/* Stepper Navigation Links */}
        <nav class="hidden md:flex items-center gap-space-lg">
          <button
            onClick={() => setCurrentStep(1)}
            class={`font-mono-label text-mono-label py-1 flex items-center gap-1.5 transition-colors ${
              currentStep === 1
                ? 'text-primary border-b-2 border-primary font-semibold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {currentStep > 1 ? (
              <span class="material-symbols-outlined text-[#10B981] text-sm">check_circle</span>
            ) : (
              <span class="w-1.5 h-1.5 rounded-full bg-primary-container inline-block"></span>
            )}
            1: Upload &amp; Target
          </button>

          <button
            onClick={() => components.length > 0 && setCurrentStep(2)}
            disabled={components.length === 0}
            class={`font-mono-label text-mono-label py-1 flex items-center gap-1.5 transition-colors ${
              currentStep === 2
                ? 'text-primary border-b-2 border-primary font-semibold'
                : components.length > 0
                ? 'text-on-surface-variant hover:text-on-surface'
                : 'text-outline opacity-50 cursor-not-allowed'
            }`}
          >
            {currentStep > 2 ? (
              <span class="material-symbols-outlined text-[#10B981] text-sm">check_circle</span>
            ) : (
              <span class="w-3.5 h-3.5 flex items-center justify-center bg-surface-container text-on-surface text-[10px] rounded">2</span>
            )}
            2: Review Extraction
          </button>

          <button
            onClick={() => scanData.findings.length > 0 && setCurrentStep(3)}
            disabled={scanData.findings.length === 0}
            class={`font-mono-label text-mono-label py-1 flex items-center gap-1.5 transition-colors ${
              currentStep === 3
                ? 'text-primary border-b-2 border-primary font-semibold'
                : scanData.findings.length > 0
                ? 'text-on-surface-variant hover:text-on-surface'
                : 'text-outline opacity-50 cursor-not-allowed'
            }`}
          >
            {currentStep > 3 ? (
              <span class="material-symbols-outlined text-[#10B981] text-sm">check_circle</span>
            ) : (
              <span class="w-3.5 h-3.5 flex items-center justify-center bg-surface-container text-on-surface text-[10px] rounded">3</span>
            )}
            3: Scan Findings
          </button>

          <button
            onClick={() => scanData.findings.length > 0 && setCurrentStep(4)}
            disabled={scanData.findings.length === 0}
            class={`font-mono-label text-mono-label py-1 flex items-center gap-1.5 transition-colors ${
              currentStep === 4
                ? 'text-primary border-b-2 border-primary font-semibold'
                : scanData.findings.length > 0
                ? 'text-on-surface-variant hover:text-on-surface'
                : 'text-outline opacity-50 cursor-not-allowed'
            }`}
          >
            <span class="w-3.5 h-3.5 flex items-center justify-center bg-surface-container text-on-surface text-[10px] rounded">4</span>
            4: Draft Issues
          </button>
        </nav>

        {/* Trailing Actions & Proxy Live Pill */}
        <div class="flex items-center gap-space-sm">
          <div class="flex items-center gap-1.5 px-2 py-0.5 rounded bg-surface-container border border-outline-variant text-mono-label font-mono-label">
            <span
              class="w-2 h-2 rounded-full"
              style={{ backgroundColor: backendHealthy ? '#10B981' : '#F43F5E' }}
            ></span>
            <span class="text-on-surface text-xs">
              {backendHealthy === null ? 'Connecting...' : backendHealthy ? 'API Proxy Active' : 'API Offline'}
            </span>
          </div>

          <div class="h-4 w-px bg-outline-variant mx-1"></div>

          <div class="flex items-center gap-1">
            <button
              onClick={() => handleStartScan()}
              disabled={components.length === 0}
              class="px-2.5 py-1 text-xs font-mono-label font-medium text-on-primary-container bg-primary-container hover:bg-primary-fixed-dim rounded transition-colors"
            >
              Scan
            </button>
            <div class="w-7 h-7 rounded bg-surface-container-high border border-outline-variant flex items-center justify-center text-mono-label font-mono-label text-primary font-semibold ml-1">
              DC
            </div>
          </div>
        </div>
      </header>

      {/* Global Error Banner */}
      {globalError && (
        <div class="w-full bg-[#93000a]/20 border-b border-[#93000a] p-3 text-center text-on-error-container text-xs font-mono-code flex items-center justify-center gap-2">
          <span class="material-symbols-outlined text-sm">error</span>
          <span>{globalError}</span>
        </div>
      )}

      {/* Main Content Workspace */}
      <div class="flex-1 flex flex-col">
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

      {/* Technical Footer */}
      <footer class="w-full border-t border-outline-variant bg-surface-container-lowest px-space-md py-2.5 mt-auto">
        <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-mono-label font-mono-label text-outline text-[11px]">
          <div class="flex items-center gap-3">
            <span>DriftCheck Core v2.4.1</span>
            <span>•</span>
            <span class="flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
              AST Pattern Matcher: Ready
            </span>
            <span>•</span>
            <span>Gemma 4 Multimodal Vision Parser</span>
          </div>
          <div>
            <span>DETERMINISTIC VERIFICATION • STRICT NO-AI SCANNER</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
