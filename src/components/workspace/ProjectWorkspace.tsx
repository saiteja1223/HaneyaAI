import { useState, useCallback } from 'react';
import { Sparkles, CheckCircle2, RotateCcw, CreditCard as Edit3, Download, Copy, FileDown, Code2, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useStore } from '../../store/useStore';
import { callOpenAI, SPEC_SYSTEM_PROMPT, ABAP_SYSTEM_PROMPT, SPEC_STAGES, ABAP_STAGES, runStagedProgress, ApiError } from '../../utils/api';
import { exportToPDF } from '../../utils/pdf';
import ProgressBar from '../common/ProgressBar';
import SkeletonLoader from '../common/SkeletonLoader';
import VersionHistory from '../common/VersionHistory';
import AbapEditor from './AbapEditor';
import axios from 'axios';
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker?url";
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;
export default function ProjectWorkspace() {
  const {
    activeProjectId, projects, apiKey, setShowApiKeyModal,
    isGenerating, setIsGenerating, setGenerationState,
    updateProject, addVersion, activeTab, setActiveTab,
  } = useStore();

  const project = projects.find((p) => p.id === activeProjectId);
  const [requirement, setRequirement] = useState(project?.requirement || '');
  const [editingFs, setEditingFs] = useState(false);
  const [editingTs, setEditingTs] = useState(false);
  const [dataToLink, setDataToLink] = useState({
        ts: "Source Code Context...",
        fs: "Field Definitions..."
    });

  const [editFsContent, setEditFsContent] = useState('');
  const [editTsContent, setEditTsContent] = useState('');

  if (!project) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 dark:text-gray-600">
        No project selected
      </div>
    );
  }

  const syncRequirement = (val: string) => {
    debugger
    setRequirement(val);
    updateProject(project.id, { requirement: val });
  };

  const handleGenerateSpecs = useCallback(async () => {
    if (!apiKey) {
      setShowApiKeyModal(true);
      return;
    }
    if (!requirement.trim()) {
      toast.error('Please enter a requirement');
      return;
    }

    setIsGenerating(true);
    setGenerationState('analyzing', 5);

    const progress = runStagedProgress(SPEC_STAGES, (stage, prog) => {
      setGenerationState(stage, prog);
    }, 2500);
     debugger
   try {
//  const response = await axios.post(
//   'https://api.anthropic.com/v1/messages',
//   {
//     model: 'claude-3-haiku-20240307',
//     max_tokens: 2000,
//     temperature: 0.7,
//     messages: [
//       {
//         role: 'user',
//         content: `Generate a detailed Functional Specification (FS) and Technical Specification (TS) for the following SAP requirement:\n\n${requirement}`,
//       },
//     ],
//     system: SPEC_SYSTEM_PROMPT
//   },
//   {
//     headers: {
//       'Content-Type': 'application/json',
//       'x-api-key': apiKey.trim(),
//       'anthropic-version': '2023-06-01'
//     },
//   }
// );

// const result = response.data.content[0].text;
// console.log(result);
const response =await axios.post('https://haneyaai.onrender.com/chat', {
  message: requirement
  // systemPrompt: SPEC_SYSTEM_PROMPT
});
// const result = response.data.content[0].text;
  const result = response.data;
console.log("Result",result);

  // ✅ Extract exactly like your callOpenAI function
  

  progress.complete();

      // Parse FS and TS from the response
      // const fsMatch = result.match(/# functionalSpec([\s\S]*?)# technicalSpec/);
      // const tsMatch = result.match(/# technicalSpec([\s\S]*)/);

      // const fs = fsMatch ? fsMatch[1].trim() : result;
      // const ts = tsMatch ? tsMatch[1].trim() : '';
      const fs = result.functionalSpec || '';
      const ts = result.technicalSpec || '';

console.log("FS:", fs);
console.log("TS:", ts);
    
    setDataToLink({ts:ts,fs:fs})

      updateProject(project.id, { functionalSpec: fs, technicalSpec: ts, approved: false, abapCode: '' });
      addVersion(project.id, 'fs', fs);
      if (ts) addVersion(project.id, 'ts', ts);

      setGenerationState('complete', 100);
      toast.success('Specifications generated successfully');
    } catch (err) {
      console.log(err);
      progress.cancel();
      setGenerationState('error', 0);
      if (err instanceof ApiError) {
        if (err.status === 401) toast.error('Invalid API key. Please check and re-enter.');
        else if (err.status === 429) toast.error('Rate limit exceeded. Auto-retried 3 times. Wait 60 seconds and try again.');
        else toast.error(err.message);
      } else {
        toast.error('Network error. Please check your connection.');
      }
    } finally {
      setTimeout(() => {
        setIsGenerating(false);
        setGenerationState('idle', 0);
      }, 800);
    }
  }, [apiKey, requirement, project.id, setIsGenerating, setGenerationState, updateProject, addVersion, setShowApiKeyModal]);

  const handleApprove = () => {
    updateProject(project.id, { approved: true });
    toast.success('Specifications approved');
  };

  const handleRegenerate = () => {
    updateProject(project.id, { functionalSpec: '', technicalSpec: '', approved: false, abapCode: '' });
    toast('Specifications cleared. Click Generate to regenerate.', { icon: '🔄' });
  };

  const handleEditFs = () => {
    setEditFsContent(project.functionalSpec);
    setEditingFs(true);
  };

  const handleEditTs = () => {
    setEditTsContent(project.technicalSpec);
    setEditingTs(true);
  };

  const saveFsEdit = () => {
    updateProject(project.id, { functionalSpec: editFsContent });
    addVersion(project.id, 'fs', editFsContent);
    setEditingFs(false);
    toast.success('Functional Specification updated');
  };

  const saveTsEdit = () => {
    updateProject(project.id, { technicalSpec: editTsContent });
    addVersion(project.id, 'ts', editTsContent);
    setEditingTs(false);
    toast.success('Technical Specification updated');
  };

  const handleGenerateAbap = useCallback(async () => {
    if (!apiKey) {
      setShowApiKeyModal(true);
      return;
    }

    setIsGenerating(true);
    setGenerationState('understanding', 5);

    const progress = runStagedProgress(ABAP_STAGES, (stage, prog) => {
      setGenerationState(stage, prog);
    }, 2500);

    try {
      // const combined = `FUNCTIONAL SPECIFICATION:\n${project.functionalSpec}\n\nTECHNICAL SPECIFICATION:\n${project.technicalSpec}`;
      // const result = await callOpenAI(
      //   apiKey,
      //   ABAP_SYSTEM_PROMPT,
      //   `Generate clean, optimized, production-ready ABAP code based on the following FS and TS:\n\n${combined}`,
      // );
       const response = await axios.post(
             "https://haneyaai.onrender.com/generate-abap",
              {
                functionalSpec: project.functionalSpec,
                technicalSpec: project.technicalSpec
              }
            );
             const result = response.data.abapCode;

      progress.complete();
      updateProject(project.id, { abapCode: result });
      addVersion(project.id, 'abap', result);
      setGenerationState('complete', 100);
      toast.success('ABAP code generated successfully');
    } catch (err) {
      progress.cancel();
      setGenerationState('error', 0);
      if (err instanceof ApiError) {
        if (err.status === 401) toast.error('Invalid API key');
        else if (err.status === 429) toast.error('Rate limit exceeded. Auto-retried 3 times. Wait 60 seconds and try again.');
        else toast.error(err.message);
      } else {
        toast.error('Network error');
      }
    } finally {
      setTimeout(() => {
        setIsGenerating(false);
        setGenerationState('idle', 0);
      }, 800);
    }
  }, [apiKey, project, setIsGenerating, setGenerationState, updateProject, addVersion, setShowApiKeyModal]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const downloadAbap = () => {
    const blob = new Blob([project.abapCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.replace(/\s+/g, '_')}.abap`;
    a.click();
    URL.revokeObjectURL(url);
  };
 
//  const handleFileUpload = async (
//     e: React.ChangeEvent<HTMLInputElement>
//   ) => {
//     debugger
//     const file = e.target.files?.[0];
//     if (!file) return;

  

//     try {
//       const arrayBuffer = await file.arrayBuffer();
//       const typedArray = new Uint8Array(arrayBuffer);

//       const pdf = await pdfjsLib.getDocument(typedArray).promise;

//       let fullText = "";

//       for (let i = 1; i <= pdf.numPages; i++) {
//         const page = await pdf.getPage(i);
//         const content = await page.getTextContent();

//         const strings = content.items
//           .map((item: any) => ("str" in item ? item.str : ""))
//           .filter(Boolean);

//         fullText += strings.join(" ") + "\n";
//       }

//       // ✅ Put PDF text into textarea state
//       setRequirement(fullText);
//        setIsGenerating(true)
//     } catch (error) {
//       console.error("Error reading PDF:", error);
//     }  
//   };
const handleFileUpload = async (event: any) => {
  debugger
  const file = event.target.files[0];

  if (!file) return;

  const reader = new FileReader();

  reader.onload = async (e: any) => {
    const typedArray = new Uint8Array(e.target.result);

    const pdf = await pdfjsLib.getDocument(typedArray).promise;

    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);

      const content = await page.getTextContent();

      const strings = content.items.map((item: any) => item.str);

      fullText += strings.join(" ");
    }

    console.log(fullText);
    syncRequirement(fullText);

    
  };

  reader.readAsArrayBuffer(file);
};
const handleSendToCopilot = async() => {
        // // Prepare the text you want to paste
        // const fullPrompt = `Please analyze these fields (FS) and source (TS): \n\n ${dataToLink.fs} \n\n ${dataToLink.ts}`;

        // // Check if we are running inside the Eclipse Browser widget
        // if (window.sendToCopilotJava) {
   
        //     window.sendToCopilotJava(fullPrompt);
        // } else {
        //     alert("Eclipse bridge not detected. Are you running this inside the Eclipse Plugin?");
        // }
        const response =await axios.post('http://127.0.0.1:5000/api/mcp/generate-abap', {
        technical_spec: dataToLink
  // systemPrompt: SPEC_SYSTEM_PROMPT
          });
    };

  const hasSpecs = !!project.functionalSpec;
  const hasAbap = !!project.abapCode;

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Left Panel - Input */}
      <div className="w-[420px] shrink-0 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex flex-col">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{project.name}</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">SAP Requirement</p>
        </div>

        <div className="flex-1 p-5 flex flex-col gap-4 overflow-auto">
          <textarea
            value={requirement}
            onChange={(e) => syncRequirement(e.target.value)}
            placeholder="Enter your SAP requirement...&#10;&#10;Example: Create a custom report to display purchase orders with vendor details, filtered by date range and plant. Include ALV grid display with drill-down to ME23N."
            className="flex-1 min-h-[200px] w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none resize-none text-sm leading-relaxed transition-all"
          />
           <input
  type="file"
  accept="application/pdf"
  onChange={handleFileUpload}
  className="border border-gray-300 rounded-lg p-2 cursor-pointer 
             file:bg-blue-500 file:text-white file:border-0 
             file:px-4 file:py-2 file:rounded-md 
             file:mr-4 hover:file:bg-blue-600"
/>
      

          <button
            onClick={handleGenerateSpecs}
            disabled={isGenerating  || !requirement.trim()}
            className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all text-sm shadow-sm hover:shadow-md"
          >
            <Sparkles className="w-4 h-4" />
            Generate Specs
          </button>
           <button onClick={()=>handleSendToCopilot()}>send to Copiolet</button>

          {isGenerating && (
            <div className="pt-2">
              <ProgressBar />
            </div>
          )}

          {/* Approval Section */}
          {hasSpecs && !project.approved && (
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-700 dark:text-amber-400">Review Required</span>
              </div>
              <p className="text-xs text-amber-600 dark:text-amber-500 mb-3">
                Review the generated specifications and approve to enable ABAP code generation.
              </p>
              <button
                onClick={handleApprove}
                className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors text-sm"
              >
                <CheckCircle2 className="w-4 h-4 inline mr-1.5" />
                Approve Specifications
              </button>
            </div>
          )}

          {project.approved && !hasAbap && (
            <button
              onClick={handleGenerateAbap}
              disabled={isGenerating}
              className="w-full flex items-center justify-center gap-2 py-3 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all text-sm shadow-sm"
            >
              <Code2 className="w-4 h-4" />
              Generate ABAP Code
            </button>
          )}

          {/* Version History */}
          <VersionHistory versions={project.versions} />
        </div>
      </div>

      {/* Right Panel - Output */}
      <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-950 overflow-hidden">
        {/* Tabs */}
        <div className="flex items-center border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-6">
          {(['fs', 'ts', 'abap'] as const).map((tab) => {
            const labels = { fs: 'Functional Spec', ts: 'Technical Spec', abap: 'ABAP Code' };
            const disabled = tab === 'abap' && !hasAbap;
            return (
              <button
                key={tab}
                onClick={() => !disabled && setActiveTab(tab)}
                disabled={disabled}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                  activeTab === tab
                    ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                    : disabled
                    ? 'border-transparent text-gray-300 dark:text-gray-600 cursor-not-allowed'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {labels[tab]}
              </button>
            );
          })}

          {/* Action buttons */}
          <div className="ml-auto flex items-center gap-1">
            {activeTab === 'fs' && hasSpecs && (
              <>
                <ActionBtn icon={<Edit3 className="w-3.5 h-3.5" />} label="Edit" onClick={handleEditFs} />
                <ActionBtn icon={<Copy className="w-3.5 h-3.5" />} label="Copy" onClick={() => copyToClipboard(project.functionalSpec, 'FS')} />
                <ActionBtn icon={<FileDown className="w-3.5 h-3.5" />} label="PDF" onClick={() => exportToPDF('Functional Specification', project.functionalSpec, `${project.name}_FS.pdf`)} />
              </>
            )}
            {activeTab === 'ts' && hasSpecs && (
              <>
                <ActionBtn icon={<Edit3 className="w-3.5 h-3.5" />} label="Edit" onClick={handleEditTs} />
                <ActionBtn icon={<Copy className="w-3.5 h-3.5" />} label="Copy" onClick={() => copyToClipboard(project.technicalSpec, 'TS')} />
                <ActionBtn icon={<FileDown className="w-3.5 h-3.5" />} label="PDF" onClick={() => exportToPDF('Technical Specification', project.technicalSpec, `${project.name}_TS.pdf`)} />
              </>
            )}
            {activeTab === 'abap' && hasAbap && (
              <>
                <ActionBtn icon={<Copy className="w-3.5 h-3.5" />} label="Copy" onClick={() => copyToClipboard(project.abapCode, 'ABAP Code')} />
                <ActionBtn icon={<Download className="w-3.5 h-3.5" />} label="Download" onClick={downloadAbap} />
              </>
            )}
            {(activeTab === 'fs' || activeTab === 'ts') && hasSpecs && (
              <ActionBtn icon={<RotateCcw className="w-3.5 h-3.5" />} label="Regenerate" onClick={handleRegenerate} />
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {isGenerating && !hasSpecs ? (
            <SkeletonLoader lines={12} />
          ) : activeTab === 'fs' ? (
            editingFs ? (
              <div className="space-y-3">
                <textarea
                  value={editFsContent}
                  onChange={(e) => setEditFsContent(e.target.value)}
                  className="w-full min-h-[400px] px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm leading-relaxed resize-none focus:ring-2 focus:ring-emerald-500 outline-none"
                />
                <div className="flex gap-2">
                  <button onClick={saveFsEdit} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">Save</button>
                  <button onClick={() => setEditingFs(false)} className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-sm transition-colors">Cancel</button>
                </div>
              </div>
            ) : project.functionalSpec ? (
              <SpecContent content={project.functionalSpec} />
            ) : (
              <EmptyState message="Generate specifications to see the Functional Specification here" />
            )
          ) : activeTab === 'ts' ? (
            editingTs ? (
              <div className="space-y-3">
                <textarea
                  value={editTsContent}
                  onChange={(e) => setEditTsContent(e.target.value)}
                  className="w-full min-h-[400px] px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm leading-relaxed resize-none focus:ring-2 focus:ring-emerald-500 outline-none"
                />
                <div className="flex gap-2">
                  <button onClick={saveTsEdit} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">Save</button>
                  <button onClick={() => setEditingTs(false)} className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-sm transition-colors">Cancel</button>
                </div>
              </div>
            ) : project.technicalSpec ? (
              <SpecContent content={project.technicalSpec} />
            ) : (
              <EmptyState message="Generate specifications to see the Technical Specification here" />
            )
          ) : activeTab === 'abap' ? (
            hasAbap ? (
              <AbapEditor code={project.abapCode} />
            ) : (
              <EmptyState message="Approve specifications and generate ABAP code" />
            )
          ) : null}
        </div>
      </div>

      {/* Edit modals rendered inline above */}
    </div>
  );
}

function ActionBtn({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title={label}
      className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
    >
      {icon}
    </button>
  );
}

function SpecContent({ content }: { content: string }) {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      {content.split('\n').map((line, i) => {
        if (line.startsWith('# ')) return <h1 key={i} className="text-xl font-bold text-gray-900 dark:text-white mt-6 mb-3">{line.replace('# ', '')}</h1>;
        if (line.startsWith('## ')) return <h2 key={i} className="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-5 mb-2">{line.replace('## ', '')}</h2>;
        if (line.startsWith('### ')) return <h3 key={i} className="text-base font-semibold text-gray-700 dark:text-gray-300 mt-4 mb-2">{line.replace('### ', '')}</h3>;
        if (line.startsWith('- ')) return <li key={i} className="text-sm text-gray-600 dark:text-gray-400 ml-4">{line.replace('- ', '')}</li>;
        if (line.startsWith('---')) return <hr key={i} className="my-4 border-gray-200 dark:border-gray-700" />;
        if (line.trim() === '') return <br key={i} />;
        return <p key={i} className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{line}</p>;
      })}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-600">
      <FileDown className="w-10 h-10 mb-3 opacity-40" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
