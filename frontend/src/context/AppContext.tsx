import React, { createContext, useContext, useState, type ReactNode } from 'react';

// Types for analysis data
interface AnalysisData {
    session_id: string;
    company_name: string;
    company?: string;
    model_metrics: {
        score: number;
        grade: string;
        grade_description: string;
        pd_probability: number;
        five_c?: { character: number; capacity: number; capital: number; collateral: number; conditions: number; };
    };
    shap_values: Array<{
        feature: string;
        feature_key: string;
        value: string;
        impact: number;
        type: string;
        desc: string;
    }>;
    five_cs?: {
        character: number;
        capacity: number;
        capital: number;
        collateral: number;
        conditions: number;
    };
    committee_decision: {
        verdict: string;
        bull_argument: string;
        bear_argument: string;
        judge_verdict?: string;
        judge_reasoning?: string;
        confidence?: number;
        suggested_limit?: string;
        suggested_rate?: string;
    };
    decision?: {
        recommendation: string;
        loan_limit_cr: number;
        interest_rate_pct: number;
        risk_premium_bps: number;
        conditions: string[];
    };
    input_features?: Record<string, number>;
    research_summary?: string;
    fraud_scan?: any;
    stress_test?: any;
    uploaded_documents?: any[];
}

interface DueDiligenceData {
    factoryVisit: string;
    capacityUtilization: number;
    managementNotes: string;
    promoterAssessment: string;
    additionalRisks: string;
    financialOverrides: Record<string, number>;
}

interface AppState {
    mode: 'real' | 'demo';
    isAnalyzed: boolean;
    analysisData: AnalysisData | null;
    uploadedFiles: any[];
    researchData: any | null;
    fraudData: any | null;
    stressData: any | null;
    companyName: string;
    currentStep: number;
    completedSteps: Set<number>;
    dueDiligenceData: DueDiligenceData | null;
    extractedFinancials: Record<string, number>;
}

