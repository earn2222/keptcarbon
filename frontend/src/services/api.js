const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const calculateCarbon = async (age, areaRai) => {
    try {
        const response = await fetch(`${API_URL}/api/carbon/calculate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                tree_age: parseInt(age),
                area_rai: parseFloat(areaRai)
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
        const response = await fetch(`${API_URL}/api/carbon/summary`);
        if (!response.ok) throw new Error('Failed to fetch summary');
        return await response.json();
    } catch (error) {
        console.error('Summary API Error:', error);
        throw error;
    }
};

export const createPlot = async (plotData) => {
    try {
        const response = await fetch(`${API_URL}/api/plots/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
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
        const response = await fetch(`${API_URL}/api/plots/`);
        if (!response.ok) throw new Error('Failed to fetch plots');
        return await response.json();
    } catch (error) {
        console.error('Fetch Plots Error:', error);
        throw error;
    }
};
