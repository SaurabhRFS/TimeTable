import { useEffect, useState } from "react";
import { getSubjectsBySem } from "../services/subjectService";
import { getAllTeachers } from "../services/teacherService";
import { getTimetable, addManualEntry, deleteEntry, autoGenerateGrid } from "../services/timetableService";

const TimetableView = ({ activeDept }) => { // 1. Catch the prop
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

    const [activeSems, setActiveSems] = useState([6]); 
    const [viewSem, setViewSem] = useState(6);
    
    const [section, setSection] = useState("A");
    const [schedule, setSchedule] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [statusMsg, setStatusMsg] = useState({ text: "", type: "" });

    const [formData, setFormData] = useState({
        day: "MON", timeSlotId: "1", subjectId: "", teacherId: ""
    });

    useEffect(() => {
        if (!activeSems.includes(viewSem) && activeSems.length > 0) {
            setViewSem(activeSems[0]);
        }
    }, [activeSems]);

    // 2. Add activeDept to dependencies
    useEffect(() => { 
        if(activeSems.includes(viewSem)) {
            loadData(); 
        } else {
            setSchedule([]); 
        }
    }, [section, viewSem, activeDept]);

    const loadData = async () => {
        try {
            const [schedData, subData, teacherData] = await Promise.all([
                getTimetable(activeDept, viewSem, section), // 3. Use activeDept
                getSubjectsBySem(activeDept, viewSem),      // Use activeDept
                getAllTeachers()
            ]);
            setSchedule(schedData); 
            setSubjects(subData); 
            setTeachers(teacherData);
        } catch (error) { 
            showMessage("Error loading data.", "error"); 
        }
    };

    const showMessage = (text, type) => {
        setStatusMsg({ text, type });
        setTimeout(() => setStatusMsg({ text: "", type: "" }), 3000);
    };

    const toggleSem = (sem) => {
        setActiveSems(prev => 
            prev.includes(sem) ? prev.filter(s => s !== sem) : [...prev, sem].sort()
        );
    };

    const setTerm = (type) => {
        if (type === 'ODD') setActiveSems([1, 3, 5, 7]);
        if (type === 'EVEN') setActiveSems([2, 4, 6, 8]);
    };

    const handleFormChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSaveEntry = async (e) => {
        e.preventDefault();
        
        const payload = {
            day: formData.day,
            department: activeDept, // 4. Use activeDept when saving manual entries
            semester: viewSem.toString(),
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
        if(activeSems.length === 0) {
            showMessage("Please turn ON at least one semester.", "error");
            return;
        }

        if(window.confirm(`Ready to generate timetables for ${activeDept} Semesters: ${activeSems.join(", ")}?`)) {
            try {
                showMessage("Generating schedules... Please wait.", "success");
                
                for (const sem of activeSems) {
                    await autoGenerateGrid(activeDept, sem); // 5. Use activeDept during auto-generation
                }
                
                showMessage("All Active Timetables Generated Successfully!", "success");
                loadData(); 
            } catch (error) {
                showMessage("Failed during generation.", "error");
            }
        }
    };

    return (
        <div className="max-w-7xl mx-auto font-sans animate-fade-in-up">
            
            {statusMsg.text && (
                <div className={`p-3 mb-4 rounded text-white font-bold shadow-sm ${statusMsg.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}>
                    {statusMsg.text}
                </div>
            )}

            {/* Title & Department Display */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 print:hidden">
                <div>
                    <h2 className="text-2xl font-black text-slate-800">Interactive Timetable</h2>
                    <p className="text-slate-500 font-bold mt-1 tracking-wide">
                        Currently Managing: <span className="bg-slate-800 text-white px-2 py-0.5 rounded ml-1">{activeDept}</span>
                    </p>
                </div>
            </div>

            <div className="bg-white p-5 rounded-xl mb-6 shadow-sm border border-slate-200 print:hidden">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                    <div>
                        <h3 className="text-lg font-black text-slate-800">Term Configuration</h3>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Select which semesters are currently active</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setTerm('ODD')} className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded border border-indigo-200 text-sm transition-colors">
                            Set ODD Term
                        </button>
                        <button onClick={() => setTerm('EVEN')} className="px-3 py-1.5 bg-fuchsia-50 hover:bg-fuchsia-100 text-fuchsia-700 font-bold rounded border border-fuchsia-200 text-sm transition-colors">
                            Set EVEN Term
                        </button>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(num => {
                        const isOn = activeSems.includes(num);
                        return (
                            <button 
                                key={num}
                                onClick={() => toggleSem(num)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-black text-sm transition-all border ${
                                    isOn 
                                    ? 'bg-emerald-100 border-emerald-400 text-emerald-800 shadow-sm' 
                                    : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100'
                                }`}
                            >
                                <div className={`w-2.5 h-2.5 rounded-full ${isOn ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                                Sem {num}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center mb-6 bg-slate-50 p-3 rounded-lg border border-slate-200 shadow-sm print:hidden">
                <div className="flex items-center gap-3 w-full md:w-auto mb-3 md:mb-0">
                    <span className="font-bold text-slate-600">Viewing:</span>
                    
                    <select 
                        value={viewSem} 
                        onChange={(e) => setViewSem(parseInt(e.target.value))} 
                        className="p-2 border-2 border-slate-300 rounded font-bold outline-none text-slate-800 bg-white cursor-pointer"
                        disabled={activeSems.length === 0}
                    >
                        {activeSems.length === 0 && <option value="">-- None Active --</option>}
                        {activeSems.map(sem => (
                            <option key={sem} value={sem}>Semester {sem}</option>
                        ))}
                    </select>

                    <select value={section} onChange={(e) => setSection(e.target.value)} className="p-2 border-2 border-slate-300 rounded font-bold outline-none text-slate-800 bg-white cursor-pointer">
                        <option value="A">Section A</option>
                        <option value="B">Section B</option>
                    </select>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    <button 
                        onClick={handleAutoFill} 
                        disabled={activeSems.length === 0}
                        className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white font-bold px-5 py-2 rounded shadow-sm transition-colors"
                    >
                        Auto-Fill All Active
                    </button>
                    <button onClick={() => window.print()} className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-5 py-2 rounded shadow-sm transition-colors">
                        Print View
                    </button>
                </div>
            </div>

            {activeSems.length > 0 ? (
                <>
                    <div className="bg-slate-800 p-4 rounded-xl mb-6 shadow-md print:hidden">
                        <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                            <span>📌</span> Pin Manual Block to {activeDept} Sem {viewSem} - Sec {section}
                        </h3>
                        <form onSubmit={handleSaveEntry} className="flex flex-wrap gap-3 items-end">
                            <div className="flex-1 min-w-[120px]">
                                <label className="text-slate-300 text-xs font-bold block mb-1">Day</label>
                                <select name="day" value={formData.day} onChange={handleFormChange} className="w-full p-2 rounded font-bold outline-none">
                                    {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                            <div className="flex-1 min-w-[150px]">
                                <label className="text-slate-300 text-xs font-bold block mb-1">Time Slot</label>
                                <select name="timeSlotId" value={formData.timeSlotId} onChange={handleFormChange} className="w-full p-2 rounded font-bold outline-none">
                                    {SLOTS.filter(s => !s.isBreak).map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                                </select>
                            </div>
                            
                            <div className="flex-1 min-w-[200px]">
                                <label className="text-slate-300 text-xs font-bold block mb-1">Subject / Lab / Activity</label>
                                <select name="subjectId" value={formData.subjectId} onChange={handleFormChange} required className="w-full p-2 rounded font-bold outline-none">
                                    <option value="">-- Select --</option>
                                    {subjects.map(s => <option key={s.id} value={s.id}>[{s.subjectType}] {s.alias}</option>)}
                                </select>
                            </div>
                            
                            <div className="flex-1 min-w-[150px]">
                                <label className="text-slate-300 text-xs font-bold block mb-1">Teacher</label>
                                <select name="teacherId" value={formData.teacherId} onChange={handleFormChange} required className="w-full p-2 rounded font-bold outline-none">
                                    <option value="">-- Teacher --</option>
                                    {teachers.map(t => <option key={t.id} value={t.id}>{t.name} ({t.alias})</option>)}
                                </select>
                            </div>

                            <button type="submit" className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-black px-6 py-2 rounded transition-colors">
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
                                                                    <button onClick={() => handleDelete(entry.id)} className="absolute top-1 right-1 text-red-500 font-black opacity-0 group-hover:opacity-100 print:hidden transition-opacity">✕</button>
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
                </>
            ) : (
                <div className="bg-white/80 backdrop-blur-sm border-2 border-dashed border-slate-300 rounded-xl p-12 text-center text-slate-500 shadow-sm">
                    <span className="text-4xl mb-4 block">📅</span>
                    <h3 className="text-xl font-black text-slate-700 mb-2">No Semesters Active</h3>
                    <p className="font-bold">Please turn on at least one semester from the Term Configuration panel above to view or edit the {activeDept} timetable.</p>
                </div>
            )}
        </div>
    );
};

export default TimetableView;





// import { useEffect, useState } from "react";
// import { getSubjectsBySem } from "../services/subjectService";
// import { getAllTeachers } from "../services/teacherService";
// import { getTimetable, addManualEntry, deleteEntry, autoGenerateGrid } from "../services/timetableService";

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
//             showMessage("Added to grid.", "success");
//             loadData(); 
//         } catch (error) {
//             showMessage("Failed to save. Check inputs.", "error");
//         }
//     };

//     const handleDelete = async (entryId) => {
//         if (window.confirm("Remove this entry?")) {
//             try {
//                 await deleteEntry(entryId);
//                 showMessage("Removed successfully.", "success");
//                 loadData();
//             } catch (error) { showMessage("Failed to delete.", "error"); }
//         }
//     };

//     const handleAutoFill = async () => {
//         if(window.confirm("Ready to generate the timetable for all sections?")) {
//             try {
//                 await autoGenerateGrid(DEPT, SEM);
//                 showMessage("Timetable Generated Successfully.", "success");
//                 loadData(); 
//             } catch (error) {
//                 showMessage("Failed to generate timetable.", "error");
//             }
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
//                     <button onClick={handleAutoFill} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded shadow-sm">
//                         Auto-Fill Theory
//                     </button>
//                     <button onClick={() => window.print()} className="bg-slate-800 text-white font-bold px-4 py-2 rounded shadow-sm print:hidden">
//                         Print
//                     </button>
//                 </div>
//             </div>

//             {statusMsg.text && (
//                 <div className={`p-3 mb-4 rounded text-white font-bold shadow-sm ${statusMsg.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}>
//                     {statusMsg.text}
//                 </div>
//             )}

//             <div className="bg-slate-800 p-4 rounded-xl mb-6 shadow-md print:hidden">
//                 <h3 className="text-white font-bold mb-3">Pin Manual Block</h3>
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