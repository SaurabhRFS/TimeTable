import { useEffect, useState } from "react";
import { getSubjectsBySem, addSubject } from "../services/subjectService";
import { getAllTeachers } from "../services/teacherService";
import { getWorkload, assignTeacher } from "../services/workloadService";

const WorkloadDashboard = () => {
    // 1. CONFIGURATION STATE
    const [numSections, setNumSections] = useState(2); // Default to 2 sections
    const [sections, setSections] = useState(["A", "B"]); // The array of labels

    const DEPT = "CT";
    const SEM = 6;

    // 2. DATA STATE
    const [subjects, setSubjects] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [assignments, setAssignments] = useState({});
    
    const [newSubject, setNewSubject] = useState({
        name: "", code: "", alias: "", weeklyLectureCount: 3, weeklyLabCount: 0, labDuration: 0
    });

    // 3. Update Sections Array when number changes
    useEffect(() => {
        // Generates ["A", "B", "C"...] based on the number
        const newSections = Array.from({ length: numSections }, (_, i) => String.fromCharCode(65 + i));
        setSections(newSections);
    }, [numSections]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const s = await getSubjectsBySem(DEPT, SEM);
            const t = await getAllTeachers();
            setSubjects(s);
            setTeachers(t);

            const w = await getWorkload(DEPT, SEM);
            const map = {};
            w.forEach(item => {
                const key = `${item.subject.id}-${item.section}`;
                map[key] = item.teacher.id;
            });
            setAssignments(map);
        } catch (err) {
            console.error("Error loading data:", err);
        }
    };

    const handleAssign = async (subjectId, section, teacherId) => {
        if (!teacherId) return;

        try {
            // We now send simple IDs, matching the new Backend DTO
            await assignTeacher({
                department: DEPT,
                semester: SEM,
                section: section,
                subjectId: subjectId, // <--- Just the ID
                teacherId: teacherId  // <--- Just the ID
            });

            setAssignments(prev => ({
                ...prev,
                [`${subjectId}-${section}`]: teacherId
            }));

        } catch (err) {
            alert("Failed to save assignment");
            console.error(err);
        }
    };

    const handleAddSubject = async (e) => {
        e.preventDefault();
        try {
            await addSubject({ ...newSubject, department: DEPT, semester: SEM });
            alert("Subject Added!");
            loadData();
            setNewSubject({ name: "", code: "", alias: "", weeklyLectureCount: 3, weeklyLabCount: 0, labDuration: 0 });
        } catch (err) {
            alert("Error adding subject");
        }
    };

    const handleInputChange = (e) => {
        setNewSubject({ ...newSubject, [e.target.name]: e.target.value });
    };

    return (
        <div>
            <h1>Workload Allocation</h1>
            
            {/* --- CONFIGURATION BAR --- */}
            <div style={{ background: "#eee", padding: "10px", marginBottom: "20px", display: "flex", gap: "20px", alignItems: "center" }}>
                <span><strong>Context:</strong> {DEPT} - Sem {SEM}</span>
                
                {/* DYNAMIC SECTION SELECTOR */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <label><strong>Number of Sections:</strong></label>
                    <input 
                        type="number" 
                        min="1" 
                        max="5" 
                        value={numSections} 
                        onChange={(e) => setNumSections(parseInt(e.target.value))}
                        style={{ width: "50px", padding: "5px" }}
                    />
                </div>
            </div>

            {/* --- ADD SUBJECT FORM --- */}
            <div style={{ border: "2px solid #ccc", padding: "15px", marginBottom: "20px" }}>
                <h3>Add New Subject</h3>
                <form onSubmit={handleAddSubject}>
                    <input name="name" placeholder="Name" value={newSubject.name} onChange={handleInputChange} required />
                    <input name="code" placeholder="Code" value={newSubject.code} onChange={handleInputChange} required style={{marginLeft: "10px"}}/>
                    <input name="alias" placeholder="Alias" value={newSubject.alias} onChange={handleInputChange} required style={{marginLeft: "10px"}}/>
                    <button type="submit" style={{marginLeft: "10px"}}>Add</button>
                </form>
            </div>

            {/* --- DYNAMIC TABLE --- */}
            <table border="1" cellPadding="10" style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                    <tr style={{ background: "#f0f0f0" }}>
                        <th>Subject</th>
                        {/* Loop through the dynamic sections (A, B, C...) */}
                        {sections.map(sec => (
                            <th key={sec} style={{ minWidth: "150px" }}>Section {sec}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {subjects.map((sub) => (
                        <tr key={sub.id}>
                            <td>
                                <strong>{sub.alias}</strong>
                            </td>
                            
                            {/* Create a Dropdown for EACH Section */}
                            {sections.map(sec => (
                                <td key={sec} style={{ textAlign: "center" }}>
                                    <select 
                                        value={assignments[`${sub.id}-${sec}`] || ""}
                                        onChange={(e) => handleAssign(sub.id, sec, e.target.value)}
                                        style={{ width: "100%" }}
                                    >
                                        <option value="">-- Select --</option>
                                        {teachers.map(t => (
                                            <option key={t.id} value={t.id}>{t.name}</option>
                                        ))}
                                    </select>
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default WorkloadDashboard;