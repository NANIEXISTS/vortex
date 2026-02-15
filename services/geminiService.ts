
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
        throw new Error(errorText || 'Analysis failed');
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
            throw new Error('Chat failed');
        }

        const data = await res.json();
        return data.response;
    } catch (e) {
        console.error(e);
        return "I am currently unable to reach the Vortex core. Please try again later.";
    }
};
