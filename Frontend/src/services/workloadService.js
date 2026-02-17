const BASE_URL = import.meta.env.VITE_API_URL;
const API_URL = `${BASE_URL}/workload`;

// 1. Get existing assignments
export const getWorkload = async (dept, sem) => {
    const response = await fetch(`${API_URL}?dept=${dept}&sem=${sem}`);
    if (!response.ok) throw new Error("Failed to fetch workload");
    return response.json();
};

// 2. Assign a Teacher
export const assignTeacher = async (assignmentData) => {
    const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(assignmentData),
    });
    if (!response.ok) throw new Error("Failed to save assignment");
    return response.json();
};