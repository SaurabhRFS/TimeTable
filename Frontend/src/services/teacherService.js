const BASE_URL = import.meta.env.VITE_API_URL; 
const API_URL = `${BASE_URL}/teachers`;

export const getAllTeachers = async () => {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("Failed to fetch teachers");
    return response.json();
};

export const addTeacher = async (teacherData) => {
    const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(teacherData),
    });
    if (!response.ok) throw new Error("Failed to add teacher");
    return response.json();
};

// --- ADD THIS: UPDATE FUNCTION ---
export const updateTeacher = async (id, teacherData) => {
    const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(teacherData),
    });
    if (!response.ok) throw new Error("Failed to update teacher");
    return response.json();
};

// --- ADD THIS: DELETE FUNCTION ---
export const deleteTeacher = async (id) => {
    const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete teacher");
};