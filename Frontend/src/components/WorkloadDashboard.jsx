import { useEffect, useState } from "react";
import { getSubjectsBySem, addSubject } from "../services/subjectService";
import { getAllTeachers } from "../services/teacherService";

const WorkloadDashboard = () => {
    // 1. DATA STATE
    const [subjects, setSubjects] = useState([]);
    const [teachers, setTeachers] = useState([]);
    
    // 2. FORM STATE (To hold what you type)
    const [newSubject, setNewSubject] = useState({
        name: "",
        code: "",
        alias: "",
        weeklyLectureCount: 3, // Default values
        weeklyLabCount: 0,
        labDuration: 0
    });

    const DEPT = "CT";
    const SEM = 6;

    // Load Data on Start
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const s = await getSubjectsBySem(DEPT, SEM);
        const t = await getAllTeachers();
        setSubjects(s);
        setTeachers(t);
    };

    // Handle Typing in the Form
    const handleInputChange = (e) => {
        setNewSubject({ ...newSubject, [e.target.name]: e.target.value });
    };

    // Handle "Add Subject" Button Click
    const handleAddSubject = async (e) => {
        e.preventDefault(); // Stop page reload
        try {
            // Send to Backend
            await addSubject({
                ...newSubject,
                department: DEPT, // Auto-add current context
                semester: SEM
            });
            alert("Subject Added!");
            loadData(); // Refresh the list instantly
            // Clear form
            setNewSubject({ name: "", code: "", alias: "", weeklyLectureCount: 3, weeklyLabCount: 0, labDuration: 0 });
        } catch (err) {
            alert("Error adding subject");
            console.error(err);
        }
    };

    return (
        <div>
            <h1>Subject Manager & Workload</h1>
            <h3>Context: {DEPT} - Sem {SEM}</h3>

            {/* --- THE NEW FORM --- */}
            <div style={{ border: "2px solid black", padding: "20px", marginBottom: "20px" }}>
                <h3>Add New Subject</h3>
                <form onSubmit={handleAddSubject}>
                    <input name="name" placeholder="Subject Name (e.g. Data Mining)" value={newSubject.name} onChange={handleInputChange} required />
                    <br /><br />
                    
                    <input name="code" placeholder="Code (e.g. CT601)" value={newSubject.code} onChange={handleInputChange} required />
                    <input name="alias" placeholder="Alias (e.g. DWM)" value={newSubject.alias} onChange={handleInputChange} required />
                    <br /><br />

                    <label>Weekly Lectures:</label>
                    <input type="number" name="weeklyLectureCount" value={newSubject.weeklyLectureCount} onChange={handleInputChange} style={{ width: "50px" }} />
                    
                    <label> | Weekly Labs:</label>
                    <input type="number" name="weeklyLabCount" value={newSubject.weeklyLabCount} onChange={handleInputChange} style={{ width: "50px" }} />
                    
                    <label> | Lab Duration (Hrs):</label>
                    <input type="number" name="labDuration" value={newSubject.labDuration} onChange={handleInputChange} style={{ width: "50px" }} />
                    <br /><br />

                    <button type="submit">SAVE TO DATABASE</button>
                </form>
            </div>

            {/* --- THE TABLE --- */}
            <table border="1" cellPadding="10" style={{ width: "100%" }}>
                <thead>
                    <tr style={{ background: "#ddd" }}>
                        <th>Code</th>
                        <th>Name</th>
                        <th>Alias</th>
                        <th>Load</th>
                        <th>Assign Teacher</th>
                    </tr>
                </thead>
                <tbody>
                    {subjects.map((sub) => (
                        <tr key={sub.id}>
                            <td>{sub.code}</td>
                            <td>{sub.name}</td>
                            <td>{sub.alias}</td>
                            <td>{sub.weeklyLectureCount}L / {sub.weeklyLabCount}P</td>
                            <td>
                                <select>
                                    <option>-- Assign --</option>
                                    {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </select>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default WorkloadDashboard;