interface AppContextType extends Omit<AppState, 'completedSteps'> {
    completedSteps: Set<number>;
    setMode: (mode: 'real' | 'demo') => void;
    setAnalysisData: (data: AnalysisData) => void;
    setUploadedFiles: (files: any[]) => void;
    addUploadedFile: (file: any) => void;
    setResearchData: (data: any) => void;
    setFraudData: (data: any) => void;
    setStressData: (data: any) => void;
    setCompanyName: (name: string) => void;
    setCurrentStep: (step: number) => void;
    completeStep: (step: number) => void;
    setDueDiligenceData: (data: DueDiligenceData) => void;
    setExtractedFinancials: (data: Record<string, number>) => void;
    clearSession: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
    const ctx = useContext(AppContext);
    if (!ctx) throw new Error('useAppContext must be inside AppProvider');
    return ctx;
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, setState] = useState<AppState>(() => {
        const mode = (localStorage.getItem('kred_mode') as 'real' | 'demo') || 'real';
        const savedData = localStorage.getItem('kred_analysis_data');
        let analysisData: AnalysisData | null = null;
        if (savedData) {
            try { analysisData = JSON.parse(savedData); } catch { /* ignore */ }
        }
        const savedSteps = localStorage.getItem('kred_completed_steps');
        let completedSteps = new Set<number>();
        if (savedSteps) {
            try { completedSteps = new Set(JSON.parse(savedSteps)); } catch { /* ignore */ }
        }
        return {
            mode,
            isAnalyzed: !!analysisData,
            analysisData,
            uploadedFiles: JSON.parse(localStorage.getItem('kred_uploaded_files') || '[]'),
            researchData: JSON.parse(localStorage.getItem('kred_research_data') || 'null'),
            fraudData: JSON.parse(localStorage.getItem('kred_fraud_data') || 'null'),
            stressData: JSON.parse(localStorage.getItem('kred_stress_data') || 'null'),
            companyName: localStorage.getItem('kred_company_name') || '',
            currentStep: parseInt(localStorage.getItem('kred_current_step') || '1'),
            completedSteps,
            dueDiligenceData: JSON.parse(localStorage.getItem('kred_due_diligence') || 'null'),
            extractedFinancials: JSON.parse(localStorage.getItem('kred_extracted_financials') || '{}'),
        };
    });

    const setMode = (mode: 'real' | 'demo') => {
        localStorage.setItem('kred_mode', mode);
        setState(s => ({ ...s, mode }));
    };

    const setAnalysisData = (data: AnalysisData) => {
        localStorage.setItem('kred_analysis_data', JSON.stringify(data));
        const name = data.company_name || data.company || '';
        localStorage.setItem('kred_company_name', name);
        setState(s => ({ ...s, analysisData: data, isAnalyzed: true, companyName: name || s.companyName }));
    };

    const setUploadedFiles = (files: any[]) => {
        localStorage.setItem('kred_uploaded_files', JSON.stringify(files));
        setState(s => ({ ...s, uploadedFiles: files }));
    };

    const addUploadedFile = (file: any) => {
        setState(s => {
            const updated = [...s.uploadedFiles, file];
            localStorage.setItem('kred_uploaded_files', JSON.stringify(updated));
            return { ...s, uploadedFiles: updated };
        });
    };

    const setResearchData = (data: any) => {
        localStorage.setItem('kred_research_data', JSON.stringify(data));
        setState(s => ({ ...s, researchData: data }));
    };

    const setFraudData = (data: any) => {
        localStorage.setItem('kred_fraud_data', JSON.stringify(data));
        setState(s => ({ ...s, fraudData: data }));
    };

    const setStressData = (data: any) => {
        localStorage.setItem('kred_stress_data', JSON.stringify(data));
        setState(s => ({ ...s, stressData: data }));
    };

    const setCompanyName = (name: string) => {
        localStorage.setItem('kred_company_name', name);
        setState(s => ({ ...s, companyName: name }));
    };

    const setCurrentStep = (step: number) => {
        localStorage.setItem('kred_current_step', String(step));
        setState(s => ({ ...s, currentStep: step }));
    };

    const completeStep = (step: number) => {
        setState(s => {
            const updated = new Set(s.completedSteps);
            updated.add(step);
            localStorage.setItem('kred_completed_steps', JSON.stringify([...updated]));
            const nextStep = Math.max(s.currentStep, step + 1);
            localStorage.setItem('kred_current_step', String(nextStep));
            return { ...s, completedSteps: updated, currentStep: nextStep };
        });
    };

    const setDueDiligenceData = (data: DueDiligenceData) => {
        localStorage.setItem('kred_due_diligence', JSON.stringify(data));
        setState(s => ({ ...s, dueDiligenceData: data }));
    };

    const setExtractedFinancials = (data: Record<string, number>) => {
        localStorage.setItem('kred_extracted_financials', JSON.stringify(data));
        setState(s => ({ ...s, extractedFinancials: data }));
    };

    const clearSession = () => {
        ['kred_analysis_data', 'kred_uploaded_files', 'kred_research_data',
            'kred_fraud_data', 'kred_stress_data', 'kred_company_name',
            'kred_session_id', 'kred_completed_steps', 'kred_current_step',
            'kred_due_diligence', 'kred_extracted_financials'].forEach(k => localStorage.removeItem(k));
        setState({
            mode: state.mode,
            isAnalyzed: false,
            analysisData: null,
            uploadedFiles: [],
            researchData: null,
            fraudData: null,
            stressData: null,
            companyName: '',
            currentStep: 1,
            completedSteps: new Set(),
            dueDiligenceData: null,
            extractedFinancials: {},
        });
    };

    return (
        <AppContext.Provider value={{
            ...state,
            setMode, setAnalysisData, setUploadedFiles, addUploadedFile,
            setResearchData, setFraudData, setStressData, setCompanyName,
            setCurrentStep, completeStep, setDueDiligenceData, setExtractedFinancials,
            clearSession,
        }}>
            {children}
        </AppContext.Provider>
    );
};
