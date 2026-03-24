import { useState } from "react";
import Navbar from "./components/Navbar";
import QuickStartGuide from "./components/QuickStartGuide";
import TeacherDashboard from "./components/TeacherDashboard";
import SubjectDashboard from "./components/SubjectDashboard";
import WorkloadDashboard from "./components/WorkloadDashboard";
import TimetableView from "./components/TimetableView";
import AnimatedBackground from "./components/AnimatedBackground"; 

function App() {
  const [activeTab, setActiveTab] = useState("guide"); 
  const [activeDept, setActiveDept] = useState("CT"); 

  return (
    <div className="relative min-h-screen font-sans overflow-hidden">
      
      <AnimatedBackground /> 
      
      <div className="relative z-10 min-h-screen overflow-y-auto">
        <Navbar 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            activeDept={activeDept} 
            setActiveDept={setActiveDept} 
        />
        
        <main className="p-6 pt-32 max-w-7xl mx-auto">
          {activeTab === "guide" && <QuickStartGuide setActiveTab={setActiveTab} />}
          
          {activeTab === "subjects" && <SubjectDashboard activeDept={activeDept} />}
          {activeTab === "teachers" && <TeacherDashboard activeDept={activeDept} />}
          {activeTab === "workload" && <WorkloadDashboard activeDept={activeDept} />}
          {activeTab === "view" && <TimetableView activeDept={activeDept} />}
        </main>
      </div>

    </div>
  );
}

export default App;