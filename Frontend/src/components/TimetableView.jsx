import { useEffect, useState } from "react";
import { getSubjectsBySem } from "../services/subjectService";
import { getAllTeachers } from "../services/teacherService";
import { getTimetable, addManualEntry, deleteEntry } from "../services/timetableService";

const TimetableView = () => {
    const DEPT = "CT";
    const SEM = 6;
    const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT"];

    const SLOTS = [
        { id: 1, label: "10:00 - 11:00", isBreak: false },
        { id: 2, label: "11:00 - 12:00", isBreak: false },
        { id: 3, label: "12:00 - 1:00", isBreak: false },
        { id: 4, label: "1:00 - 2:00", isBreak: true, name: "LUNCH BREAK" },
        { id: 5, label: "2:00 - 3:00", isBreak: false },
        { id: 6, label: "3:00 - 4:00", isBreak: false },
        { id: 7, label: "4:00 - 5:00", isBreak: false }
    ];

    const [section, setSection] = useState("A");
    const [schedule, setSchedule] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [statusMsg, setStatusMsg] = useState({ text: "", type: "" });
    const [loading, setLoading] = useState(false);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeCell, setActiveCell] = useState({ day: "", slotId: null, slotLabel: "" });
    const [formData, setFormData] = useState({ subjectId: "", teacherId: "", batch: "ALL" });

    useEffect(() => {
        loadData();
    }, [section]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [schedData, subData, teacherData] = await Promise.all([
                getTimetable(DEPT, SEM, section),
                getSubjectsBySem(DEPT, SEM),
                getAllTeachers()
            ]);
            setSchedule(schedData);
            setSubjects(subData);
            setTeachers(teacherData);
        } catch (error) {
            showMessage("Error loading timetable data.", "error");
        } finally {
            setLoading(false);
        }
    };

    const showMessage = (text, type) => {
        setStatusMsg({ text, type });
        setTimeout(() => setStatusMsg({ text: "", type: "" }), 3000);
    };

    // --- MODAL & ACTION HANDLERS ---
    const openModal = (day, slot) => {
        setActiveCell({ day, slotId: slot.id, slotLabel: slot.label });
        setFormData({ subjectId: "", teacherId: "", batch: "ALL" });
        setIsModalOpen(true);
    };

    const closeModal = () => setIsModalOpen(false);

    const handleFormChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSaveEntry = async (e) => {
        e.preventDefault();
        const payload = {
            day: activeCell.day, department: DEPT, semester: SEM, section: section, batch: formData.batch,
            timeSlot: { id: activeCell.slotId }, subject: { id: parseInt(formData.subjectId) },
            teacher: { id: parseInt(formData.teacherId) }, room: { id: 1 } 
        };

        try {
            await addManualEntry(payload);
            showMessage("Successfully pinned to timetable!", "success");
            closeModal();
            loadData(); 
        } catch (error) {
            showMessage("Failed to save entry.", "error");
        }
    };

    const handleDelete = async (entryId) => {
        if (window.confirm("Remove this entry from the timetable?")) {
            try {
                await deleteEntry(entryId);
                showMessage("Entry removed.", "success");
                loadData();
            } catch (error) {
                showMessage("Failed to delete entry.", "error");
            }
        }
    };

    const getSubjectColor = (type) => {
        switch(type) {
            case 'THEORY': return 'bg-blue-100 border-blue-400 text-blue-900';
            case 'LAB': return 'bg-purple-100 border-purple-400 text-purple-900';
            case 'ACTIVITY': return 'bg-orange-100 border-orange-400 text-orange-900';
            default: return 'bg-gray-100 border-gray-400 text-gray-900';
        }
    };

    return (
        <div className="max-w-[1400px] mx-auto font-sans relative">
            {/* HEADER CONTROLS */}
            <div className="flex justify-between items-end border-b-2 border-slate-800 pb-4 mb-6">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 m-0 tracking-tight">Interactive Timetable</h2>
                    <p className="text-slate-500 font-bold mt-1">B.Tech {SEM}th Semester • Dept of {DEPT}</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <select 
                        value={section} 
                        onChange={(e) => setSection(e.target.value)} 
                        className="p-2.5 border-2 border-slate-300 rounded-lg font-bold text-slate-700 outline-none focus:border-emerald-500 cursor-pointer"
                    >
                        <option value="A">Section A</option>
                        <option value="B">Section B</option>
                    </select>
                    <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-lg shadow-sm transition-colors flex items-center gap-2">
                        ✨ Auto-Fill Theory
                    </button>
                    <button onClick={() => window.print()} className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-5 py-2.5 rounded-lg shadow-sm transition-colors print:hidden">
                        🖨️ Print PDF
                    </button>
                </div>
            </div>

            {statusMsg.text && (
                <div className={`p-3 mb-4 rounded text-white font-semibold shadow-sm transition-all ${statusMsg.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}>
                    {statusMsg.text}
                </div>
            )}

            {/* THE MASTER GRID */}
            <div className="bg-white shadow-xl rounded-xl overflow-x-auto border border-slate-200 print:shadow-none print:border-none">
                {loading ? (
                    <div className="p-20 text-center font-bold text-slate-500 animate-pulse">Loading Grid...</div>
                ) : (
                    <table className="w-full text-center border-collapse table-fixed min-w-[1000px]">
                        <thead className="bg-slate-100">
                            <tr>
                                <th className="p-4 w-24 border-b-2 border-r-2 border-slate-300 text-slate-700 font-black">Day</th>
                                {SLOTS.map(slot => (
                                    <th key={slot.id} className={`p-4 border-b-2 border-r border-slate-200 text-sm font-bold text-slate-600 ${slot.isBreak ? 'w-12 bg-slate-200 border-slate-300' : ''}`}>
                                        {slot.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {DAYS.map((day, dayIndex) => (
                                <tr key={day} className="hover:bg-slate-50 transition-colors group/row">
                                    <td className="p-4 font-black text-slate-800 border-r-2 border-slate-300 bg-slate-50 text-lg">
                                        {day}
                                    </td>
                                    
                                    {SLOTS.map(slot => {
                                        if (slot.isBreak) {
                                            if (dayIndex === 0) {
                                                return (
                                                    <td key={slot.id} rowSpan={DAYS.length} className="bg-slate-200 border-r border-slate-300 print:bg-gray-100">
                                                        <div className="writing-vertical-rl transform rotate-180 mx-auto tracking-[0.3em] font-black text-slate-500 text-sm whitespace-nowrap">
                                                            {slot.name}
                                                        </div>
                                                    </td>
                                                );
                                            }
                                            return null; 
                                        }

                                        const entries = schedule.filter(e => e.day === day && e.timeSlot.id === slot.id);

                                        return (
                                            <td key={`${day}-${slot.id}`} className="p-2 border-r border-slate-200 align-top relative min-h-[100px] print:p-1 print:border-gray-400">
                                                <div className="flex flex-col gap-1.5 h-full min-h-[80px]">
                                                    {entries.map(entry => (
                                                        <div key={entry.id} className={`relative p-2 border-l-4 rounded shadow-sm text-left flex flex-col justify-center group/card print:border-l-2 print:shadow-none ${getSubjectColor(entry.subject.subjectType)}`}>
                                                            <div className="font-bold text-sm leading-tight print:text-xs">
                                                                {entry.subject.alias} {entry.batch !== 'ALL' && <span className="text-[10px] bg-white/70 px-1 rounded ml-1 font-black">B: {entry.batch}</span>}
                                                            </div>
                                                            <div className="text-xs mt-1 font-bold opacity-75 print:text-[10px]">
                                                                {entry.teacher.alias}
                                                            </div>
                                                            <button onClick={() => handleDelete(entry.id)} className="absolute top-1 right-1 bg-red-500 text-white rounded w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover/card:opacity-100 transition-opacity hover:bg-red-600 print:hidden" title="Remove Entry">✕</button>
                                                        </div>
                                                    ))}

                                                    {/* + ADD BUTTON */}
                                                    <button onClick={() => openModal(day, slot)} className="mt-auto w-full min-h-[32px] border-2 border-dashed border-slate-200 rounded text-slate-400 font-bold hover:bg-emerald-50 hover:border-emerald-400 hover:text-emerald-600 transition-all flex items-center justify-center text-xs opacity-0 group-hover/row:opacity-100 print:hidden">
                                                        + Add
                                                    </button>
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* --- ASSIGNMENT MODAL --- */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 print:hidden">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
                        <div className="bg-slate-800 p-4 flex justify-between items-center">
                            <h3 className="text-white font-bold text-lg">Pin to {activeCell.day} ({activeCell.slotLabel})</h3>
                            <button onClick={closeModal} className="text-slate-400 hover:text-white transition-colors text-xl font-bold">✕</button>
                        </div>
                        
                        <form onSubmit={handleSaveEntry} className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Select Subject / Lab</label>
                                <select name="subjectId" value={formData.subjectId} onChange={handleFormChange} required className="w-full border-2 border-slate-200 p-2.5 rounded-lg focus:border-emerald-500 outline-none font-bold text-slate-700">
                                    <option value="">-- Choose --</option>
                                    {subjects.map(sub => <option key={sub.id} value={sub.id}>[{sub.subjectType}] {sub.alias} - {sub.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Select Teacher</label>
                                <select name="teacherId" value={formData.teacherId} onChange={handleFormChange} required className="w-full border-2 border-slate-200 p-2.5 rounded-lg focus:border-emerald-500 outline-none font-bold text-slate-700">
                                    <option value="">-- Choose --</option>
                                    {teachers.map(t => <option key={t.id} value={t.id}>{t.name} ({t.alias})</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Target Audience</label>
                                <select name="batch" value={formData.batch} onChange={handleFormChange} className="w-full border-2 border-slate-200 p-2.5 rounded-lg focus:border-emerald-500 outline-none font-black text-slate-800 bg-slate-50">
                                    <option value="ALL">Entire Class</option>
                                    <option value="A1">Batch A1 (Lab)</option>
                                    <option value="A2">Batch A2 (Lab)</option>
                                    <option value="B1">Batch B1 (Lab)</option>
                                    <option value="B2">Batch B2 (Lab)</option>
                                </select>
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg transition-colors shadow-sm text-lg">Pin Block</button>
                                <button type="button" onClick={closeModal} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3 rounded-lg transition-colors text-lg">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TimetableView;