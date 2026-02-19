import { useEffect, useState } from "react";
import { getSubjectsBySem, addSubject, updateSubject, deleteSubject } from "../services/subjectService";
import { getAllTeachers } from "../services/teacherService";
import { getWorkload, assignTeacher, unassignTeacher } from "../services/workloadService";

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
    const [statusMsg, setStatusMsg] = useState({ text: "", type: "" });

    // 3. FORM STATE
    const [editingId, setEditingId] = useState(null);
    const [newSubject, setNewSubject] = useState({
        name: "", code: "", alias: "",
        weeklyLectureCount: 3, weeklyLabCount: 0, labDuration: 0,
        hasBatches: false, batchesPerSection: 3
    });

    useEffect(() => {
        const generated = Array.from({ length: numSections }, (_, i) => String.fromCharCode(65 + i));
        setSections(generated);
    }, [numSections]);

    useEffect(() => {
        loadData();
    }, []);

    const showMessage = (text, type) => {
        setStatusMsg({ text, type });
        setTimeout(() => setStatusMsg({ text: "", type: "" }), 3000);
    };

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
            showMessage("Error loading data from server.", "error");
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
            ...newSubject, department: DEPT, semester: SEM,
            batchesPerSection: newSubject.hasBatches ? newSubject.batchesPerSection : 0
        };

        try {
            if (editingId) {
                await updateSubject(editingId, subjectToSave);
                showMessage("Subject updated successfully!", "success");
                setEditingId(null);
            } else {
                await addSubject(subjectToSave);
                showMessage("Subject added successfully!", "success");
            }
            loadData();
            resetForm();
        } catch {
            showMessage("Error saving subject.", "error");
        }
    };

    const resetForm = () => {
        setNewSubject({
            name: "", code: "", alias: "", weeklyLectureCount: 3,
            weeklyLabCount: 0, labDuration: 0, hasBatches: false, batchesPerSection: 3
        });
        setEditingId(null);
    };

    const handleEditClick = (sub) => {
        setEditingId(sub.id);
        setNewSubject({
            name: sub.name, code: sub.code, alias: sub.alias,
            weeklyLectureCount: sub.weeklyLectureCount, weeklyLabCount: sub.weeklyLabCount,
            labDuration: sub.labDuration, hasBatches: sub.hasBatches || false,
            batchesPerSection: sub.batchesPerSection || 3
        });
    };

    const handleDeleteClick = async (id) => {
        if (!window.confirm("Delete this subject?")) return;
        try {
            await deleteSubject(id);
            showMessage("Subject deleted successfully!", "success");
            loadData();
        } catch {
            showMessage("Cannot delete. Remove assigned teachers first.", "error");
        }
    };

    // ASSIGN TEACHER (Fixed logic to handle Unassigning)
    const handleAssign = async (subjectId, section, batch, teacherId) => {
        try {
            if (!teacherId) {
                // If user selects "-- Assign --" (empty string), Unassign the teacher
                await unassignTeacher(subjectId, section, batch);
                setAssignments(prev => {
                    const newAssignments = { ...prev };
                    delete newAssignments[`${subjectId}-${section}-${batch}`];
                    return newAssignments;
                });
                showMessage(`Unassigned teacher from Sec ${section} ${batch === 'ALL' ? 'Theory' : 'Batch ' + batch}`, "success");
            } else {
                // Assign new teacher
                await assignTeacher({ department: DEPT, semester: SEM, section, batch, subjectId, teacherId });
                setAssignments(prev => ({
                    ...prev,
                    [`${subjectId}-${section}-${batch}`]: teacherId
                }));
                showMessage(`Teacher assigned to Sec ${section} ${batch === 'ALL' ? 'Theory' : 'Batch ' + batch}`, "success");
            }
        } catch {
            showMessage("Failed to save assignment.", "error");
        }
    };

    // FILTER SUBJECTS
    const wholeSectionSubjects = subjects.filter(s => !s.hasBatches);
    const batchedSubjects = subjects.filter(s => s.hasBatches);
    const maxBatches = batchedSubjects.length > 0 ? Math.max(...batchedSubjects.map(s => s.batchesPerSection)) : 0;
    const batchColumns = Array.from({ length: maxBatches }, (_, i) => i + 1);

    return (
        <div className="p-6 max-w-7xl mx-auto font-sans">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 border-b-2 border-indigo-500 pb-2">
                Smart Workload Allocation
            </h1>

            {statusMsg.text && (
                <div className={`p-3 mb-4 rounded text-white font-semibold shadow-sm transition-all ${statusMsg.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
                    {statusMsg.text}
                </div>
            )}

            {/* CONFIGURATION BAR */}
            <div className="flex items-center gap-4 bg-indigo-50 p-4 rounded-lg border border-indigo-100 mb-6 shadow-sm">
                <span className="font-bold text-indigo-800 text-lg tracking-wide">{DEPT} - Sem {SEM}</span>
                <div className="h-6 w-px bg-indigo-300"></div>
                <label className="font-semibold text-gray-700 flex items-center gap-2">
                    Active Sections:
                    <input type="number" min="1" max="5" value={numSections} onChange={(e) => setNumSections(parseInt(e.target.value))}
                        className="w-16 border border-gray-300 p-1 rounded text-center focus:ring-2 focus:ring-indigo-400 focus:outline-none" />
                </label>
            </div>

            {/* ADD / EDIT SUBJECT FORM */}
            <div className="bg-white shadow-md rounded-lg p-6 mb-8 border-t-4 border-indigo-600">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">{editingId ? "Edit Subject Details" : "Add Subject Details"}</h3>
                <form onSubmit={handleSaveSubject} className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-4 items-end">
                    <div className="lg:col-span-2">
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Name</label>
                        <input name="name" placeholder="Subject Name" value={newSubject.name} onChange={handleInputChange} required className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-400" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Code</label>
                        <input name="code" placeholder="Code" value={newSubject.code} onChange={handleInputChange} required className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-400" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Alias</label>
                        <input name="alias" placeholder="Alias" value={newSubject.alias} onChange={handleInputChange} required className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-400" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Lect/Wk</label>
                        <input type="number" name="weeklyLectureCount" value={newSubject.weeklyLectureCount} onChange={handleInputChange} className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-400" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Labs/Wk</label>
                        <input type="number" name="weeklyLabCount" value={newSubject.weeklyLabCount} onChange={handleInputChange} className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-400" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Lab Hrs</label>
                        <input type="number" name="labDuration" value={newSubject.labDuration} onChange={handleInputChange} className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-400" />
                    </div>

                    <div className="lg:col-span-8 flex flex-wrap items-center gap-6 mt-2 bg-gray-50 p-3 rounded border">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer">
                            <input type="checkbox" name="hasBatches" checked={newSubject.hasBatches} onChange={handleInputChange} className="w-4 h-4 accent-indigo-600" />
                            Divided into Practical Batches?
                        </label>
                        {newSubject.hasBatches && (
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                Batches per Section:
                                <input type="number" name="batchesPerSection" value={newSubject.batchesPerSection} onChange={handleInputChange} className="w-16 border p-1 rounded text-center focus:ring-2 focus:ring-indigo-400" />
                            </label>
                        )}
                    </div>

                    <div className="lg:col-span-8 flex gap-3 mt-2">
                        <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2 rounded shadow-sm transition-colors">
                            {editingId ? "Update Subject" : "Save Subject"}
                        </button>
                        {editingId && (
                            <button type="button" onClick={resetForm} className="bg-gray-400 hover:bg-gray-500 text-white font-semibold px-4 py-2 rounded shadow-sm transition-colors">
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* TABLE 1 – WHOLE SECTION */}
            <h2 className="text-xl font-bold text-gray-700 mb-3 border-l-4 border-blue-500 pl-3">Whole Section Subjects (Theory)</h2>
            <div className="bg-white shadow-md rounded-lg overflow-x-auto border border-gray-200 mb-8">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-100 border-b-2 border-gray-300 text-gray-700">
                        <tr>
                            <th className="p-4 w-1/4">Subject</th>
                            {sections.map(sec => <th key={sec} className="p-4 text-center border-l">Section {sec}</th>)}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {wholeSectionSubjects.map(sub => (
                            <tr key={sub.id} className="hover:bg-blue-50 transition-colors">
                                <td className="p-4">
                                    <div className="font-bold text-gray-800 text-lg">{sub.alias}</div>
                                    <div className="text-sm text-gray-500">{sub.name}</div>
                                    <div className="mt-2 flex gap-2">
                                        <button onClick={() => handleEditClick(sub)} className="text-xs bg-yellow-100 text-yellow-700 hover:bg-yellow-200 px-2 py-1 rounded font-semibold transition-colors">Edit</button>
                                        <button onClick={() => handleDeleteClick(sub.id)} className="text-xs bg-red-100 text-red-700 hover:bg-red-200 px-2 py-1 rounded font-semibold transition-colors">Delete</button>
                                    </div>
                                </td>
                                {sections.map(sec => (
                                    <td key={sec} className="p-4 border-l bg-white">
                                        <select
                                            className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-400 focus:outline-none cursor-pointer"
                                            value={assignments[`${sub.id}-${sec}-ALL`] || ""}
                                            onChange={(e) => handleAssign(sub.id, sec, "ALL", e.target.value)}
                                        >
                                            <option value="">-- Assign --</option>
                                            {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                        </select>
                                    </td>
                                ))}
                            </tr>
                        ))}
                        {wholeSectionSubjects.length === 0 && <tr><td colSpan={sections.length + 1} className="p-4 text-center text-gray-500 italic">No whole-section subjects found.</td></tr>}
                    </tbody>
                </table>
            </div>

            {/* TABLE 2 – BATCHED SUBJECTS */}
            <h2 className="text-xl font-bold text-gray-700 mb-3 border-l-4 border-purple-500 pl-3">Batched Subjects (Practicals)</h2>
            <div className="bg-white shadow-md rounded-lg overflow-x-auto border border-gray-200">
                <table className="w-full text-center border-collapse">
                    <thead className="bg-gray-100 border-b-2 border-gray-300 text-gray-700">
                        <tr>
                            <th className="p-4 w-1/4 text-left">Subject</th>
                            {sections.map(sec =>
                                batchColumns.map(b =>
                                    <th key={`${sec}-${b}`} className="p-3 border-l bg-purple-50">Sec {sec}<br/><span className="text-purple-600">Batch {sec}{b}</span></th>
                                )
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {batchedSubjects.map(sub => (
                            <tr key={sub.id} className="hover:bg-purple-50 transition-colors">
                                <td className="p-4 text-left">
                                    <div className="font-bold text-gray-800 text-lg">{sub.alias}</div>
                                    <div className="text-sm text-gray-500">{sub.name}</div>
                                    <div className="mt-2 flex gap-2">
                                        <button onClick={() => handleEditClick(sub)} className="text-xs bg-yellow-100 text-yellow-700 hover:bg-yellow-200 px-2 py-1 rounded font-semibold transition-colors">Edit</button>
                                        <button onClick={() => handleDeleteClick(sub.id)} className="text-xs bg-red-100 text-red-700 hover:bg-red-200 px-2 py-1 rounded font-semibold transition-colors">Delete</button>
                                    </div>
                                </td>
                                {sections.map(sec =>
                                    batchColumns.map(b => {
                                        if (b > sub.batchesPerSection) {
                                            return <td key={`${sec}-${b}`} className="p-4 border-l bg-gray-50 text-gray-400 italic">N/A</td>;
                                        }
                                        const batchLabel = `${sec}${b}`;
                                        return (
                                            <td key={`${sec}-${b}`} className="p-3 border-l bg-white">
                                                <select
                                                    className="w-full text-sm border border-gray-300 p-2 rounded focus:ring-2 focus:ring-purple-400 focus:outline-none cursor-pointer"
                                                    value={assignments[`${sub.id}-${sec}-${batchLabel}`] || ""}
                                                    onChange={(e) => handleAssign(sub.id, sec, batchLabel, e.target.value)}
                                                >
                                                    <option value="">-- Assign --</option>
                                                    {teachers.map(t => <option key={t.id} value={t.id}>{t.alias}</option>)}
                                                </select>
                                            </td>
                                        );
                                    })
                                )}
                            </tr>
                        ))}
                        {batchedSubjects.length === 0 && <tr><td colSpan={sections.length * maxBatches + 1} className="p-4 text-center text-gray-500 italic">No batched subjects found.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default WorkloadDashboard;