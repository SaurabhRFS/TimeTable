import { useEffect, useState } from "react";
import { getAllTeachers, addTeacher } from "../services/teacherService";

const TeacherDashboard = () => {
    // 1. STATE
    const [teachers, setTeachers] = useState([]);
    const [newTeacher, setNewTeacher] = useState({
        name: "",
        department: "",
        alias: ""
    });

    // 2. LOAD DATA
    useEffect(() => {
        loadTeachers();
    }, []);

    const loadTeachers = async () => {
        try {
            const data = await getAllTeachers();
            setTeachers(data);
        } catch (error) {
            console.error("Error loading teachers:", error);
        }
    };

    // 3. HANDLERS
    const handleInputChange = (e) => {
        setNewTeacher({ ...newTeacher, [e.target.name]: e.target.value });
    };

    const handleAddTeacher = async (e) => {
        e.preventDefault();
        try {
            await addTeacher(newTeacher);
            alert("Teacher Added!");
            loadTeachers(); // Refresh list
            setNewTeacher({ name: "", department: "", alias: "" }); // Clear form
        } catch (error) {
            alert("Failed to save teacher");
        }
    };

    // 4. UI (Plain)
    return (
        <div>
            <h2>Manage Teachers</h2>

            {/* --- ADD FORM --- */}
            <div style={{ border: "1px solid black", padding: "10px", marginBottom: "20px" }}>
                <h3>Add New Teacher</h3>
                <form onSubmit={handleAddTeacher}>
                    <input 
                        name="name" 
                        placeholder="Name (e.g. Mrs. Ghawade)" 
                        value={newTeacher.name} 
                        onChange={handleInputChange} 
                        required 
                    />
                    <br />
                    <input 
                        name="department" 
                        placeholder="Dept (e.g. CT)" 
                        value={newTeacher.department} 
                        onChange={handleInputChange} 
                        required 
                    />
                    <br />
                    <input 
                        name="alias" 
                        placeholder="Alias (e.g. KG)" 
                        value={newTeacher.alias} 
                        onChange={handleInputChange} 
                        required 
                    />
                    <br /><br />
                    <button type="submit">Add Teacher</button>
                </form>
            </div>

            {/* --- LIST TABLE --- */}
            <table border="1" cellPadding="5" style={{ width: "100%" }}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Dept</th>
                        <th>Alias</th>
                    </tr>
                </thead>
                <tbody>
                    {teachers.map((t) => (
                        <tr key={t.id}>
                            <td>{t.id}</td>
                            <td>{t.name}</td>
                            <td>{t.department}</td>
                            <td>{t.alias}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TeacherDashboard;