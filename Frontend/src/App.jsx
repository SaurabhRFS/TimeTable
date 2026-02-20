import { useState } from "react";
import Navbar from "./components/Navbar";
import TeacherDashboard from "./components/TeacherDashboard";
import SubjectDashboard from "./components/SubjectDashboard";
import WorkloadDashboard from "./components/WorkloadDashboard";
import TimetableView from "./components/TimetableView"; // This is now our master screen

function App() {
  const [activeTab, setActiveTab] = useState("subjects"); 

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="p-6">
        {activeTab === "subjects" && <SubjectDashboard />}
        {activeTab === "teachers" && <TeacherDashboard />}
        {activeTab === "workload" && <WorkloadDashboard />}
        {activeTab === "view" && <TimetableView />} {/* The Ultimate Interactive Grid */}
      </main>
    </div>
  );
}

export default App;