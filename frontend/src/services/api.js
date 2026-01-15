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
        const response = await fetch(`${API_URL}/api/carbon/calculate`, {
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
        console.error('API Error:', error);
        throw error;
    }
};

export const getCarbonSummary = async () => {
    try {
        const response = await fetch(`${API_URL}/api/carbon/summary`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch summary');
        return await response.json();
    } catch (error) {
        console.error('Summary API Error:', error);
        throw error;
    }
};

export const createPlot = async (plotData) => {
    try {
        const response = await fetch(`${API_URL}/api/plots`, {
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
        console.error('Create Plot API Error:', error);
        throw error;
    }
};

export const getPlots = async () => {
    try {
        const response = await fetch(`${API_URL}/api/plots`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch plots');
        return await response.json();
    } catch (error) {
        console.error('Fetch Plots Error:', error);
        throw error;
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
        console.error('Delete Plot Error:', error);
        throw error;
    }
};
