const Navbar = ({ activeTab, setActiveTab }) => {
    return (
        <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm">
            <h2 className="m-0 text-slate-800 font-black text-xl tracking-tight">Smart Scheduler</h2>
            
            <div className="flex gap-3">
                <button 
                    onClick={() => setActiveTab("subjects")}
                    className={`px-4 py-2 rounded-md font-bold transition-colors ${activeTab === "subjects" ? "bg-slate-800 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                >
                    Subjects
                </button>
                <button 
                    onClick={() => setActiveTab("teachers")}
                    className={`px-4 py-2 rounded-md font-bold transition-colors ${activeTab === "teachers" ? "bg-slate-800 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                >
                    Teachers
                </button>
                <button 
                    onClick={() => setActiveTab("workload")}
                    className={`px-4 py-2 rounded-md font-bold transition-colors ${activeTab === "workload" ? "bg-slate-800 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                >
                    Workload
                </button>
                {/* The new Unified Timetable Button */}
                <button 
                    onClick={() => setActiveTab("view")}
                    className={`px-4 py-2 rounded-md font-bold transition-colors ${activeTab === "view" ? "bg-emerald-600 text-white shadow-sm" : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"}`}
                >
                    Interactive Timetable
                </button>
            </div>
        </nav>
    );
};

export default Navbar;