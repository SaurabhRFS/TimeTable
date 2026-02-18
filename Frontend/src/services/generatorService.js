const BASE_URL = import.meta.env.VITE_API_URL;

export const generateTimetable = async (dept, sem, force) => {
    const response = await fetch(`${BASE_URL}/generate?dept=${dept}&sem=${sem}&force=${force}`, {
        method: "POST"
    });
    if (!response.ok) throw new Error("Generation failed");
    return response.json();
};