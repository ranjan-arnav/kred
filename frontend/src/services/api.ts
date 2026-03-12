import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 120000, // 2 min timeout for LLM calls
});

// Global error interceptor — logs all API errors to console
apiClient.interceptors.response.use(
    response => response,
    error => {
        const status = error?.response?.status;
        const detail = error?.response?.data?.detail || error.message;
        console.error(`[API Error] ${status || 'NETWORK'}: ${detail}`);
        return Promise.reject(error);
    }
);

export const kredApi = {
    checkHealth: async () => {
        const response = await apiClient.get('/health');
        return response.data;
    },

    analyzeCompany: async (companyName: string, insights: string[] = [], financialData: Record<string, number> = {}) => {
        const response = await apiClient.post('/analyze', {
            company_name: companyName,
            insights: insights,
            financial_data: Object.keys(financialData).length > 0 ? financialData : undefined
        });
        return response.data;
    },

    performResearch: async (companyName: string, documentContext?: string) => {
        const response = await apiClient.post('/research', {
            company_name: companyName,
            document_context: documentContext
        });
        return response.data;
    },

    uploadPdf: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await axios.post(`${API_BASE_URL}/ingest/pdf`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: 30000,
        });
        return response.data;
    },

    uploadBankStatement: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await axios.post(`${API_BASE_URL}/ingest/bank`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: 30000,
        });
        return response.data;
    },

    runFraudScan: async (companyName?: string) => {
        const response = await apiClient.post('/fraud-scan', companyName ? { company_name: companyName } : {});
        return response.data;
    },

    runStressTest: async () => {
        const response = await apiClient.post('/stress-test');
        return response.data;
    },

    addPrimaryInsight: async (companyName: string, insight: string) => {
        const response = await apiClient.post('/primary-insight', {
            company_name: companyName,
            insight: insight
        });
        return response.data;
    },

    storeSession: async (data: any) => {
        const response = await apiClient.post('/cam/store', data);
        return response.data;
    },

    downloadCam: (sessionId: string) => {
        window.open(`${API_BASE_URL}/cam/${sessionId}`, '_blank');
    },

    runEws: async (companyName: string, features: Record<string, number> = {}) => {
        const response = await apiClient.post('/ews', { company_name: companyName, features });
        return response.data;
    },

    checkCrilc: async (companyName: string) => {
        const response = await apiClient.post('/crilc-check', { company_name: companyName });
        return response.data;
    },

    getSectorBenchmark: async (industry: string, features: Record<string, number> = {}) => {
        const response = await apiClient.post('/sector-benchmark', { industry, features });
        return response.data;
    },

    getCashflowProjection: async (companyName: string, features: Record<string, number> = {}) => {
        const response = await apiClient.post('/cashflow-projection', { company_name: companyName, features });
        return response.data;
    },

    getSmartCovenants: async (companyName: string, shapValues: any[] = [], grade: string = 'B') => {
        const response = await apiClient.post('/smart-covenants', {
            company_name: companyName,
            shap_values: shapValues,
            grade,
        });
        return response.data;
    },
};
