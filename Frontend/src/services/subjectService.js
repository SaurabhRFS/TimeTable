const BASE_URL = import.meta.env.VITE_API_URL;
const API_URL = `${BASE_URL}/subjects`;

// 1. Get Subjects (We already have this)
export const getSubjectsBySem = async (dept, sem) => {
    const response = await fetch(`${API_URL}/filter?dept=${dept}&sem=${sem}`);
    if (!response.ok) throw new Error("Failed to fetch subjects");
    return response.json();
};

// 2. ADD Subject (MAKE SURE THIS IS HERE)
export const addSubject = async (subjectData) => {
    const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subjectData),
    });
    if (!response.ok) throw new Error("Failed to add subject");
    return response.json();
};