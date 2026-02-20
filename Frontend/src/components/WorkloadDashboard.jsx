import { useEffect, useState } from "react";
import { getSubjectsBySem } from "../services/subjectService";
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

    // ASSIGN TEACHER
    const handleAssign = async (subjectId, section, batch, teacherId) => {
        try {
            if (!teacherId) {
                // Unassign the teacher
                await unassignTeacher(subjectId, section, batch);
                setAssignments(prev => {
                    const newAssignments = { ...prev };
                    delete newAssignments[`${subjectId}-${section}-${batch}`];
                    return newAssignments;
                });
                showMessage(`Unassigned teacher from Sec ${section} ${batch === 'ALL' ? '(Theory)' : '- Batch ' + batch}`, "success");
            } else {
                // Assign new teacher
                await assignTeacher({ department: DEPT, semester: SEM, section, batch, subjectId, teacherId });
                setAssignments(prev => ({
                    ...prev,
                    [`${subjectId}-${section}-${batch}`]: teacherId
                }));
                showMessage(`Teacher assigned to Sec ${section} ${batch === 'ALL' ? '(Theory)' : '- Batch ' + batch}`, "success");
            }
        } catch {
            showMessage("Failed to save assignment.", "error");
        }
    };

    // Helper for visual badges
    const getTypeBadge = (type) => {
        switch(type) {
            case 'THEORY': return <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded border border-blue-200">THEORY</span>;
            case 'LAB': return <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2 py-1 rounded border border-purple-200">LAB</span>;
            case 'ACTIVITY': return <span className="bg-orange-100 text-orange-800 text-xs font-bold px-2 py-1 rounded border border-orange-200">ACTIVITY</span>;
            default: return <span className="bg-gray-100 text-gray-800 text-xs font-bold px-2 py-1 rounded border border-gray-200">SUBJECT</span>;
        }
    };

    // FILTER SUBJECTS
    const wholeSectionSubjects = subjects.filter(s => !s.hasBatches);
    const batchedSubjects = subjects.filter(s => s.hasBatches);
    const maxBatches = batchedSubjects.length > 0 ? Math.max(...batchedSubjects.map(s => s.batchesPerSection)) : 0;
    const batchColumns = Array.from({ length: maxBatches }, (_, i) => i + 1);

    return (
        <div className="p-6 max-w-7xl mx-auto font-sans">
            <div className="flex justify-between items-center mb-6 border-b-2 border-slate-800 pb-3">
                <h2 className="text-2xl font-bold text-slate-800">Assign Teachers to Subjects</h2>
            </div>

            {statusMsg.text && (
                <div className={`p-3 mb-4 rounded text-white font-semibold shadow-sm transition-all ${statusMsg.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}>
                    {statusMsg.text}
                </div>
            )}

            {/* CONFIGURATION BAR */}
            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200 mb-8 shadow-sm">
                <span className="font-extrabold text-slate-700 text-lg tracking-wide">{DEPT} - Semester {SEM}</span>
                <div className="h-6 w-px bg-slate-300"></div>
                <label className="font-semibold text-slate-600 flex items-center gap-2">
                    Active Sections:
                    <input type="number" min="1" max="5" value={numSections} onChange={(e) => setNumSections(parseInt(e.target.value))}
                        className="w-16 border border-slate-300 p-1.5 rounded text-center font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
                </label>
            </div>

            {/* TABLE 1 – WHOLE SECTION */}
            <h2 className="text-xl font-bold text-slate-700 mb-3 border-l-4 border-blue-500 pl-3">Whole Section Allocation (Theory / Activity)</h2>
            <div className="bg-white shadow-md rounded-lg overflow-x-auto border border-slate-200 mb-10">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm uppercase tracking-wider">
                        <tr>
                            <th className="p-4 w-1/3">Subject Details</th>
                            {sections.map(sec => <th key={sec} className="p-4 text-center border-l border-slate-200">Section {sec}</th>)}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {wholeSectionSubjects.map(sub => (
                            <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-4 flex flex-col items-start gap-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-slate-800 text-lg">{sub.alias}</span>
                                        {getTypeBadge(sub.subjectType)}
                                    </div>
                                    <span className="text-sm text-slate-500 font-medium">{sub.name}</span>
                                </td>
                                {sections.map(sec => (
                                    <td key={sec} className="p-4 border-l border-slate-100 align-middle">
                                        <select
                                            className="w-full border border-slate-300 p-2.5 rounded font-semibold text-slate-700 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none cursor-pointer transition-shadow"
                                            value={assignments[`${sub.id}-${sec}-ALL`] || ""}
                                            onChange={(e) => handleAssign(sub.id, sec, "ALL", e.target.value)}
                                        >
                                            <option value="" className="text-slate-400">-- Select Teacher --</option>
                                            {teachers.map(t => <option key={t.id} value={t.id}>{t.name} ({t.alias})</option>)}
                                        </select>
                                    </td>
                                ))}
                            </tr>
                        ))}
                        {wholeSectionSubjects.length === 0 && <tr><td colSpan={sections.length + 1} className="p-8 text-center text-slate-500 italic">No whole-section subjects available. Please add them in the Subject Dashboard.</td></tr>}
                    </tbody>
                </table>
            </div>

            {/* TABLE 2 – BATCHED SUBJECTS */}
            <h2 className="text-xl font-bold text-slate-700 mb-3 border-l-4 border-purple-500 pl-3">Batched Allocation (Practicals)</h2>
            <div className="bg-white shadow-md rounded-lg overflow-x-auto border border-slate-200">
                <table className="w-full text-center border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm uppercase tracking-wider">
                        <tr>
                            <th className="p-4 w-1/4 text-left">Subject Details</th>
                            {sections.map(sec =>
                                batchColumns.map(b =>
                                    <th key={`${sec}-${b}`} className="p-3 border-l border-slate-200 bg-purple-50/50">
                                        <div className="flex flex-col">
                                            <span>Sec {sec}</span>
                                            <span className="text-purple-700 font-bold">Batch {sec}{b}</span>
                                        </div>
                                    </th>
                                )
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {batchedSubjects.map(sub => (
                            <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-4 flex flex-col items-start gap-1 text-left">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-slate-800 text-lg">{sub.alias}</span>
                                        {getTypeBadge(sub.subjectType)}
                                    </div>
                                    <span className="text-sm text-slate-500 font-medium">{sub.name}</span>
                                </td>
                                {sections.map(sec =>
                                    batchColumns.map(b => {
                                        if (b > sub.batchesPerSection) {
                                            return <td key={`${sec}-${b}`} className="p-4 border-l border-slate-100 bg-slate-50 text-slate-400 italic text-sm">N/A</td>;
                                        }
                                        const batchLabel = `${sec}${b}`;
                                        return (
                                            <td key={`${sec}-${b}`} className="p-3 border-l border-slate-100 align-middle">
                                                <select
                                                    className="w-full text-sm font-semibold border border-slate-300 p-2 rounded text-slate-700 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none cursor-pointer transition-shadow"
                                                    value={assignments[`${sub.id}-${sec}-${batchLabel}`] || ""}
                                                    onChange={(e) => handleAssign(sub.id, sec, batchLabel, e.target.value)}
                                                >
                                                    <option value="" className="text-slate-400">-- Assign --</option>
                                                    {teachers.map(t => <option key={t.id} value={t.id}>{t.alias}</option>)}
                                                </select>
                                            </td>
                                        );
                                    })
                                )}
                            </tr>
                        ))}
                        {batchedSubjects.length === 0 && <tr><td colSpan={sections.length * maxBatches + 1} className="p-8 text-center text-slate-500 italic">No practical lab subjects available. Please add them in the Subject Dashboard.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default WorkloadDashboard;