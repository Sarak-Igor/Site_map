import axios from 'axios';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://127.0.0.1:8000';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export interface ApiKeyStatus {
    service: string;
    is_valid: boolean;
    models_status: Array<{
        name: string;
        available: boolean;
        blocked: boolean;
        status: string;
        category?: string;
        tier?: string;
        elo_rating?: number;
        performance_score?: number;
        win_rate?: number;
        total_votes?: number;
        organization?: string;
        license_type?: string;
        tier_reason?: string;
        quota_used?: number;
        quota_limit?: number;
        cost_last_24h?: number;
        input_price?: number;
        output_price?: number;
    }>;
    available_models: string[];
    blocked_models: string[];
    error: string | null;
    models_by_category?: {
        [category: string]: any[];
    };
    credits?: string | number | null;
}

export interface ApiKeyResponse {
    id: string;
    service: string;
    created_at?: string;
    updated_at?: string;
}

export interface ApiKeyCreate {
    service: string;
    api_key: string;
}

export const apiKeysApi = {
    list: async (): Promise<{ api_keys: ApiKeyResponse[]; total: number }> => {
        const response = await api.get('/api/keys/list');
        return response.data;
    },

    create: async (keyData: ApiKeyCreate): Promise<ApiKeyResponse> => {
        const response = await api.post<ApiKeyResponse>('/api/keys/', keyData);
        return response.data;
    },

    delete: async (id: string): Promise<any> => {
        const response = await api.delete(`/api/keys/${id}`);
        return response.data;
    },

    checkSavedStatus: async (service: string): Promise<ApiKeyStatus> => {
        const response = await api.post<ApiKeyStatus>(`/api/keys/check/${service}/saved`);
        return response.data;
    },
};

export interface UsageStatsResponse {
    total_tokens: number;
    input_tokens: number;
    output_tokens: number;
    requests: number;
    models: any[];
    daily_usage: any[];
    period_days: number;
}

export const usageApi = {
    getStats: async (service?: string, days: number = 30): Promise<UsageStatsResponse> => {
        const params: any = { days };
        if (service) params.service = service;
        const response = await api.get<UsageStatsResponse>('/api/usage/stats', { params });
        return response.data;
    },
};

export interface CatalogStatusResponse {
    is_populated: boolean;
    total_models: number;
    last_updated: string | null;
    source: string | null;
    api_available: boolean;
    api_error: string | null;
    using_mock_data: boolean;
}

export const modelCatalogApi = {
    getStatus: async (): Promise<CatalogStatusResponse> => {
        const response = await api.get<CatalogStatusResponse>('/api/model-catalog/status');
        return response.data;
    },

    sync: async (): Promise<any> => {
        const response = await api.post('/api/model-catalog/sync');
        return response.data;
    },

    listModels: async (): Promise<{ total: number; models: any[] }> => {
        const response = await api.get<{ total: number; models: any[] }>('/api/model-catalog/models');
        return response.data;
    },
};

export default api;
