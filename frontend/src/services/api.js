import { MOCK_PLOTS, MOCK_SUMMARY } from './mockData';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const LS_PLOTS_KEY = 'keptcarbon_plots';

const getAuthHeaders = (contentType = 'application/json') => {
    const token = localStorage.getItem('token');
    const headers = {};
    if (contentType) headers['Content-Type'] = contentType;
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
};

// ==========================================
// LOCAL STORAGE HELPERS (PERSISTENCE LAYER)
// ==========================================
// This layer ensures that data is shared between different pages
// (Map, Dashboard, History) even if the backend is not fully ready.

const getLocalPlots = () => {
    try {
        const data = localStorage.getItem(LS_PLOTS_KEY);
        if (data) {
            const parsed = JSON.parse(data);
            if (Array.isArray(parsed)) return parsed;
        }

        // If no data exists yet, initialize with Mock Data
        localStorage.setItem(LS_PLOTS_KEY, JSON.stringify(MOCK_PLOTS));
        return MOCK_PLOTS;
    } catch (e) {
        console.error("Local Storage Error:", e);
        return MOCK_PLOTS;
    }
};

const saveLocalPlot = (plot) => {
    try {
        const plots = getLocalPlots();
        const index = plots.findIndex(p => p.id === plot.id);

        let updatedPlots;
        if (index >= 0) {
            // Update existing
            updatedPlots = plots.map(p => p.id === plot.id ? plot : p);
        } else {
            // Add new
            updatedPlots = [...plots, plot];
        }

        localStorage.setItem(LS_PLOTS_KEY, JSON.stringify(updatedPlots));
        return plot;
    } catch (e) {
        console.error("Save Local Plot Error:", e);
        return plot;
    }
};

const deleteLocalPlot = (id) => {
    try {
        const plots = getLocalPlots();
        const filtered = plots.filter(p => p.id !== id);
        localStorage.setItem(LS_PLOTS_KEY, JSON.stringify(filtered));
        return true;
    } catch (e) {
        console.error("Delete Local Plot Error:", e);
        return false;
    }
};

// ==========================================
// API CLIENT IMPLEMENTATION
// ==========================================

export const calculateCarbon = async (age, areaRai, method = 'tgo') => {
    try {
        const response = await fetch(`${API_URL}/api/carbon/calculate/`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                tree_age: parseInt(age),
                area_rai: parseFloat(areaRai),
                method: method || 'tgo'
            }),
        });

        if (!response.ok) throw new Error('Calculation failed');
        return await response.json();
    } catch (error) {
        console.warn('API Error, using fallback calculation:', error);
        // Standard TGO calculation fallback
        const agb = Math.exp(-2.134 + 2.530 * Math.log(20));
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
        console.warn('Summary API Error, calculating from local data');
        const plots = getLocalPlots();
        const totalCarbon = plots.reduce((sum, p) => sum + (parseFloat(p.carbon_tons || p.carbon || 0)), 0);
        const totalArea = plots.reduce((sum, p) => sum + (parseFloat(p.area_rai || 0)), 0);

        return {
            total_plots: plots.length,
            total_area_rai: totalArea.toFixed(1),
            total_carbon_tons: totalCarbon.toFixed(2),
            total_value_baht: totalCarbon * 250 // Mock valuation
        };
    }
};

export const createPlot = async (plotData) => {
    // Normalization: ensure the keys are consistent for storage
    const normalizedPlot = {
        ...plotData,
        id: plotData.id || `local-${Date.now()}`,
        farmer_name: plotData.farmer_name || plotData.farmerName || 'ไม่ระบุชื่อ',
        carbon_tons: plotData.carbon_tons || plotData.carbon || 0,
        area_rai: plotData.area_rai || plotData.areaRai || 0,
        tree_age: plotData.tree_age || plotData.age || 0,
        created_at: plotData.created_at || new Date().toISOString()
    };

    try {
        const response = await fetch(`${API_URL}/api/plots/`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(normalizedPlot),
        });

        if (!response.ok) throw new Error('API creation failed');
        const savedPlot = await response.json();
        return saveLocalPlot(savedPlot);
    } catch (error) {
        console.warn('Create Plot API Error, saving to local storage instead');
        return saveLocalPlot(normalizedPlot);
    }
};

export const getPlots = async () => {
    try {
        const response = await fetch(`${API_URL}/api/plots/`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch plots');
        const plots = await response.json();
        // Sync API data with local storage
        localStorage.setItem(LS_PLOTS_KEY, JSON.stringify(plots));
        return plots;
    } catch (error) {
        console.warn('Fetch Plots Error, using local storage');
        return getLocalPlots();
    }
};

export const deletePlot = async (id) => {
    try {
        const response = await fetch(`${API_URL}/api/plots/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to delete plot');
        return deleteLocalPlot(id);
    } catch (error) {
        console.warn('Delete Plot Error, updating local storage');
        return deleteLocalPlot(id);
    }
};
