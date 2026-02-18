const Navbar = ({ activeTab, setActiveTab }) => {
    return (
        <nav style={{ borderBottom: "2px solid #ddd", padding: "15px", marginBottom: "20px", display: "flex", justifyContent: "space-between", background: "#f8f9fa" }}>
            <h2 style={{ margin: 0 }}>Smart Scheduler</h2>
            
            <div style={{ display: "flex", gap: "10px" }}>
                <button 
                    onClick={() => setActiveTab("teachers")}
                    style={{ padding: "10px", cursor: "pointer", background: activeTab === "teachers" ? "black" : "white", color: activeTab === "teachers" ? "white" : "black" }}
                >
                    Teachers
                </button>
                <button 
                    onClick={() => setActiveTab("workload")}
                    style={{ padding: "10px", cursor: "pointer", background: activeTab === "workload" ? "black" : "white", color: activeTab === "workload" ? "white" : "black" }}
                >
                    Workload
                </button>
                <button 
                    onClick={() => setActiveTab("generate")}
                    style={{ padding: "10px", cursor: "pointer", background: activeTab === "generate" ? "black" : "white", color: activeTab === "generate" ? "white" : "black" }}
                >
                    Generator Engine
                </button>
                <button 
                    onClick={() => setActiveTab("view")}
                    style={{ padding: "10px", cursor: "pointer", background: activeTab === "view" ? "black" : "white", color: activeTab === "view" ? "white" : "black" }}
                >
                    View Timetable
                </button>
            </div>
        </nav>
    );
};

export default Navbar;