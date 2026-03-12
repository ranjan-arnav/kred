import React, { useState, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import StepProgress from '../components/StepProgress';
import { useNavigate } from 'react-router-dom';
import { kredApi } from '../services/api';
import { useAppContext } from '../context/AppContext';

interface UploadedFile {
    id: string;
    name: string;
    size: string;
    status: 'uploading' | 'ready' | 'error';
    progress: number;
    errorMsg?: string;
    docType?: string;
    category: 'structured' | 'unstructured';
    extractedData?: any;
}


const Documents: React.FC = () => {
    const navigate = useNavigate();
    const { companyName, addUploadedFile, completeStep, setCurrentStep, setExtractedFinancials } = useAppContext();
    const structuredRef = useRef<HTMLInputElement>(null);
    const unstructuredRef = useRef<HTMLInputElement>(null);
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [logs, setLogs] = useState<string[]>([
        "> KRED DATA INGESTION ENGINE v4.2",
        "> SESSION ACTIVE — AWAITING DOCUMENT UPLOAD",
    ]);

    const addLog = (msg: string) => {
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, category: 'structured' | 'unstructured') => {
        if (!e.target.files || e.target.files.length === 0) return;

        for (const file of Array.from(e.target.files)) {
            const fileId = `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
            const newFile: UploadedFile = {
                id: fileId,
                name: file.name,
                size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
                status: 'uploading',
                progress: 10,
                category,
            };

            setFiles(prev => [newFile, ...prev]);
            addLog(`DETECTED: ${file.name} [${category.toUpperCase()}]`);

            try {
                setFiles(prev => prev.map(f => f.id === fileId ? { ...f, progress: 50 } : f));

                let response;
                if (category === 'structured' || file.name.endsWith('.csv')) {
                    addLog(`> PARSING BANK STATEMENT / STRUCTURED DATA...`);
                    response = await kredApi.uploadBankStatement(file);
                } else {
                    addLog(`> OCR + NLP PIPELINE ACTIVE...`);
                    response = await kredApi.uploadPdf(file);
                }

                setFiles(prev => prev.map(f => f.id === fileId ? { ...f, progress: 80 } : f));

                const fileDocType = response.document_type || (response.format === 'csv' ? 'STRUCTURED CSV' : 'UNKNOWN');
                addLog(`> EXTRACTION COMPLETE: ${fileDocType}`);
                if (response.financial_figures?.length > 0) {
                    addLog(`> FOUND ${response.financial_figures.length} FINANCIAL FIGURES`);
                }
                if (response.risk_signals?.length > 0) {
                    addLog(`! RISK SIGNALS DETECTED: ${response.risk_signals.length}`);
                }
                if (response.identifiers) {
                    const ids = Object.entries(response.identifiers)
                        .filter(([, v]) => v && (v as any[]).length > 0)
                        .map(([k]) => k.toUpperCase());
                    if (ids.length > 0) addLog(`> IDENTIFIERS: ${ids.join(', ')}`);
                }

                setFiles(prev => prev.map(f =>
                    f.id === fileId ? {
                        ...f,
                        status: 'ready',
                        progress: 100,
                        docType: response.document_type || (response.format === 'csv' ? 'Structured CSV' : 'Document'),
                        extractedData: response,
                    } : f
                ));

                // Store in AppContext
                addUploadedFile({
                    name: file.name,
                    category,
                    docType: response.document_type,
                    data: response,
                });

                // If financial data extracted, save to context
                if (response.financial_figures && response.financial_figures.length > 0) {
                    const financials: Record<string, number> = {};
                    response.financial_figures.forEach((fig: any) => {
                        const key = fig.context?.toLowerCase() || '';
                        if (key.includes('revenue')) financials['revenue_growth_yoy'] = parseFloat(fig.amount) || 0;
                        if (key.includes('ebitda')) financials['ebitda_margin'] = parseFloat(fig.amount) || 0;
                    });
                    if (Object.keys(financials).length > 0) setExtractedFinancials(financials);
                }

            } catch (error: any) {
                console.error("Upload error", error);
                addLog(`! ERROR: ${error.response?.data?.detail || 'PARSING FAILED'} — ${file.name}`);
                setFiles(prev => prev.map(f => f.id === fileId ? {
                    ...f,
                    status: 'error',
                    errorMsg: error.response?.data?.detail || "INVALID FORMAT"
                } : f));
            }
        }

        // Reset inputs
        if (structuredRef.current) structuredRef.current.value = '';
        if (unstructuredRef.current) unstructuredRef.current.value = '';
    };

    const readyFiles = files.filter(f => f.status === 'ready');
    const hasFiles = readyFiles.length > 0;

    const handleProceed = () => {
        completeStep(1);
        setCurrentStep(2);
        navigate('/research');
    };

    return (
        <div className="bg-white text-black font-body antialiased min-h-screen flex flex-col overflow-hidden">
            <Header />
            <StepProgress />

            <main className="flex-1 flex overflow-hidden">
                <Sidebar />

                {/* Column 1: Upload Zone */}
                <section className="flex-1 min-w-[300px] border-r border-black p-6 flex flex-col bg-white">
                    <h2 className="font-display font-extrabold text-xl mb-1 tracking-tight">01. DATA INGESTION</h2>
                    <p className="font-mono text-xs text-gray-500 mb-4">
                        {companyName || 'Step 1'} — Upload financial documents for analysis
                    </p>

                    {/* Structured Data Upload */}
                    <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="material-symbols-outlined text-[#FF3300] text-base">table_chart</span>
                            <span className="font-mono text-xs font-bold uppercase">Structured Data</span>
                        </div>
                        <div
                            onClick={() => structuredRef.current?.click()}
                            className="border-2 border-dashed border-gray-300 hover:border-[#FF3300] bg-[#F4F4F4]/30 hover:bg-red-50/30 p-4 flex items-center gap-3 cursor-pointer transition-all"
                        >
                            <span className="material-symbols-outlined text-2xl text-gray-400">upload_file</span>
                            <div>
                                <p className="font-mono text-xs font-bold">GST Filings • ITR • Bank Statements</p>
                                <p className="font-mono text-[10px] text-gray-400">CSV, XLSX, JSON</p>
                            </div>
                        </div>
                        <input ref={structuredRef} type="file" onChange={e => handleFileSelect(e, 'structured')} className="hidden" accept=".csv,.xlsx,.json" aria-hidden="true" multiple />
                    </div>

                    {/* Unstructured Data Upload */}
                    <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="material-symbols-outlined text-base">article</span>
                            <span className="font-mono text-xs font-bold uppercase">Unstructured Data</span>
                        </div>
                        <div
                            onClick={() => unstructuredRef.current?.click()}
                            className="border-2 border-dashed border-gray-300 hover:border-black bg-[#F4F4F4]/30 hover:bg-gray-50 p-4 flex items-center gap-3 cursor-pointer transition-all"
                        >
                            <span className="material-symbols-outlined text-2xl text-gray-400">picture_as_pdf</span>
                            <div>
                                <p className="font-mono text-xs font-bold">Annual Reports • Board Minutes • Legal Notices</p>
                                <p className="font-mono text-[10px] text-gray-400">PDF (OCR enabled)</p>
                            </div>
                        </div>
                        <input ref={unstructuredRef} type="file" onChange={e => handleFileSelect(e, 'unstructured')} className="hidden" accept=".pdf" aria-hidden="true" multiple />
                    </div>

                    {/* Cross-Reference Status */}
                    {files.filter(f => f.category === 'structured' && f.status === 'ready').length > 0 &&
                        files.filter(f => f.category === 'unstructured' && f.status === 'ready').length > 0 && (
                            <div className="border-2 border-green-600 bg-green-50 p-3 mb-4">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-green-600 text-sm">check_circle</span>
                                    <span className="font-mono text-xs font-bold text-green-800">CROSS-REFERENCE READY</span>
                                </div>
                                <p className="font-mono text-[10px] text-green-700 mt-1">
                                    Both structured and unstructured data uploaded — GST vs Bank Statement comparison will be performed during analysis
                                </p>
                            </div>
                        )}

                    <div className="mt-auto pt-4 border-t border-black">
                        <button
                            onClick={handleProceed}
                            disabled={!hasFiles}
                            className={`w-full h-12 font-display font-black text-base tracking-wide flex items-center justify-center gap-2 border border-black transition-all ${hasFiles
                                ? 'bg-[#FF3300] text-white hover:bg-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            PROCEED TO RESEARCH <span className="material-symbols-outlined">arrow_forward</span>
                        </button>
                        {!hasFiles && (
                            <p className="font-mono text-[10px] text-gray-400 text-center mt-2">Upload at least one document to proceed</p>
                        )}
                    </div>
                </section>

                {/* Column 2: File Inventory */}
                <section className="flex-1 min-w-[300px] border-r border-black flex flex-col bg-white">
                    <div className="p-6 pb-3 border-b border-black bg-white sticky top-0 z-10">
                        <h2 className="font-display font-extrabold text-xl mb-1 tracking-tight">02. INVENTORY</h2>
                        <p className="font-mono text-xs text-gray-500">{readyFiles.length} FILES PARSED • {files.filter(f => f.status === 'uploading').length} PROCESSING</p>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-[#FAFAFA]">
                        {files.length === 0 && (
                            <div className="text-center py-10 font-mono text-sm text-gray-400">
                                NO FILES UPLOADED YET
                            </div>
                        )}

                        {files.map((file, idx) => (
                            <div key={file.id} className={`relative bg-white border ${file.status === 'error' ? 'border-[#FF3300]' : 'border-black'} p-3 transition-all group cursor-pointer hover:shadow-[4px_4px_0px_0px_rgba(255,51,0,1)] hover:border-[#FF3300]`}>
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className={`material-symbols-outlined text-xl ${file.status === 'error' ? 'text-[#FF3300]' : 'text-gray-400'}`}>
                                            {file.category === 'structured' ? 'table_chart' : 'description'}
                                        </span>
                                        <div>
                                            <h4 className="font-mono font-bold text-xs leading-tight">{file.name}</h4>
                                            <span className="font-mono text-[10px] text-gray-500">
                                                {file.size} • {file.category.toUpperCase()}
                                                {file.docType && ` • ${file.docType}`}
                                            </span>
                                        </div>
                                    </div>
                                    {file.status === 'uploading' && <span className="material-symbols-outlined animate-spin text-[#FF3300] text-sm">progress_activity</span>}
                                    {file.status === 'ready' && <span className="material-symbols-outlined text-green-600 text-sm">check_circle</span>}
                                    {file.status === 'error' && <span className="material-symbols-outlined text-[#FF3300] text-sm">error</span>}
                                </div>

                                {file.status === 'uploading' && (
                                    <div className="w-full h-1 bg-gray-100">
                                        <div className="h-full bg-[#FF3300] transition-all progress-bar-fill" style={{ '--progress-w': `${file.progress}%` } as React.CSSProperties}></div>
                                    </div>
                                )}

                                {file.status === 'ready' && file.extractedData && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {file.extractedData.risk_signals?.length > 0 && (
                                            <span className="px-1.5 py-0.5 bg-red-50 border border-red-300 text-[9px] font-mono font-bold text-red-700">
                                                {file.extractedData.risk_signals.length} RISKS
                                            </span>
                                        )}
                                        {file.extractedData.positive_signals?.length > 0 && (
                                            <span className="px-1.5 py-0.5 bg-green-50 border border-green-300 text-[9px] font-mono font-bold text-green-700">
                                                {file.extractedData.positive_signals.length} POSITIVE
                                            </span>
                                        )}
                                        {file.extractedData.financial_figures?.length > 0 && (
                                            <span className="px-1.5 py-0.5 bg-blue-50 border border-blue-300 text-[9px] font-mono font-bold text-blue-700">
                                                {file.extractedData.financial_figures.length} FIGURES
                                            </span>
                                        )}
                                        {file.extractedData.parsing_summary?.total_rows !== undefined && (
                                            <span className="px-1.5 py-0.5 bg-purple-50 border border-purple-300 text-[9px] font-mono font-bold text-purple-700">
                                                {file.extractedData.parsing_summary.total_rows} ROWS
                                            </span>
                                        )}
                                        {file.extractedData.parsing_summary?.total_transactions_detected !== undefined && (
                                            <span className="px-1.5 py-0.5 bg-indigo-50 border border-indigo-300 text-[9px] font-mono font-bold text-indigo-700">
                                                {file.extractedData.parsing_summary.total_transactions_detected} TXNS
                                            </span>
                                        )}
                                        <span className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 text-[9px] font-mono font-bold">
                                            {file.extractedData.total_pages || 1} {file.extractedData.format === 'csv' ? 'FILE' : 'PAGES'}
                                        </span>
                                    </div>
                                )}

                                {file.status === 'error' && (
                                    <span className="text-[10px] font-mono font-bold text-[#FF3300]">! {file.errorMsg}</span>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                {/* Column 3: Terminal Console */}
                <section className="flex-1 min-w-[300px] flex flex-col bg-black text-[#00FF00] overflow-hidden">
                    <div className="p-6 pb-3 border-b border-[#333] bg-black sticky top-0 z-10">
                        <h2 className="font-display font-extrabold text-xl mb-1 tracking-tight text-white">03. SYSTEM LOG</h2>
                        <div className="flex items-center gap-2">
                            <div className="size-2 bg-[#00FF00] animate-pulse rounded-full"></div>
                            <p className="font-mono text-xs text-[#00FF00]">PIPELINE ACTIVE</p>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 font-mono text-xs leading-relaxed terminal-glow">
                        {logs.map((log, idx) => (
                            <div key={idx} className={`mb-1.5 ${log.includes('ERROR') || log.includes('!') ? 'text-[#FF3300]' : log.includes('COMPLETE') || log.includes('FOUND') ? 'text-[#00FF00]' : 'text-white/80'}`}>
                                {log}
                            </div>
                        ))}
                        <div className="mt-4 flex items-center gap-1">
                            <span className="text-white">{'>'}</span>
                            <span className="animate-pulse bg-[#00FF00] w-2 h-4 block"></span>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Documents;
