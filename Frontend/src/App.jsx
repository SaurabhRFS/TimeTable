import { useState } from "react";
import Navbar from "./components/Navbar";
import TeacherDashboard from "./components/TeacherDashboard";
import WorkloadDashboard from "./components/WorkloadDashboard";
import GeneratorDashboard from "./components/GeneratorDashboard";
import TimetableView from "./components/TimetableView"; // <-- Add this

function App() {
  const [activeTab, setActiveTab] = useState("view"); 

  return (
    <div style={{ fontFamily: "Arial, sans-serif" }}>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main style={{ padding: "20px" }}>
        {activeTab === "teachers" && <TeacherDashboard />}
        {activeTab === "workload" && <WorkloadDashboard />}
        {activeTab === "generate" && <GeneratorDashboard />}
        {activeTab === "view" && <TimetableView />} {/* <-- Add this */}
      </main>
    </div>
  );
}

export default App;