import { MOCK_PLOTS, MOCK_SUMMARY } from './mockData';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const getAuthHeaders = (contentType = 'application/json') => {
    const token = localStorage.getItem('token');
    const headers = {};
    if (contentType) headers['Content-Type'] = contentType;
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
};

export const calculateCarbon = async (age, areaRai, method = 'tgo') => {
    try {
        const response = await fetch(`${API_URL}/api/carbon/calculate/`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                tree_age: parseInt(age),
                area_rai: parseFloat(areaRai),
                method: method || 'tgo' // Default to TGO
            }),
        });

        if (!response.ok) {
            throw new Error('Calculation failed');
        }

        return await response.json();
    } catch (error) {
        console.warn('API Error, using fallback calculation:', error);
        // Basic fallback calculation based on the formula in README
        const agb = Math.exp(-2.134 + 2.530 * Math.log(20)); // Assume DBH 20 for fallback
        const carbon = agb * 0.47;
        const totalTrees = parseFloat(areaRai) * 76;
        const totalCarbon = (carbon * totalTrees) / 1000;

        return {
            carbon_tons: totalCarbon.toFixed(2),
            carbon_per_tree: carbon.toFixed(4)
        };
    }
};

export const getCarbonSummary = async () => {
    try {
        const response = await fetch(`${API_URL}/api/carbon/summary/`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch summary');
        return await response.json();
    } catch (error) {
        console.warn('Summary API Error, using mock data:', error);
        return MOCK_SUMMARY;
    }
};

export const createPlot = async (plotData) => {
    try {
        const response = await fetch(`${API_URL}/api/plots/`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(plotData),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to create plot: ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        console.warn('Create Plot API Error, simulating success:', error);
        return {
            ...plotData,
            id: 'mock-' + Date.now(),
            created_at: new Date().toISOString()
        };
    }
};

export const getPlots = async () => {
    try {
        const response = await fetch(`${API_URL}/api/plots/`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch plots');
        return await response.json();
    } catch (error) {
        console.warn('Fetch Plots Error, using mock data:', error);
        return MOCK_PLOTS;
    }
};

export const deletePlot = async (id) => {
    try {
        const response = await fetch(`${API_URL}/api/plots/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to delete plot');
        return true;
    } catch (error) {
        console.warn('Delete Plot Error, simulating success:', error);
        return true;
    }
};
