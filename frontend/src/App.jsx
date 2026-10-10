import React, { useState, useEffect } from 'react';
import { 
  GitBranch, 
  Layers, 
  Activity, 
  Sparkles, 
  CheckCircle2, 
  Cpu
} from 'lucide-react';
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
  const [repoUrl, setRepoUrl] = useState('');
  const [branch, setBranch] = useState('');
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
    <div className="app-container">
      {/* Top Header */}
      <header className="app-header">
        <div className="brand-wrapper">
          <div className="brand-logo">
            <Cpu size={24} style={{ color: '#fff' }} />
          </div>
          <div>
            <div className="brand-title">DriftCheck</div>
            <div className="brand-tagline">Diagram vs Codebase Architectural Drift Detector</div>
          </div>
        </div>

        <div className="header-meta">
          <div className="health-badge">
            <span className={`health-dot`} style={{ backgroundColor: backendHealthy ? '#10b981' : '#f43f5e' }} />
            <span>{backendHealthy === null ? 'Connecting...' : backendHealthy ? 'API Proxy Active' : 'API Offline'}</span>
          </div>
        </div>
      </header>

      {/* Stepper Navigation */}
      <nav className="stepper-nav">
        <button
          className={`step-btn ${currentStep === 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}
          onClick={() => setCurrentStep(1)}
        >
          <span className="step-num">1</span> Upload &amp; Target
        </button>
        <button
          className={`step-btn ${currentStep === 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}
          onClick={() => components.length > 0 && setCurrentStep(2)}
          disabled={components.length === 0}
        >
          <span className="step-num">2</span> Review Model Output
        </button>
        <button
          className={`step-btn ${currentStep === 3 ? 'active' : ''} ${currentStep > 3 ? 'completed' : ''}`}
          onClick={() => scanData.findings.length > 0 && setCurrentStep(3)}
          disabled={scanData.findings.length === 0}
        >
          <span className="step-num">3</span> Scan Findings
        </button>
        <button
          className={`step-btn ${currentStep === 4 ? 'active' : ''}`}
          onClick={() => scanData.findings.length > 0 && setCurrentStep(4)}
          disabled={scanData.findings.length === 0}
        >
          <span className="step-num">4</span> Draft Issues
        </button>
      </nav>

      {globalError && (
        <div className="alert alert-error" style={{ maxWidth: '850px', margin: '0 auto 20px' }}>
          <div><strong>Error:</strong> {globalError}</div>
        </div>
      )}

      {/* Step Components */}
      <main>
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
      </main>
    </div>
  );
}
