import { useState } from "react";
import Navbar from "./components/Navbar";
import TeacherDashboard from "./components/TeacherDashboard";
import SubjectDashboard from "./components/SubjectDashboard";
import WorkloadDashboard from "./components/WorkloadDashboard";
import TimetableView from "./components/TimetableView";
import AnimatedBackground from "./components/AnimatedBackground"; 

function App() {
  const [activeTab, setActiveTab] = useState("subjects"); 

  return (
    <div className="relative min-h-screen font-sans overflow-hidden">
      
      <AnimatedBackground /> 
      
      <div className="relative z-10 min-h-screen overflow-y-auto">
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        {/* Added pt-32 (padding-top) to push the content down below the floating navbar */}
        <main className="p-6 pt-32 max-w-7xl mx-auto">
          {activeTab === "subjects" && <SubjectDashboard />}
          {activeTab === "teachers" && <TeacherDashboard />}
          {activeTab === "workload" && <WorkloadDashboard />}
          {activeTab === "view" && <TimetableView />}
        </main>
      </div>

    </div>
  );
}

export default App;