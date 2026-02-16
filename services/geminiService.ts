
// This service now calls our backend API instead of Google directly
const API_URL = '/api';

export const analyzeDocument = async (file: File) => {
    const token = localStorage.getItem('vortex_token');
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_URL}/analyze`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData
    });

    if (!res.ok) {
        const errorText = await res.text();
        let errorMessage = errorText || 'Analysis failed';
        try {
            const errorJson = JSON.parse(errorText);
            // Prioritize details, then error message
            if (errorJson.details) errorMessage = errorJson.details;
            else if (errorJson.error) errorMessage = errorJson.error;
        } catch (e) {
            // Not JSON
        }
        throw new Error(errorMessage);
    }

    return res.json();
};

export const queryAgent = async (
    query: string,
    currentData: any
) => {
    const token = localStorage.getItem('vortex_token');

    try {
        const res = await fetch(`${API_URL}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ query, context: currentData })
        });

        if (!res.ok) {
            const errorText = await res.text();
            let errorMessage = 'Chat failed';
             try {
                const errorJson = JSON.parse(errorText);
                if (errorJson.details) errorMessage = errorJson.details;
                else if (errorJson.error) errorMessage = errorJson.error;
            } catch (e) {
                // Not JSON
            }
            throw new Error(errorMessage);
        }

        const data = await res.json();
        return data.response;
    } catch (e) {
        console.error(e);
        // If the error message is one we threw, use it.
        if (e instanceof Error && e.message && e.message !== 'Chat failed') {
             return `Error: ${e.message}`;
        }
        return "I am currently unable to reach the Vortex core. Please try again later.";
    }
};
