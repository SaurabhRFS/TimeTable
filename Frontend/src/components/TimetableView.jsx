import { useEffect, useState } from "react";
import { getSubjectsBySem } from "../services/subjectService";
import { getAllTeachers } from "../services/teacherService";
import { getTimetable, addManualEntry, deleteEntry, autoGenerateGrid } from "../services/timetableService";

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

    const [formData, setFormData] = useState({
        day: "MON", timeSlotId: "1", subjectId: "", teacherId: ""
    });

    useEffect(() => { loadData(); }, [section]);

    const loadData = async () => {
        try {
            const [schedData, subData, teacherData] = await Promise.all([
                getTimetable(DEPT, SEM, section), getSubjectsBySem(DEPT, SEM), getAllTeachers()
            ]);
            setSchedule(schedData); setSubjects(subData); setTeachers(teacherData);
        } catch (error) { showMessage("Error loading data.", "error"); }
    };

    const showMessage = (text, type) => {
        setStatusMsg({ text, type });
        setTimeout(() => setStatusMsg({ text: "", type: "" }), 3000);
    };

    const handleFormChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSaveEntry = async (e) => {
        e.preventDefault();
        
        const payload = {
            day: formData.day,
            department: DEPT,
            semester: SEM.toString(),
            section: section,
            batch: "ALL", 
            timeSlotId: formData.timeSlotId,
            subjectId: formData.subjectId,
            teacherId: formData.teacherId
        };

        try {
            await addManualEntry(payload);
            showMessage("Added to grid.", "success");
            loadData(); 
        } catch (error) {
            showMessage("Failed to save. Check inputs.", "error");
        }
    };

    const handleDelete = async (entryId) => {
        if (window.confirm("Remove this entry?")) {
            try {
                await deleteEntry(entryId);
                showMessage("Removed successfully.", "success");
                loadData();
            } catch (error) { showMessage("Failed to delete.", "error"); }
        }
    };

    const handleAutoFill = async () => {
        if(window.confirm("Ready to auto-fill the remaining Theory subjects?")) {
            try {
                await autoGenerateGrid(DEPT, SEM, section);
                showMessage("Timetable Auto-Filled Successfully.", "success");
                loadData(); 
            } catch (error) {
                showMessage("Failed to generate timetable.", "error");
            }
        }
    };

    return (
        <div className="max-w-7xl mx-auto font-sans">
            
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-slate-800">Interactive Timetable</h2>
                <div className="flex gap-4">
                    <select value={section} onChange={(e) => setSection(e.target.value)} className="p-2 border-2 border-slate-300 rounded font-bold outline-none">
                        <option value="A">Section A</option>
                        <option value="B">Section B</option>
                    </select>
                    <button onClick={handleAutoFill} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded shadow-sm">
                        Auto-Fill Theory
                    </button>
                    <button onClick={() => window.print()} className="bg-slate-800 text-white font-bold px-4 py-2 rounded shadow-sm print:hidden">
                        Print
                    </button>
                </div>
            </div>

            {statusMsg.text && (
                <div className={`p-3 mb-4 rounded text-white font-bold shadow-sm ${statusMsg.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}>
                    {statusMsg.text}
                </div>
            )}

            <div className="bg-slate-800 p-4 rounded-xl mb-6 shadow-md print:hidden">
                <h3 className="text-white font-bold mb-3">Pin Manual Block</h3>
                <form onSubmit={handleSaveEntry} className="flex flex-wrap gap-3 items-end">
                    <div className="flex-1 min-w-[120px]">
                        <label className="text-slate-300 text-xs font-bold block mb-1">Day</label>
                        <select name="day" value={formData.day} onChange={handleFormChange} className="w-full p-2 rounded font-bold">
                            {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                    <div className="flex-1 min-w-[150px]">
                        <label className="text-slate-300 text-xs font-bold block mb-1">Time Slot</label>
                        <select name="timeSlotId" value={formData.timeSlotId} onChange={handleFormChange} className="w-full p-2 rounded font-bold">
                            {SLOTS.filter(s => !s.isBreak).map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                        </select>
                    </div>
                    
                    <div className="flex-1 min-w-[200px]">
                        <label className="text-slate-300 text-xs font-bold block mb-1">Subject / Lab / Activity</label>
                        <select name="subjectId" value={formData.subjectId} onChange={handleFormChange} required className="w-full p-2 rounded font-bold">
                            <option value="">-- Select --</option>
                            {subjects.map(s => <option key={s.id} value={s.id}>[{s.subjectType}] {s.alias}</option>)}
                        </select>
                    </div>
                    
                    <div className="flex-1 min-w-[150px]">
                        <label className="text-slate-300 text-xs font-bold block mb-1">Teacher</label>
                        <select name="teacherId" value={formData.teacherId} onChange={handleFormChange} required className="w-full p-2 rounded font-bold">
                            <option value="">-- Teacher --</option>
                            {teachers.map(t => <option key={t.id} value={t.id}>{t.name} ({t.alias})</option>)}
                        </select>
                    </div>

                    <button type="submit" className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-black px-6 py-2 rounded">
                        Pin to Grid
                    </button>
                </form>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-x-auto border border-slate-200">
                <table className="w-full text-center border-collapse">
                    <thead className="bg-slate-100 border-b-2 border-slate-300">
                        <tr>
                            <th className="p-3 w-24 border-r-2 border-slate-300 font-black text-slate-700">Day</th>
                            {SLOTS.map(slot => (
                                <th key={slot.id} className={`p-3 text-sm font-bold border-r border-slate-200 text-slate-600 ${slot.isBreak ? 'w-12 bg-slate-200' : ''}`}>
                                    {slot.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {DAYS.map((day, dayIndex) => (
                            <tr key={day} className="hover:bg-slate-50 transition-colors">
                                <td className="p-3 font-black text-slate-800 border-r-2 border-slate-300 bg-slate-50">{day}</td>
                                
                                {SLOTS.map(slot => {
                                    if (slot.isBreak) {
                                        if (dayIndex === 0) {
                                            return (
                                                <td key={slot.id} rowSpan={DAYS.length} className="bg-slate-200 border-r border-slate-300">
                                                    <div style={{ writingMode: "vertical-rl", textOrientation: "mixed", transform: "rotate(180deg)" }} className="mx-auto tracking-[0.3em] font-black text-slate-500 text-sm">
                                                        {slot.name}
                                                    </div>
                                                </td>
                                            );
                                        }
                                        return null; 
                                    }

                                    const entries = schedule.filter(e => e.day === day && e.timeSlot.slotOrder === slot.id);

                                    return (
                                        <td key={`${day}-${slot.id}`} className="p-2 border-r border-slate-200 align-top h-24 min-w-[120px]">
                                            <div className="flex flex-col gap-1 h-full">
                                                {entries.map(entry => {
                                                    let cardColor = "bg-blue-50 border-blue-500 text-blue-900";
                                                    let textColor = "text-blue-700";
                                                    
                                                    if (entry.subject.subjectType === 'LAB') {
                                                        cardColor = "bg-purple-50 border-purple-500 text-purple-900";
                                                        textColor = "text-purple-700";
                                                    } else if (entry.subject.subjectType === 'ACTIVITY') {
                                                        cardColor = "bg-orange-50 border-orange-500 text-orange-900";
                                                        textColor = "text-orange-700";
                                                    }

                                                    return (
                                                        <div key={entry.id} className={`relative p-2 border-l-4 rounded text-left group ${cardColor}`}>
                                                            <div className="font-bold text-sm">
                                                                {entry.subject.alias}
                                                            </div>
                                                            <div className={`text-xs font-semibold ${textColor}`}>
                                                                {entry.teacher.alias}
                                                            </div>
                                                            <button onClick={() => handleDelete(entry.id)} className="absolute top-1 right-1 text-red-500 font-black opacity-0 group-hover:opacity-100 print:hidden">✕</button>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TimetableView;









// import { useEffect, useState } from "react";
// import { getSubjectsBySem } from "../services/subjectService";
// import { getAllTeachers } from "../services/teacherService";
// import { getTimetable, addManualEntry, deleteEntry } from "../services/timetableService";

// const TimetableView = () => {
//     const DEPT = "CT";
//     const SEM = 6;
//     const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT"];
//     const SLOTS = [
//         { id: 1, label: "10:00 - 11:00", isBreak: false },
//         { id: 2, label: "11:00 - 12:00", isBreak: false },
//         { id: 3, label: "12:00 - 1:00", isBreak: false },
//         { id: 4, label: "1:00 - 2:00", isBreak: true, name: "LUNCH BREAK" },
//         { id: 5, label: "2:00 - 3:00", isBreak: false },
//         { id: 6, label: "3:00 - 4:00", isBreak: false },
//         { id: 7, label: "4:00 - 5:00", isBreak: false }
//     ];

//     const [section, setSection] = useState("A");
//     const [schedule, setSchedule] = useState([]);
//     const [subjects, setSubjects] = useState([]);
//     const [teachers, setTeachers] = useState([]);
//     const [statusMsg, setStatusMsg] = useState({ text: "", type: "" });

//     const [formData, setFormData] = useState({
//         day: "MON", timeSlotId: "1", subjectId: "", teacherId: ""
//     });

//     useEffect(() => { loadData(); }, [section]);

//     const loadData = async () => {
//         try {
//             const [schedData, subData, teacherData] = await Promise.all([
//                 getTimetable(DEPT, SEM, section), getSubjectsBySem(DEPT, SEM), getAllTeachers()
//             ]);
//             setSchedule(schedData); setSubjects(subData); setTeachers(teacherData);
//         } catch (error) { showMessage("Error loading data.", "error"); }
//     };

//     const showMessage = (text, type) => {
//         setStatusMsg({ text, type });
//         setTimeout(() => setStatusMsg({ text: "", type: "" }), 3000);
//     };

//     const handleFormChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

//     const handleSaveEntry = async (e) => {
//         e.preventDefault();
        
//         const payload = {
//             day: formData.day,
//             department: DEPT,
//             semester: SEM.toString(),
//             section: section,
//             batch: "ALL", 
//             timeSlotId: formData.timeSlotId,
//             subjectId: formData.subjectId,
//             teacherId: formData.teacherId
//         };

//         try {
//             await addManualEntry(payload);
//             showMessage("Added to grid!", "success");
//             loadData(); 
//         } catch (error) {
//             showMessage("Failed to save. Check inputs.", "error");
//         }
//     };

//     const handleDelete = async (entryId) => {
//         if (window.confirm("Remove this?")) {
//             try {
//                 await deleteEntry(entryId);
//                 showMessage("Removed.", "success");
//                 loadData();
//             } catch (error) { showMessage("Failed to delete.", "error"); }
//         }
//     };

//     return (
//         <div className="max-w-7xl mx-auto font-sans">
            
//             <div className="flex justify-between items-center mb-6">
//                 <h2 className="text-2xl font-black text-slate-800">Interactive Timetable</h2>
//                 <div className="flex gap-4">
//                     <select value={section} onChange={(e) => setSection(e.target.value)} className="p-2 border-2 border-slate-300 rounded font-bold outline-none">
//                         <option value="A">Section A</option>
//                         <option value="B">Section B</option>
//                     </select>
//                     <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded shadow-sm">✨ Auto-Fill Theory</button>
//                     <button onClick={() => window.print()} className="bg-slate-800 text-white font-bold px-4 py-2 rounded shadow-sm print:hidden">🖨️ Print</button>
//                 </div>
//             </div>

//             {statusMsg.text && (
//                 <div className={`p-3 mb-4 rounded text-white font-bold shadow-sm ${statusMsg.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}>
//                     {statusMsg.text}
//                 </div>
//             )}

//             {/* THE STATIC "PIN ENTRY" DOCK */}
//             <div className="bg-slate-800 p-4 rounded-xl mb-6 shadow-md print:hidden">
//                 <h3 className="text-white font-bold mb-3">📌 Pin Manual Block</h3>
//                 <form onSubmit={handleSaveEntry} className="flex flex-wrap gap-3 items-end">
//                     <div className="flex-1 min-w-[120px]">
//                         <label className="text-slate-300 text-xs font-bold block mb-1">Day</label>
//                         <select name="day" value={formData.day} onChange={handleFormChange} className="w-full p-2 rounded font-bold">
//                             {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
//                         </select>
//                     </div>
//                     <div className="flex-1 min-w-[150px]">
//                         <label className="text-slate-300 text-xs font-bold block mb-1">Time Slot</label>
//                         <select name="timeSlotId" value={formData.timeSlotId} onChange={handleFormChange} className="w-full p-2 rounded font-bold">
//                             {SLOTS.filter(s => !s.isBreak).map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
//                         </select>
//                     </div>
                    
//                     <div className="flex-1 min-w-[200px]">
//                         <label className="text-slate-300 text-xs font-bold block mb-1">Subject / Lab / Activity</label>
//                         <select name="subjectId" value={formData.subjectId} onChange={handleFormChange} required className="w-full p-2 rounded font-bold">
//                             <option value="">-- Select --</option>
//                             {subjects.map(s => <option key={s.id} value={s.id}>[{s.subjectType}] {s.alias}</option>)}
//                         </select>
//                     </div>
                    
//                     <div className="flex-1 min-w-[150px]">
//                         <label className="text-slate-300 text-xs font-bold block mb-1">Teacher</label>
//                         <select name="teacherId" value={formData.teacherId} onChange={handleFormChange} required className="w-full p-2 rounded font-bold">
//                             <option value="">-- Teacher --</option>
//                             {teachers.map(t => <option key={t.id} value={t.id}>{t.name} ({t.alias})</option>)}
//                         </select>
//                     </div>

//                     <button type="submit" className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-black px-6 py-2 rounded">
//                         Pin to Grid
//                     </button>
//                 </form>
//             </div>

//             {/* THE TIMETABLE GRID */}
//             <div className="bg-white shadow-md rounded-lg overflow-x-auto border border-slate-200">
//                 <table className="w-full text-center border-collapse">
//                     <thead className="bg-slate-100 border-b-2 border-slate-300">
//                         <tr>
//                             <th className="p-3 w-24 border-r-2 border-slate-300 font-black text-slate-700">Day</th>
//                             {SLOTS.map(slot => (
//                                 <th key={slot.id} className={`p-3 text-sm font-bold border-r border-slate-200 text-slate-600 ${slot.isBreak ? 'w-12 bg-slate-200' : ''}`}>
//                                     {slot.label}
//                                 </th>
//                             ))}
//                         </tr>
//                     </thead>
//                     <tbody className="divide-y divide-slate-100">
//                         {DAYS.map((day, dayIndex) => (
//                             <tr key={day} className="hover:bg-slate-50 transition-colors">
//                                 <td className="p-3 font-black text-slate-800 border-r-2 border-slate-300 bg-slate-50">{day}</td>
                                
//                                 {SLOTS.map(slot => {
//                                     if (slot.isBreak) {
//                                         if (dayIndex === 0) {
//                                             return (
//                                                 <td key={slot.id} rowSpan={DAYS.length} className="bg-slate-200 border-r border-slate-300">
//                                                     <div style={{ writingMode: "vertical-rl", textOrientation: "mixed", transform: "rotate(180deg)" }} className="mx-auto tracking-[0.3em] font-black text-slate-500 text-sm">
//                                                         {slot.name}
//                                                     </div>
//                                                 </td>
//                                             );
//                                         }
//                                         return null; 
//                                     }

//                                     // 🔥 THE FIX IS HERE: Filter by slotOrder instead of ID
//                                     const entries = schedule.filter(e => e.day === day && e.timeSlot.slotOrder === slot.id);

//                                     return (
//                                         <td key={`${day}-${slot.id}`} className="p-2 border-r border-slate-200 align-top h-24 min-w-[120px]">
//                                             <div className="flex flex-col gap-1 h-full">
//                                                 {entries.map(entry => {
//                                                     let cardColor = "bg-blue-50 border-blue-500 text-blue-900";
//                                                     let textColor = "text-blue-700";
                                                    
//                                                     if (entry.subject.subjectType === 'LAB') {
//                                                         cardColor = "bg-purple-50 border-purple-500 text-purple-900";
//                                                         textColor = "text-purple-700";
//                                                     } else if (entry.subject.subjectType === 'ACTIVITY') {
//                                                         cardColor = "bg-orange-50 border-orange-500 text-orange-900";
//                                                         textColor = "text-orange-700";
//                                                     }

//                                                     return (
//                                                         <div key={entry.id} className={`relative p-2 border-l-4 rounded text-left group ${cardColor}`}>
//                                                             <div className="font-bold text-sm">
//                                                                 {entry.subject.alias}
//                                                             </div>
//                                                             <div className={`text-xs font-semibold ${textColor}`}>
//                                                                 {entry.teacher.alias}
//                                                             </div>
//                                                             <button onClick={() => handleDelete(entry.id)} className="absolute top-1 right-1 text-red-500 font-black opacity-0 group-hover:opacity-100 print:hidden">✕</button>
//                                                         </div>
//                                                     )
//                                                 })}
//                                             </div>
//                                         </td>
//                                     );
//                                 })}
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             </div>
//         </div>
//     );
// };

// export default TimetableView;