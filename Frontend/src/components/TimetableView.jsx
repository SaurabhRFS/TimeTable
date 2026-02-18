import { useEffect, useState } from "react";
import { getTimetable } from "../services/timetableService";

const TimetableView = () => {
    const [schedule, setSchedule] = useState([]);
    const [section, setSection] = useState("A");
    const [loading, setLoading] = useState(false);

    const DEPT = "CT";
    const SEM = 6;
    const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT"];
    
    const SLOTS = [
        { id: 1, label: "10:00 - 10:55", isBreak: false },
        { id: 2, label: "10:55 - 11:50", isBreak: false },
        { id: 3, label: "11:50 - 12:00", isBreak: true, name: "SHORT BREAK" },
        { id: 4, label: "12:00 - 12:55", isBreak: false },
        { id: 5, label: "12:55 - 01:35", isBreak: true, name: "LUNCH BREAK" },
        { id: 6, label: "01:35 - 02:30", isBreak: false },
        { id: 7, label: "02:30 - 03:25", isBreak: false },
        { id: 8, label: "03:25 - 03:35", isBreak: true, name: "SHORT BREAK" },
        { id: 9, label: "03:35 - 04:30", isBreak: false }
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
            alert("Error loading timetable data.");
        } finally {
            setLoading(false);
        }
    };

    // Assigns a consistent pastel background color based on the subject's name
    const getSubjectColor = (subjectAlias) => {
        const colors = ["#e3f2fd", "#e8f5e9", "#fff3e0", "#f3e5f5", "#ffebee", "#e0f7fa"];
        let hash = 0;
        for (let i = 0; i < subjectAlias.length; i++) {
            hash = subjectAlias.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

    const getCellContent = (day, slotId) => {
        const entries = schedule.filter(e => e.day === day && e.timeSlot.id === slotId);
        
        if (entries.length === 0) {
            return <div style={{ color: "#ccc", padding: "10px" }}>- Free -</div>;
        }

        return entries.map(entry => {
            const bgColor = getSubjectColor(entry.subject.alias);
            const isLab = entry.batch !== "ALL";
            
            return (
                <div key={entry.id} style={{ 
                    backgroundColor: bgColor,
                    borderLeft: isLab ? "4px solid #333" : `4px solid ${bgColor}`,
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    padding: "6px",
                    marginBottom: "4px",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                    textAlign: "left"
                }}>
                    <div style={{ fontWeight: "bold", color: "#222", fontSize: "13px" }}>
                        {entry.subject.alias} {isLab ? `[${entry.batch}]` : ""}
                    </div>
                    <div style={{ fontSize: "11px", color: "#555", marginTop: "4px" }}>
                        {entry.teacher.alias} | Rm: {entry.room.roomNumber}
                    </div>
                </div>
            );
        });
    };

    return (
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "20px" }}>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #333", paddingBottom: "10px", marginBottom: "20px" }}>
                <h2 style={{ margin: 0, color: "#333" }}>Class Timetable View</h2>
                
                <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                    <span style={{ fontWeight: "bold", color: "#666" }}>{DEPT} - Semester {SEM}</span>
                    <select 
                        value={section} 
                        onChange={(e) => setSection(e.target.value)} 
                        style={{ padding: "8px 12px", borderRadius: "4px", border: "1px solid #ccc", fontWeight: "bold" }}
                    >
                        <option value="A">Section A</option>
                        <option value="B">Section B</option>
                    </select>
                    <button 
                        onClick={() => window.print()} 
                        style={{ padding: "8px 16px", background: "#333", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
                    >
                        Print PDF
                    </button>
                </div>
            </div>

            {loading ? <div style={{ textAlign: "center", padding: "50px", color: "#666" }}>Loading schedule data...</div> : (
                <div style={{ overflowX: "auto", backgroundColor: "white", borderRadius: "8px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "center", tableLayout: "fixed" }}>
                        <thead>
                            <tr>
                                <th style={{ width: "8%", padding: "15px", background: "#f8f9fa", borderBottom: "2px solid #333", borderRight: "2px solid #333", color: "#333" }}>
                                    Day \ Time
                                </th>
                                {SLOTS.map(slot => (
                                    <th key={slot.id} style={{ 
                                        width: slot.isBreak ? "4%" : "13%", 
                                        padding: "10px", 
                                        background: "#f8f9fa", 
                                        borderBottom: "2px solid #333", 
                                        borderRight: "1px solid #ddd", 
                                        color: "#333",
                                        fontSize: "13px"
                                    }}>
                                        {slot.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {DAYS.map((day, dayIndex) => (
                                <tr key={day}>
                                    {/* Y-Axis: Days */}
                                    <td style={{ 
                                        padding: "15px", 
                                        background: "#fcfcfc", 
                                        borderRight: "2px solid #333", 
                                        borderBottom: "1px solid #ddd", 
                                        fontSize: "14px", 
                                        fontWeight: "bold", 
                                        color: "#333" 
                                    }}>
                                        {day}
                                    </td>
                                    
                                    {/* X-Axis: Time Slots */}
                                    {SLOTS.map(slot => {
                                        if (slot.isBreak) {
                                            // Render the Break column only on the first row, spanning all rows
                                            if (dayIndex === 0) {
                                                return (
                                                    <td key={slot.id} rowSpan={DAYS.length} style={{ 
                                                        background: "#f1f3f5", 
                                                        borderRight: "1px solid #ddd", 
                                                        borderBottom: "1px solid #ddd",
                                                    }}>
                                                        <div style={{ 
                                                            writingMode: "vertical-rl", 
                                                            transform: "rotate(180deg)", 
                                                            margin: "0 auto", 
                                                            letterSpacing: "3px",
                                                            fontWeight: "bold",
                                                            color: "#777",
                                                            fontSize: "14px"
                                                        }}>
                                                            {slot.name}
                                                        </div>
                                                    </td>
                                                );
                                            }
                                            return null; // Skip rendering for other days because rowSpan covers it
                                        } else {
                                            return (
                                                <td key={`${day}-${slot.id}`} style={{ 
                                                    padding: "6px", 
                                                    borderRight: "1px solid #ddd", 
                                                    borderBottom: "1px solid #ddd", 
                                                    verticalAlign: "top", 
                                                    backgroundColor: "#fff" 
                                                }}>
                                                    {getCellContent(day, slot.id)}
                                                </td>
                                            );
                                        }
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default TimetableView;