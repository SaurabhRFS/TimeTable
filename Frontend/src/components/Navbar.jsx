const Navbar = ({ activeTab, setActiveTab }) => {
    return (
        <nav style={{ 
            borderBottom: "2px solid #ddd", 
            padding: "15px", 
            marginBottom: "20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#f8f9fa"
        }}>
            {/* Logo / Title */}
            <h2 style={{ margin: 0 }}>CLASS ROOM Scheduler</h2>
            
            {/* Navigation Buttons */}
            <div style={{ display: "flex", gap: "10px" }}>
                <button 
                    onClick={() => setActiveTab("teachers")}
                    style={{
                        padding: "10px 20px",
                        cursor: "pointer",
                        fontWeight: "bold",
                        // Simple logic: If active, make it Black. If not, make it White.
                        backgroundColor: activeTab === "teachers" ? "black" : "white",
                        color: activeTab === "teachers" ? "white" : "black",
                        border: "1px solid black"
                    }}
                >
                    Manage Teachers
                </button>
                
                <button 
                    onClick={() => setActiveTab("workload")}
                    style={{
                        padding: "10px 20px",
                        cursor: "pointer",
                        fontWeight: "bold",
                        backgroundColor: activeTab === "workload" ? "black" : "white",
                        color: activeTab === "workload" ? "white" : "black",
                        border: "1px solid black"
                    }}
                >
                    Workload Allocation
                </button>
            </div>
        </nav>
    );
};

export default Navbar;