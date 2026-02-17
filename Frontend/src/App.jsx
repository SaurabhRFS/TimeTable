import { useState } from "react";
import Navbar from "./components/Navbar";
import TeacherDashboard from "./components/TeacherDashboard";
import WorkloadDashboard from "./components/WorkloadDashboard";

function App() {
  // State: Tracks which screen is currently visible
  const [activeTab, setActiveTab] = useState("teachers");

  return (
    <div style={{ fontFamily: "Arial, sans-serif" }}>
      
      {/* 1. The Navigation Module */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* 2. The Main Content Module */}
      <main style={{ padding: "20px" }}>
        {activeTab === "teachers" ? <TeacherDashboard /> : <WorkloadDashboard />}
      </main>

    </div>
  );
}

export default App;