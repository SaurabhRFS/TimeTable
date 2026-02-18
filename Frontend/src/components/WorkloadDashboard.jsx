import { useEffect, useState } from "react";
import { getSubjectsBySem, addSubject, updateSubject, deleteSubject } from "../services/subjectService";
import { getAllTeachers } from "../services/teacherService";
import { getWorkload, assignTeacher } from "../services/workloadService";

const WorkloadDashboard = () => {

    // 1. CONFIGURATION
    const DEPT = "CT";
    const SEM = 6;

    const [numSections, setNumSections] = useState(2);
    const [sections, setSections] = useState(["A", "B"]);

    // 2. DATA STATE
    const [subjects, setSubjects] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [assignments, setAssignments] = useState({});

    // 3. FORM STATE
    const [editingId, setEditingId] = useState(null);
    const [newSubject, setNewSubject] = useState({
        name: "",
        code: "",
        alias: "",
        weeklyLectureCount: 3,
        weeklyLabCount: 0,
        labDuration: 0,
        hasBatches: false,
        batchesPerSection: 3
    });

    // Generate section labels dynamically
    useEffect(() => {
        const generated = Array.from({ length: numSections }, (_, i) =>
            String.fromCharCode(65 + i)
        );
        setSections(generated);
    }, [numSections]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const s = await getSubjectsBySem(DEPT, SEM);
            const t = await getAllTeachers();
            const w = await getWorkload(DEPT, SEM);

            setSubjects(s);
            setTeachers(t);

            const map = {};
            w.forEach(item => {
                const key = `${item.subject.id}-${item.section}-${item.batch}`;
                map[key] = item.teacher.id;
            });

            setAssignments(map);

        } catch (err) {
            console.error("Error loading data:", err);
        }
    };

    // FORM INPUT HANDLER
    const handleInputChange = (e) => {
        const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
        setNewSubject({ ...newSubject, [e.target.name]: value });
    };

    // SAVE SUBJECT
    const handleSaveSubject = async (e) => {
        e.preventDefault();

        const subjectToSave = {
            ...newSubject,
            department: DEPT,
            semester: SEM,
            batchesPerSection: newSubject.hasBatches ? newSubject.batchesPerSection : 0
        };

        try {
            if (editingId) {
                await updateSubject(editingId, subjectToSave);
                setEditingId(null);
            } else {
                await addSubject(subjectToSave);
            }

            loadData();
            resetForm();

        } catch {
            alert("Error saving subject");
        }
    };

    const resetForm = () => {
        setNewSubject({
            name: "",
            code: "",
            alias: "",
            weeklyLectureCount: 3,
            weeklyLabCount: 0,
            labDuration: 0,
            hasBatches: false,
            batchesPerSection: 3
        });
    };

    const handleEditClick = (sub) => {
        setEditingId(sub.id);
        setNewSubject({
            name: sub.name,
            code: sub.code,
            alias: sub.alias,
            weeklyLectureCount: sub.weeklyLectureCount,
            weeklyLabCount: sub.weeklyLabCount,
            labDuration: sub.labDuration,
            hasBatches: sub.hasBatches || false,
            batchesPerSection: sub.batchesPerSection || 3
        });
    };

    const handleDeleteClick = async (id) => {
        if (!window.confirm("Delete this subject?")) return;
        try {
            await deleteSubject(id);
            loadData();
        } catch {
            alert("Remove assigned teachers first");
        }
    };

    // ASSIGN TEACHER
    const handleAssign = async (subjectId, section, batch, teacherId) => {
        if (!teacherId) return;

        try {
            await assignTeacher({
                department: DEPT,
                semester: SEM,
                section,
                batch,
                subjectId,
                teacherId
            });

            setAssignments(prev => ({
                ...prev,
                [`${subjectId}-${section}-${batch}`]: teacherId
            }));

        } catch {
            alert("Failed to save assignment");
        }
    };

    // FILTER SUBJECTS
    const wholeSectionSubjects = subjects.filter(s => !s.hasBatches);
    const batchedSubjects = subjects.filter(s => s.hasBatches);

    const maxBatches =
        batchedSubjects.length > 0
            ? Math.max(...batchedSubjects.map(s => s.batchesPerSection))
            : 0;

    const batchColumns = Array.from({ length: maxBatches }, (_, i) => i + 1);

    return (
        <div>
            <h1>Smart Workload Allocation</h1>

            <div style={{ background: "#eee", padding: "10px", marginBottom: "20px" }}>
                <span><strong>{DEPT} - Sem {SEM}</strong> | </span>
                <label>
                    Sections:
                    <input
                        type="number"
                        min="1"
                        max="5"
                        value={numSections}
                        onChange={(e) => setNumSections(parseInt(e.target.value))}
                        style={{ width: "40px", marginLeft: "5px" }}
                    />
                </label>
            </div>

            {/* ADD / EDIT FORM */}
            <div style={{ border: "1px solid #ccc", padding: "15px", marginBottom: "30px" }}>
                <h3>{editingId ? "Edit Subject" : "Add Subject"}</h3>

                <form onSubmit={handleSaveSubject}>
                    <input name="name" placeholder="Name" value={newSubject.name} onChange={handleInputChange} required />
                    <input name="code" placeholder="Code" value={newSubject.code} onChange={handleInputChange} required style={{ marginLeft: "10px" }} />
                    <input name="alias" placeholder="Alias" value={newSubject.alias} onChange={handleInputChange} required style={{ marginLeft: "10px", width: "80px" }} />

                    <label style={{ marginLeft: "15px" }}>Lect/Wk:</label>
                    <input type="number" name="weeklyLectureCount" value={newSubject.weeklyLectureCount} onChange={handleInputChange} style={{ width: "40px" }} />

                    <label style={{ marginLeft: "15px" }}>Labs/Wk:</label>
                    <input type="number" name="weeklyLabCount" value={newSubject.weeklyLabCount} onChange={handleInputChange} style={{ width: "40px" }} />

                    <label style={{ marginLeft: "15px" }}>Lab Hrs:</label>
                    <input type="number" name="labDuration" value={newSubject.labDuration} onChange={handleInputChange} style={{ width: "40px" }} />

                    <div style={{ marginTop: "10px" }}>
                        <label>
                            <input type="checkbox" name="hasBatches" checked={newSubject.hasBatches} onChange={handleInputChange} />
                            Divided into Batches?
                        </label>

                        {newSubject.hasBatches && (
                            <span style={{ marginLeft: "15px" }}>
                                Batches per Section:
                                <input
                                    type="number"
                                    name="batchesPerSection"
                                    value={newSubject.batchesPerSection}
                                    onChange={handleInputChange}
                                    style={{ width: "50px", marginLeft: "5px" }}
                                />
                            </span>
                        )}
                    </div>

                    <br />
                    <button type="submit">{editingId ? "Update" : "Save"}</button>
                    {editingId && (
                        <button type="button" onClick={() => { setEditingId(null); resetForm(); }} style={{ marginLeft: "10px" }}>
                            Cancel
                        </button>
                    )}
                </form>
            </div>

            {/* TABLE 1 – WHOLE SECTION */}
            <h2>Whole Section Subjects</h2>
            <table border="1" cellPadding="10" style={{ width: "100%", marginBottom: "30px" }}>
                <thead>
                    <tr>
                        <th>Subject</th>
                        {sections.map(sec => <th key={sec}>Section {sec}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {wholeSectionSubjects.map(sub => (
                        <tr key={sub.id}>
                            <td>
                                <strong>{sub.alias}</strong>
                                <div>
                                    <button onClick={() => handleEditClick(sub)}>Edit</button>
                                    <button onClick={() => handleDeleteClick(sub.id)} style={{ marginLeft: "5px" }}>Delete</button>
                                </div>
                            </td>

                            {sections.map(sec => (
                                <td key={sec}>
                                    <select
                                        value={assignments[`${sub.id}-${sec}-ALL`] || ""}
                                        onChange={(e) => handleAssign(sub.id, sec, "ALL", e.target.value)}
                                    >
                                        <option value="">-- Assign --</option>
                                        {teachers.map(t =>
                                            <option key={t.id} value={t.id}>{t.name}</option>
                                        )}
                                    </select>
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* TABLE 2 – BATCHED SUBJECTS */}
            <h2>Batched Subjects</h2>
            <table border="1" cellPadding="10" style={{ width: "100%" }}>
                <thead>
                    <tr>
                        <th>Subject</th>
                        {sections.map(sec =>
                            batchColumns.map(b =>
                                <th key={`${sec}-${b}`}>Sec {sec} - Batch {b}</th>
                            )
                        )}
                    </tr>
                </thead>
                <tbody>
                    {batchedSubjects.map(sub => (
                        <tr key={sub.id}>
                            <td>
                                <strong>{sub.alias}</strong>
                                <div>
                                    <button onClick={() => handleEditClick(sub)}>Edit</button>
                                    <button onClick={() => handleDeleteClick(sub.id)} style={{ marginLeft: "5px" }}>Delete</button>
                                </div>
                            </td>

                            {sections.map(sec =>
                                batchColumns.map(b => {
                                    if (b > sub.batchesPerSection) {
                                        return <td key={`${sec}-${b}`}>N/A</td>;
                                    }

                                    const batchLabel = `${sec}${b}`;

                                    return (
                                        <td key={`${sec}-${b}`}>
                                            <select
                                                value={assignments[`${sub.id}-${sec}-${batchLabel}`] || ""}
                                                onChange={(e) => handleAssign(sub.id, sec, batchLabel, e.target.value)}
                                            >
                                                <option value="">-- Assign --</option>
                                                {teachers.map(t =>
                                                    <option key={t.id} value={t.id}>{t.name}</option>
                                                )}
                                            </select>
                                        </td>
                                    );
                                })
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default WorkloadDashboard;