import { useEffect, useState } from "react";
import { getTimetable } from "../services/timetableService";

const TimetableView = () => {
    const [schedule, setSchedule] = useState([]);
    const [section, setSection] = useState("A");
    const [loading, setLoading] = useState(false);

    const DEPT = "CT";
    const SEM = 6;
    const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT"];
    
    // EXACT match with the PDF columns
    const SLOTS = [
        { slotOrder: 1, label: "10:00 - 10:55", isBreak: false },
        { slotOrder: 2, label: "10:55 - 11:50", isBreak: false },
        { slotOrder: 3, label: "11:50 - 12:00", isBreak: true, name: "SHORT BREAK" },
        { slotOrder: 4, label: "12:00 - 12:55", isBreak: false },
        { slotOrder: 5, label: "1:00 - 2:00", isBreak: false }, 
        { slotOrder: 6, label: "2:00 - 2:55", isBreak: false },
        { slotOrder: 7, label: "2:55 - 3:55", isBreak: false },
        { slotOrder: 8, label: "3:55 - 4:50", isBreak: false }
    ];

    useEffect(() => {
        loadSchedule();
    }, [section]);

    const loadSchedule = async () => {
        setLoading(true);
        try {
            const data = await getTimetable(DEPT, SEM, section);
            setSchedule(data);
        } catch (error) {
            console.error("Error loading timetable:", error);
        } finally {
            setLoading(false);
        }
    };

    const getSubjectColor = (subjectAlias) => {
        const colors = ["#e3f2fd", "#e8f5e9", "#fff3e0", "#f3e5f5", "#ffebee", "#e0f7fa"];
        let hash = 0;
        for (let i = 0; i < subjectAlias.length; i++) {
            hash = subjectAlias.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

    const getCellContent = (entries) => {
        if (entries.length === 0) {
            return <div style={{ color: "#aaa", padding: "15px", fontStyle: "italic" }}>Free</div>;
        }

        return (
            <div style={{ 
                display: entries.length > 1 ? "grid" : "block", 
                gridTemplateColumns: entries.length > 1 ? "1fr 1fr" : "1fr", 
                gap: "4px", height: "100%" 
            }}>
                {entries.map(entry => {
                    const bgColor = getSubjectColor(entry.subject.alias);
                    const isLab = entry.batch !== "ALL";
                    
                    return (
                        <div key={entry.id} style={{ 
                            backgroundColor: bgColor,
                            borderLeft: isLab ? "5px solid #6b21a8" : `5px solid #2563eb`,
                            border: "1px solid #ddd", borderRadius: "6px",
                            padding: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                            display: "flex", flexDirection: "column", justifyContent: "center"
                        }}>
                            <div style={{ fontWeight: "900", color: "#1e293b", fontSize: isLab ? "14px" : "13px" }}>
                                {entry.subject.alias} {isLab ? `(Batch ${entry.batch})` : ""}
                            </div>
                            <div style={{ fontSize: "11px", color: "#475569", marginTop: "4px", fontWeight: "bold" }}>
                                Room: {entry.room.roomNumber} | {entry.teacher.alias}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "20px", fontFamily: "sans-serif" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "3px solid #1e293b", paddingBottom: "10px", marginBottom: "20px" }}>
                <div>
                    <h2 style={{ margin: 0, color: "#1e293b", fontSize: "24px" }}>Department of Computer Technology</h2>
                    <p style={{ margin: "4px 0 0 0", color: "#64748b", fontWeight: "bold" }}>B.Tech {SEM}th Semester Timetable</p>
                </div>
                
                <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                    <select value={section} onChange={(e) => setSection(e.target.value)} style={{ padding: "8px 12px", borderRadius: "6px", border: "2px solid #cbd5e1", fontWeight: "bold", fontSize: "16px", cursor: "pointer" }}>
                        <option value="A">Section A</option>
                        <option value="B">Section B</option>
                    </select>
                    <button onClick={() => window.print()} style={{ padding: "8px 16px", background: "#1e293b", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>
                        Print PDF
                    </button>
                </div>
            </div>

            {loading ? <div style={{ textAlign: "center", padding: "50px", color: "#666", fontWeight: "bold", fontSize: "18px" }}>Loading timetable...</div> : (
                <div style={{ overflowX: "auto", backgroundColor: "white", borderRadius: "8px", boxShadow: "0 4px 10px rgba(0,0,0,0.1)", border: "1px solid #e2e8f0" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "center", tableLayout: "fixed" }}>
                        <thead>
                            <tr>
                                <th style={{ width: "8%", padding: "15px", background: "#f1f5f9", borderBottom: "2px solid #cbd5e1", borderRight: "2px solid #cbd5e1", color: "#334155" }}>
                                    Day / Time
                                </th>
                                {SLOTS.map(slot => (
                                    <th key={slot.slotOrder} style={{ width: slot.isBreak ? "4%" : "12.5%", padding: "10px", background: "#f8fafc", borderBottom: "2px solid #cbd5e1", borderRight: "1px solid #e2e8f0", color: "#334155", fontSize: "13px", fontWeight: "800" }}>
                                        {slot.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {DAYS.map((day, dayIndex) => {
                                let skipNext = 0; // The magic variable that allows labs to span multiple columns
                                
                                return (
                                    <tr key={day} style={{ transition: "background-color 0.2s" }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                        <td style={{ padding: "15px", background: "#f1f5f9", borderRight: "2px solid #cbd5e1", borderBottom: "1px solid #e2e8f0", fontSize: "16px", fontWeight: "900", color: "#1e293b" }}>
                                            {day}
                                        </td>
                                        
                                        {SLOTS.map(slot => {
                                            if (skipNext > 0) {
                                                skipNext--;
                                                return null; // Skip rendering this <td> because the previous Lab is spanning over it
                                            }

                                            if (slot.isBreak) {
                                                if (dayIndex === 0) {
                                                    return (
                                                        <td key={slot.slotOrder} rowSpan={DAYS.length} style={{ background: "#e2e8f0", borderRight: "1px solid #cbd5e1", borderBottom: "1px solid #cbd5e1" }}>
                                                            <div style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", margin: "0 auto", letterSpacing: "4px", fontWeight: "900", color: "#475569", fontSize: "14px" }}>
                                                                {slot.name}
                                                            </div>
                                                        </td>
                                                    );
                                                }
                                                return null; 
                                            }

                                            // Get all entries for this specific time block
                                            const entries = schedule.filter(e => e.day === day && e.timeSlot.slotOrder === slot.slotOrder);
                                            const isLab = entries.length > 0 && entries.some(e => e.batch !== "ALL");

                                            if (isLab) {
                                                skipNext = 1; // Tell the loop to skip the next column to make room for this 2-hour lab block
                                                return (
                                                    <td key={`${day}-${slot.slotOrder}`} colSpan={2} style={{ padding: "6px", borderRight: "1px solid #e2e8f0", borderBottom: "1px solid #e2e8f0", verticalAlign: "middle", backgroundColor: "#fff", height: "85px" }}>
                                                        {getCellContent(entries)}
                                                    </td>
                                                );
                                            } else {
                                                return (
                                                    <td key={`${day}-${slot.slotOrder}`} colSpan={1} style={{ padding: "4px", borderRight: "1px solid #e2e8f0", borderBottom: "1px solid #e2e8f0", verticalAlign: "middle", backgroundColor: "#fff", height: "85px" }}>
                                                        {getCellContent(entries)}
                                                    </td>
                                                );
                                            }
                                        })}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default TimetableView;













// import { useEffect, useState } from "react";

// import { getTimetable } from "../services/timetableService";

// const TimetableView = () => {
//     const [schedule, setSchedule] = useState([]);
//     const [section, setSection] = useState("A");
//     const [loading, setLoading] = useState(false);

//     const DEPT = "CT";
//     const SEM = 6;
//     const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT"];
    
//     // CHANGED: We now map using slotOrder, not DB ID, so it survives database resets!
//     const SLOTS = [
//         { slotOrder: 1, label: "10:00 - 10:55", isBreak: false },
//         { slotOrder: 2, label: "10:55 - 11:50", isBreak: false },
//         { slotOrder: 3, label: "11:50 - 12:00", isBreak: true, name: "SHORT BREAK" },
//         { slotOrder: 4, label: "12:00 - 12:55", isBreak: false },
//         { slotOrder: 5, label: "12:55 - 01:35", isBreak: true, name: "LUNCH BREAK" },
//         { slotOrder: 6, label: "01:35 - 02:30", isBreak: false },
//         { slotOrder: 7, label: "02:30 - 03:25", isBreak: false },
//         { slotOrder: 8, label: "03:25 - 03:35", isBreak: true, name: "SHORT BREAK" },
//         { slotOrder: 9, label: "03:35 - 04:30", isBreak: false }
//     ];

//     useEffect(() => {
//         loadSchedule();
//     }, [section]);

//     const loadSchedule = async () => {
//         setLoading(true);
//         try {
//             const data = await getTimetable(DEPT, SEM, section);
//             setSchedule(data);
//         } catch (error) {
//             console.error("Error loading timetable:", error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const getSubjectColor = (subjectAlias) => {
//         const colors = ["#e3f2fd", "#e8f5e9", "#fff3e0", "#f3e5f5", "#ffebee", "#e0f7fa"];
//         let hash = 0;
//         for (let i = 0; i < subjectAlias.length; i++) {
//             hash = subjectAlias.charCodeAt(i) + ((hash << 5) - hash);
//         }
//         return colors[Math.abs(hash) % colors.length];
//     };

//     // UPGRADED: Renders Parallel Labs Side-by-Side just like your PDF
//     const getCellContent = (day, slotOrder) => {
//         // Find all entries for this specific day and slotOrder
//         const entries = schedule.filter(e => e.day === day && e.timeSlot.slotOrder === slotOrder);
        
//         if (entries.length === 0) {
//             return <div style={{ color: "#aaa", padding: "15px", fontStyle: "italic" }}>Free</div>;
//         }

//         return (
//             <div style={{ 
//                 display: entries.length > 1 ? "grid" : "block", 
//                 gridTemplateColumns: entries.length > 1 ? "1fr 1fr" : "1fr", 
//                 gap: "4px", 
//                 height: "100%" 
//             }}>
//                 {entries.map(entry => {
//                     const bgColor = getSubjectColor(entry.subject.alias);
//                     const isLab = entry.batch !== "ALL";
                    
//                     return (
//                         <div key={entry.id} style={{ 
//                             backgroundColor: bgColor,
//                             borderLeft: isLab ? "4px solid #6b21a8" : `4px solid #2563eb`,
//                             border: "1px solid #ddd",
//                             borderRadius: "4px",
//                             padding: "6px",
//                             boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
//                             textAlign: "center",
//                             display: "flex",
//                             flexDirection: "column",
//                             justifyContent: "center"
//                         }}>
//                             <div style={{ fontWeight: "900", color: "#222", fontSize: "12px" }}>
//                                 {entry.subject.alias} {isLab ? `(B: ${entry.batch})` : ""}
//                             </div>
//                             <div style={{ fontSize: "10px", color: "#555", marginTop: "2px", fontWeight: "bold" }}>
//                                 {entry.room.roomNumber} | {entry.teacher.alias}
//                             </div>
//                         </div>
//                     );
//                 })}
//             </div>
//         );
//     };

//     return (
//         <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "20px", fontFamily: "sans-serif" }}>
            
//             <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "3px solid #1e293b", paddingBottom: "10px", marginBottom: "20px" }}>
//                 <div>
//                     <h2 style={{ margin: 0, color: "#1e293b", fontSize: "24px" }}>Department of Computer Technology</h2>
//                     <p style={{ margin: "4px 0 0 0", color: "#64748b", fontWeight: "bold" }}>Academic Year 2025-26 | B.Tech {SEM}th Semester</p>
//                 </div>
                
//                 <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
//                     <select 
//                         value={section} 
//                         onChange={(e) => setSection(e.target.value)} 
//                         style={{ padding: "8px 12px", borderRadius: "6px", border: "2px solid #cbd5e1", fontWeight: "bold", fontSize: "16px", cursor: "pointer" }}
//                     >
//                         <option value="A">Section A</option>
//                         <option value="B">Section B</option>
//                     </select>
//                     <button 
//                         onClick={() => window.print()} 
//                         style={{ padding: "8px 16px", background: "#1e293b", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}
//                     >
//                         Print PDF
//                     </button>
//                 </div>
//             </div>

//             {loading ? <div style={{ textAlign: "center", padding: "50px", color: "#666", fontWeight: "bold", fontSize: "18px" }}>Loading timetable...</div> : (
//                 <div style={{ overflowX: "auto", backgroundColor: "white", borderRadius: "8px", boxShadow: "0 4px 10px rgba(0,0,0,0.1)", border: "1px solid #e2e8f0" }}>
//                     <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "center", tableLayout: "fixed" }}>
//                         <thead>
//                             <tr>
//                                 <th style={{ width: "8%", padding: "15px", background: "#f1f5f9", borderBottom: "2px solid #cbd5e1", borderRight: "2px solid #cbd5e1", color: "#334155" }}>
//                                     Day / Time
//                                 </th>
//                                 {SLOTS.map(slot => (
//                                     <th key={slot.slotOrder} style={{ 
//                                         width: slot.isBreak ? "4%" : "12.5%", 
//                                         padding: "10px", 
//                                         background: "#f8fafc", 
//                                         borderBottom: "2px solid #cbd5e1", 
//                                         borderRight: "1px solid #e2e8f0", 
//                                         color: "#334155",
//                                         fontSize: "12px",
//                                         fontWeight: "800"
//                                     }}>
//                                         {slot.label}
//                                     </th>
//                                 ))}
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {DAYS.map((day, dayIndex) => (
//                                 <tr key={day} style={{ transition: "background-color 0.2s" }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                    
//                                     {/* Y-Axis: Days */}
//                                     <td style={{ 
//                                         padding: "15px", 
//                                         background: "#f1f5f9", 
//                                         borderRight: "2px solid #cbd5e1", 
//                                         borderBottom: "1px solid #e2e8f0", 
//                                         fontSize: "16px", 
//                                         fontWeight: "900", 
//                                         color: "#1e293b" 
//                                     }}>
//                                         {day}
//                                     </td>
                                    
//                                     {/* X-Axis: Time Slots */}
//                                     {SLOTS.map(slot => {
//                                         if (slot.isBreak) {
//                                             if (dayIndex === 0) {
//                                                 return (
//                                                     <td key={slot.slotOrder} rowSpan={DAYS.length} style={{ 
//                                                         background: "#e2e8f0", 
//                                                         borderRight: "1px solid #cbd5e1", 
//                                                         borderBottom: "1px solid #cbd5e1",
//                                                     }}>
//                                                         <div style={{ 
//                                                             writingMode: "vertical-rl", 
//                                                             transform: "rotate(180deg)", 
//                                                             margin: "0 auto", 
//                                                             letterSpacing: "4px",
//                                                             fontWeight: "900",
//                                                             color: "#475569",
//                                                             fontSize: "14px"
//                                                         }}>
//                                                             {slot.name}
//                                                         </div>
//                                                     </td>
//                                                 );
//                                             }
//                                             return null; 
//                                         } else {
//                                             return (
//                                                 <td key={`${day}-${slot.slotOrder}`} style={{ 
//                                                     padding: "4px", 
//                                                     borderRight: "1px solid #e2e8f0", 
//                                                     borderBottom: "1px solid #e2e8f0", 
//                                                     verticalAlign: "middle", 
//                                                     backgroundColor: "#fff",
//                                                     height: "80px"
//                                                 }}>
//                                                     {/* Pass slot.slotOrder instead of slot.id */}
//                                                     {getCellContent(day, slot.slotOrder)}
//                                                 </td>
//                                             );
//                                         }
//                                     })}
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default TimetableView;


































// import { useEffect, useState } from "react";
// import { getTimetable } from "../services/timetableService";

// const TimetableView = () => {
//     const [schedule, setSchedule] = useState([]);
//     const [section, setSection] = useState("A");
//     const [loading, setLoading] = useState(false);

//     const DEPT = "CT";
//     const SEM = 6;
//     const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT"];
    
//     const SLOTS = [
//         { id: 1, label: "10:00 - 10:55", isBreak: false },
//         { id: 2, label: "10:55 - 11:50", isBreak: false },
//         { id: 3, label: "11:50 - 12:00", isBreak: true, name: "SHORT BREAK" },
//         { id: 4, label: "12:00 - 12:55", isBreak: false },
//         { id: 5, label: "12:55 - 01:35", isBreak: true, name: "LUNCH BREAK" },
//         { id: 6, label: "01:35 - 02:30", isBreak: false },
//         { id: 7, label: "02:30 - 03:25", isBreak: false },
//         { id: 8, label: "03:25 - 03:35", isBreak: true, name: "SHORT BREAK" },
//         { id: 9, label: "03:35 - 04:30", isBreak: false }
//     ];

//     useEffect(() => {
//         loadSchedule();
//     }, [section]);

//     const loadSchedule = async () => {
//         setLoading(true);
//         try {
//             const data = await getTimetable(DEPT, SEM, section);
//             setSchedule(data);
//         } catch (error) {
//             alert("Error loading timetable data.");
//         } finally {
//             setLoading(false);
//         }
//     };

//     // Assigns a consistent pastel background color based on the subject's name
//     const getSubjectColor = (subjectAlias) => {
//         const colors = ["#e3f2fd", "#e8f5e9", "#fff3e0", "#f3e5f5", "#ffebee", "#e0f7fa"];
//         let hash = 0;
//         for (let i = 0; i < subjectAlias.length; i++) {
//             hash = subjectAlias.charCodeAt(i) + ((hash << 5) - hash);
//         }
//         return colors[Math.abs(hash) % colors.length];
//     };

//     const getCellContent = (day, slotId) => {
//         const entries = schedule.filter(e => e.day === day && e.timeSlot.id === slotId);
        
//         if (entries.length === 0) {
//             return <div style={{ color: "#ccc", padding: "10px" }}>- Free -</div>;
//         }

//         return entries.map(entry => {
//             const bgColor = getSubjectColor(entry.subject.alias);
//             const isLab = entry.batch !== "ALL";
            
//             return (
//                 <div key={entry.id} style={{ 
//                     backgroundColor: bgColor,
//                     borderLeft: isLab ? "4px solid #333" : `4px solid ${bgColor}`,
//                     border: "1px solid #ddd",
//                     borderRadius: "4px",
//                     padding: "6px",
//                     marginBottom: "4px",
//                     boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
//                     textAlign: "left"
//                 }}>
//                     <div style={{ fontWeight: "bold", color: "#222", fontSize: "13px" }}>
//                         {entry.subject.alias} {isLab ? `[${entry.batch}]` : ""}
//                     </div>
//                     <div style={{ fontSize: "11px", color: "#555", marginTop: "4px" }}>
//                         {entry.teacher.alias} | Rm: {entry.room.roomNumber}
//                     </div>
//                 </div>
//             );
//         });
//     };

//     return (
//         <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "20px" }}>
            
//             <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #333", paddingBottom: "10px", marginBottom: "20px" }}>
//                 <h2 style={{ margin: 0, color: "#333" }}>Class Timetable View</h2>
                
//                 <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
//                     <span style={{ fontWeight: "bold", color: "#666" }}>{DEPT} - Semester {SEM}</span>
//                     <select 
//                         value={section} 
//                         onChange={(e) => setSection(e.target.value)} 
//                         style={{ padding: "8px 12px", borderRadius: "4px", border: "1px solid #ccc", fontWeight: "bold" }}
//                     >
//                         <option value="A">Section A</option>
//                         <option value="B">Section B</option>
//                     </select>
//                     <button 
//                         onClick={() => window.print()} 
//                         style={{ padding: "8px 16px", background: "#333", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
//                     >
//                         Print PDF
//                     </button>
//                 </div>
//             </div>

//             {loading ? <div style={{ textAlign: "center", padding: "50px", color: "#666" }}>Loading schedule data...</div> : (
//                 <div style={{ overflowX: "auto", backgroundColor: "white", borderRadius: "8px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
//                     <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "center", tableLayout: "fixed" }}>
//                         <thead>
//                             <tr>
//                                 <th style={{ width: "8%", padding: "15px", background: "#f8f9fa", borderBottom: "2px solid #333", borderRight: "2px solid #333", color: "#333" }}>
//                                     Day \ Time
//                                 </th>
//                                 {SLOTS.map(slot => (
//                                     <th key={slot.id} style={{ 
//                                         width: slot.isBreak ? "4%" : "13%", 
//                                         padding: "10px", 
//                                         background: "#f8f9fa", 
//                                         borderBottom: "2px solid #333", 
//                                         borderRight: "1px solid #ddd", 
//                                         color: "#333",
//                                         fontSize: "13px"
//                                     }}>
//                                         {slot.label}
//                                     </th>
//                                 ))}
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {DAYS.map((day, dayIndex) => (
//                                 <tr key={day}>
//                                     {/* Y-Axis: Days */}
//                                     <td style={{ 
//                                         padding: "15px", 
//                                         background: "#fcfcfc", 
//                                         borderRight: "2px solid #333", 
//                                         borderBottom: "1px solid #ddd", 
//                                         fontSize: "14px", 
//                                         fontWeight: "bold", 
//                                         color: "#333" 
//                                     }}>
//                                         {day}
//                                     </td>
                                    
//                                     {/* X-Axis: Time Slots */}
//                                     {SLOTS.map(slot => {
//                                         if (slot.isBreak) {
//                                             // Render the Break column only on the first row, spanning all rows
//                                             if (dayIndex === 0) {
//                                                 return (
//                                                     <td key={slot.id} rowSpan={DAYS.length} style={{ 
//                                                         background: "#f1f3f5", 
//                                                         borderRight: "1px solid #ddd", 
//                                                         borderBottom: "1px solid #ddd",
//                                                     }}>
//                                                         <div style={{ 
//                                                             writingMode: "vertical-rl", 
//                                                             transform: "rotate(180deg)", 
//                                                             margin: "0 auto", 
//                                                             letterSpacing: "3px",
//                                                             fontWeight: "bold",
//                                                             color: "#777",
//                                                             fontSize: "14px"
//                                                         }}>
//                                                             {slot.name}
//                                                         </div>
//                                                     </td>
//                                                 );
//                                             }
//                                             return null; // Skip rendering for other days because rowSpan covers it
//                                         } else {
//                                             return (
//                                                 <td key={`${day}-${slot.id}`} style={{ 
//                                                     padding: "6px", 
//                                                     borderRight: "1px solid #ddd", 
//                                                     borderBottom: "1px solid #ddd", 
//                                                     verticalAlign: "top", 
//                                                     backgroundColor: "#fff" 
//                                                 }}>
//                                                     {getCellContent(day, slot.id)}
//                                                 </td>
//                                             );
//                                         }
//                                     })}
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default TimetableView;