const BASE_URL = import.meta.env.VITE_API_URL;

export const getTimetable = async (dept, sem, section) => {
    const response = await fetch(`${BASE_URL}/timetable?dept=${dept}&sem=${sem}&section=${section}`);
    if (!response.ok) throw new Error("Failed to fetch timetable");
    return response.json();
};