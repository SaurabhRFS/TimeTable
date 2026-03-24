import React from 'react';
import { BookOpen, Users, Briefcase, Calendar, CheckCircle } from 'lucide-react';

// CRITICAL: You must catch { setActiveTab } right here on this line!
const QuickStartGuide = ({ setActiveTab }) => {
    
    const steps = [
        {
            id: 1,
            title: "1. Setup Subjects & Teachers",
            description: "Start by adding all your class data. Go to the Subjects tab to create Theory, Labs, and Activities. Then, go to the Teachers tab to add your faculty.",
            icon: BookOpen,
            color: "text-blue-600",
            bg: "bg-blue-100",
            tab: "subjects" // This matches the activeTab state in App.jsx
        },
        {
            id: 2,
            title: "2. Assign the Workload",
            description: "Once your data is in, head to the Workload tab. Select a semester and assign your teachers to their specific subjects and lab batches.",
            icon: Briefcase,
            color: "text-purple-600",
            bg: "bg-purple-100",
            tab: "workload"
        },
        {
            id: 3,
            title: "3. Configure Terms & Pin Labs",
            description: "Go to the Interactive Timetable. Turn ON the semesters you want to build (Odd/Even). Manually pin fixed blocks like 2-hour labs or special activities to the grid first.",
            icon: Calendar,
            color: "text-orange-600",
            bg: "bg-orange-100",
            tab: "view"
        },
        {
            id: 4,
            title: "4. Auto-Generate & Edit",
            description: "Click 'Auto-Fill All Active'. The algorithm will perfectly slot the remaining theory classes. Spot a change? You can easily delete a class and manually re-pin it!",
            icon: CheckCircle,
            color: "text-emerald-600",
            bg: "bg-emerald-100",
            tab: "view"
        }
    ];

    return (
        <div className="max-w-4xl mx-auto font-sans pb-12 animate-fade-in-up">
            
            <div className="bg-white/60 backdrop-blur-md p-8 rounded-2xl shadow-sm border border-white/50 mb-10 text-center">
                <h2 className="text-3xl font-black text-slate-800 mb-2">Welcome to the Scheduler</h2>
                <p className="text-slate-600 font-medium text-lg">Follow these 4 simple steps to generate a clash-free college timetable.</p>
            </div>

            <div className="relative">
                {/* Vertical Line */}
                <div className="absolute left-[39px] top-8 bottom-8 w-1 bg-slate-200/60 rounded-full hidden md:block z-0"></div>

                <div className="space-y-6 relative z-10">
                    {steps.map((step) => {
                        const Icon = step.icon;
                        return (
                            <div key={step.id} className="flex flex-col md:flex-row gap-6 items-start group">
                                <div className={`flex-shrink-0 w-20 h-20 rounded-2xl flex items-center justify-center border-4 border-white shadow-sm transition-transform group-hover:scale-105 ${step.bg}`}>
                                    <Icon size={32} className={step.color} />
                                </div>

                                <div className="flex-1 w-full bg-white/60 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-white/50 transition-all hover:bg-white/80 hover:shadow-md">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-3">
                                        <h3 className={`text-xl font-black ${step.color}`}>{step.title}</h3>
                                        
                                        {/* The button that triggers the page switch */}
                                        <button 
                                            onClick={() => setActiveTab(step.tab)}
                                            className="px-4 py-1.5 bg-white text-sm font-bold rounded-lg shadow-sm border border-slate-200 text-slate-700 hover:text-white hover:bg-slate-800 transition-colors w-full sm:w-auto text-center"
                                        >
                                            Go to Step →
                                        </button>
                                    </div>
                                    <p className="text-slate-700 font-medium leading-relaxed">{step.description}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default QuickStartGuide;