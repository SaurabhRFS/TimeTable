import { useState } from "react";
import { generateTimetable } from "../services/generatorService";

const GeneratorDashboard = () => {
    const [status, setStatus] = useState("IDLE"); // IDLE, GENERATING, WARNING, SUCCESS
    const [warnings, setWarnings] = useState([]);
    
    const DEPT = "CT";
    const SEM = 6;

    const handleGenerate = async (force = false) => {
        setStatus("GENERATING");
        try {
            const response = await generateTimetable(DEPT, SEM, force);
            
            if (response.status === "WARNING") {
                setWarnings(response.warnings);
                setStatus("WARNING");
            } else {
                setStatus("SUCCESS");
                setWarnings(response.warnings); // Might have non-fatal warnings
            }
        } catch (error) {
            alert("Error connecting to generator engine.");
            setStatus("IDLE");
        }
    };

    return (
        <div style={{ textAlign: "center", padding: "50px" }}>
            <h1>⚡ The Magic Generator</h1>
            <p>Click below to simulate and generate the timetable based on your constraints.</p>

            <button 
                onClick={() => handleGenerate(false)}
                style={{
                    padding: "20px 40px", fontSize: "20px", fontWeight: "bold",
                    backgroundColor: "black", color: "white", cursor: "pointer",
                    borderRadius: "10px", marginTop: "20px"
                }}
            >
                {status === "GENERATING" ? "Simulating..." : "GENERATE TIMETABLE"}
            </button>

            {/* --- WARNING MODAL --- */}
            {status === "WARNING" && (
                <div style={{
                    marginTop: "30px", padding: "20px", border: "2px solid red", 
                    backgroundColor: "#fff0f0", display: "inline-block", textAlign: "left"
                }}>
                    <h2 style={{ color: "red", marginTop: 0 }}>⚠️ Constraints Could Not Be Met!</h2>
                    <p>The following issues were found during simulation:</p>
                    <ul>
                        {warnings.map((w, idx) => <li key={idx}><strong>{w}</strong></li>)}
                    </ul>
                    <p>Do you still want to continue and generate a partial timetable?</p>
                    
                    <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                        <button 
                            onClick={() => handleGenerate(true)} // FORCE = TRUE
                            style={{ background: "red", color: "white", padding: "10px 20px", fontWeight: "bold" }}
                        >
                            YES, FORCE GENERATE 💥
                        </button>
                        <button 
                            onClick={() => setStatus("IDLE")} 
                            style={{ padding: "10px 20px" }}
                        >
                            No, Let me fix data
                        </button>
                    </div>
                </div>
            )}

            {/* --- SUCCESS STATE --- */}
            {status === "SUCCESS" && (
                <div style={{ marginTop: "40px", color: "green" }}>
                    <h1>🎉 BOOM! Timetable Generated!</h1>
                    {warnings.length > 0 && (
                        <p style={{ color: "orange" }}>Note: It was generated with {warnings.length} missing blocks.</p>
                    )}
                    <p>Navigate to the "View Timetable" tab to see the final result!</p>
                </div>
            )}
        </div>
    );
};

export default GeneratorDashboard;