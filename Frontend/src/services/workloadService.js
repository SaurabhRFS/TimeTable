const BASE_URL = import.meta.env.VITE_API_URL;
const API_URL = `${BASE_URL}/workload`; // Note: Your backend uses singular '/workload'

export const getWorkload = async (dept, sem) => {
    const response = await fetch(`${API_URL}?dept=${dept}&sem=${sem}`);
    if (!response.ok) throw new Error("Failed to fetch workloads");
    return response.json();
};

export const assignTeacher = async (data) => {
    const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to assign teacher");
    return response.json();
};

// Added Unassign method to match your @DeleteMapping
export const unassignTeacher = async (subjectId, section, batch) => {
    const response = await fetch(`${API_URL}?subjectId=${subjectId}&section=${section}&batch=${batch}`, {
        method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to unassign teacher");
};