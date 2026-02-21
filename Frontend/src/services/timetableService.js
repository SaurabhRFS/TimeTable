const API_URL = 'http://localhost:8080/api/timetable';

export const getTimetable = async (dept, sem, section) => {
    const response = await fetch(`${API_URL}?dept=${dept}&sem=${sem}&section=${section}`);
    if (!response.ok) throw new Error('Failed to fetch timetable');
    return response.json();
};

export const addManualEntry = async (entryData) => {
    const response = await fetch(`${API_URL}/manual`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(entryData),
    });
    if (!response.ok) throw new Error('Failed to add manual entry');
    return response.json();
};

export const deleteEntry = async (id) => {
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete entry');
    
    const text = await response.text();
    return text ? JSON.parse(text) : {};
};

export const autoGenerateGrid = async (dept, sem, section) => {
    const response = await fetch(`${API_URL}/generate?dept=${dept}&sem=${sem}&section=${section}`, {
        method: 'POST'
    });
    if (!response.ok) throw new Error('Failed to auto-generate');
    return response.json();
};