// OLD WAY (BAD):
// const API_URL = "http://localhost:8080/api/teachers";

// NEW WAY (PROFESSIONAL):
// We access the variable we defined in the .env file
const BASE_URL = import.meta.env.VITE_API_URL; 
const API_URL = `${BASE_URL}/teachers`;

// The rest of the code remains exactly the same...
export const getAllTeachers = async () => {
    const response = await fetch(API_URL);
    if (!response.ok) {
        throw new Error("Failed to fetch teachers");
    }
    return response.json();
};

export const addTeacher = async (teacherData) => {
    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(teacherData),
    });
    
    if (!response.ok) {
        throw new Error("Failed to add teacher");
    }
    return response.json();
};