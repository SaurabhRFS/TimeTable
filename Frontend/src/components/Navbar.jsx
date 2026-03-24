import React, { useState, useEffect } from 'react';
import {
  Menu, X, Sun, Moon, Sunset,
  BookOpen, Users, Briefcase, Calendar, HelpCircle, Building2
} from 'lucide-react';

const Navbar = ({ activeTab, setActiveTab, activeDept, setActiveDept }) => {
  const [greeting, setGreeting] = useState({ text: 'Hello', theme: 'morning', icon: null });
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const branches = [
      { code: 'CT', name: 'Computer Tech' },
      { code: 'CE', name: 'Civil Engineering' },
      { code: 'ME', name: 'Mechanical Eng' },
      { code: 'EE', name: 'Electrical Eng' },
      { code: 'IT', name: 'Information Tech' }
  ];

  const menuItems = [
    { id: 'guide', label: 'How to Use', icon: HelpCircle, color: 'text-pink-600', bg: 'bg-pink-100' },
    { id: 'subjects', label: 'Manage Subjects', icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-100' },
    { id: 'teachers', label: 'Manage Teachers', icon: Users, color: 'text-purple-600', bg: 'bg-purple-100' },
    { id: 'workload', label: 'Assign Workload', icon: Briefcase, color: 'text-orange-600', bg: 'bg-orange-100' },
    { id: 'view', label: 'Interactive Timetable', icon: Calendar, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  ];

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting({ text: 'Good Morning', theme: 'morning', icon: <Sun className="text-amber-500 drop-shadow-sm" size={20} /> });
    } else if (hour >= 12 && hour < 17) {
      setGreeting({ text: 'Good Afternoon', theme: 'afternoon', icon: <Sun className="text-orange-500 drop-shadow-sm" size={20} /> });
    } else if (hour >= 17 && hour < 21) {
      setGreeting({ text: 'Good Evening', theme: 'evening', icon: <Sunset className="text-rose-500 drop-shadow-sm" size={20} /> });
    } else {
      setGreeting({ text: 'Good Night', theme: 'night', icon: <Moon className="text-indigo-500 drop-shadow-sm" size={20} fill="currentColor" /> });
    }
  }, []);

  const getGreetingStyle = () => {
    switch (greeting.theme) {
      case 'morning': return "text-amber-700";
      case 'evening': return "text-orange-700";
      case 'night': return "text-indigo-800";
      default: return "text-slate-800";
    }
  };

  const handleMenuClick = (id) => {
    setActiveTab(id);
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* DESKTOP NAVBAR */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-50 hidden md:block">
        <div className="relative rounded-full border border-white/40 bg-white/40 backdrop-blur-2xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.5),0_8px_20px_rgba(0,0,0,0.05)] px-8 py-3 flex items-center justify-between transition-all hover:bg-white/50">
          <div className="absolute inset-x-4 top-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent opacity-50 rounded-t-full pointer-events-none" />

          <div className="flex flex-col leading-none select-none z-10 text-left">
            <span className="text-[10px] font-extrabold text-slate-500 tracking-[0.25em] uppercase pl-0.5">TimeTable</span>
            <span className="text-xl font-black text-slate-800 tracking-tighter drop-shadow-sm">SCHEDULER</span>
          </div>

          <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center justify-center leading-none z-10">
            <div className="flex items-center gap-2 mb-1">
              {greeting.icon}
              <span className={`text-[11px] font-extrabold tracking-widest uppercase text-slate-700`}>{greeting.text}</span>
            </div>
            
            <div className="flex items-center gap-2 bg-white/60 border border-white shadow-sm rounded-full px-3 py-1 mt-0.5 hover:bg-white/80 transition-colors cursor-pointer">
                <Building2 size={14} className="text-emerald-600" />
                <select 
                    value={activeDept}
                    onChange={(e) => setActiveDept(e.target.value)}
                    className="bg-transparent font-black text-slate-800 text-sm outline-none cursor-pointer appearance-none text-center"
                >
                    {branches.map(b => (
                        <option key={b.code} value={b.code}>{b.name} ({b.code})</option>
                    ))}
                </select>
                <span className="text-xs text-slate-500 pointer-events-none">▼</span>
            </div>
          </div>

          <div className="flex items-center gap-3 z-10">
            <button 
                onClick={() => setIsMenuOpen(true)} 
                className="p-3 rounded-full border border-white/40 bg-white/50 text-slate-800 hover:bg-white/80 active:scale-95 transition-all shadow-sm flex items-center justify-center"
            >
              <Menu size={22} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE NAVBAR */}
      <nav className="md:hidden fixed top-4 left-1/2 -translate-x-1/2 w-[92%] z-50">
        <div className="rounded-2xl border border-white/40 bg-white/40 backdrop-blur-2xl shadow-lg px-5 py-3 flex justify-between items-center relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />
          
          <div className="flex flex-col leading-none z-10 text-left w-1/3">
            <span className="text-[9px] font-bold text-slate-500 tracking-[0.2em] uppercase">TimeTable</span>
            <span className="text-lg font-black text-slate-800 tracking-tighter">SCHEDULER</span>
          </div>

          <div className="z-10 w-1/3 flex justify-center">
             <select 
                value={activeDept}
                onChange={(e) => setActiveDept(e.target.value)}
                className="bg-white/70 border border-white/50 shadow-sm rounded-lg font-black text-slate-800 text-xs py-1.5 px-2 outline-none w-full max-w-[100px]"
            >
                {branches.map(b => <option key={b.code} value={b.code}>{b.code}</option>)}
            </select>
          </div>

          <div className="flex items-center justify-end w-1/3 z-10">
            <button onClick={() => setIsMenuOpen(true)} className="p-2 bg-white/50 rounded-full border border-white/40 text-slate-800 active:scale-95 transition-all">
              <Menu size={20} />
            </button>
          </div>
        </div>
      </nav>

      <button
        type="button"
        className={`fixed inset-0 z-[60] bg-slate-900/10 backdrop-blur-[4px] transition-opacity duration-200 w-full h-full border-none cursor-default ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsMenuOpen(false)}
        tabIndex="-1"
        aria-label="Close Menu"
      />

      <div className={`fixed top-0 left-0 h-full z-[70] w-[85%] md:w-[400px] bg-white/40 backdrop-blur-3xl border-r border-white/50 shadow-2xl transition-transform duration-200 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-transparent pointer-events-none" />
        <div className="relative z-10 h-full flex flex-col p-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-black text-slate-900 leading-tight">Menu</h2>
              <span className="text-xs font-bold text-slate-500 tracking-wider uppercase mt-1 block">Navigation</span>
            </div>
            <button onClick={() => setIsMenuOpen(false)} className="p-2 bg-white/50 border border-white/50 rounded-full text-slate-600 hover:bg-white hover:text-red-500 transition-all shadow-sm">
              <X size={24} />
            </button>
          </div>

          <div className="space-y-4 mb-8">
            {menuItems.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;
              return (
                <button
                    key={item.id}
                    onClick={() => handleMenuClick(item.id)}
                    className={`w-full p-4 rounded-2xl border transition-all duration-300 flex items-center gap-4 group outline-none ${
                        isActive ? 'bg-white/80 border-slate-300 transform scale-[1.02] shadow-md ring-1 ring-slate-200' : 'bg-white/40 border-white/60 hover:bg-white/70 hover:scale-[1.01] hover:shadow-sm'
                    }`}
                >
                    <div className={`p-3 rounded-xl shadow-sm transition-transform group-hover:scale-105 ${item.bg}`}>
                        <Icon size={24} className={item.color} />
                    </div>
                    <div className="flex flex-col items-start">
                        <span className="font-black text-lg tracking-tight text-slate-800 group-hover:text-slate-900">{item.label}</span>
                    </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;





// import React, { useState, useEffect } from 'react';
// import {
//   Menu, X, Sun, Moon, Sunset,
//   BookOpen, Users, Briefcase, Calendar, HelpCircle, Building2
// } from 'lucide-react';

// // NEW: Accept activeDept and setActiveDept as props
// const Navbar = ({ activeTab, setActiveTab, activeDept, setActiveDept }) => {
//   const [greeting, setGreeting] = useState({ text: 'Hello', theme: 'morning', icon: null });
//   const [isMenuOpen, setIsMenuOpen] = useState(false);

//   // Define the available college branches
//   const branches = [
//       { code: 'CT', name: 'Computer Tech' },
//       { code: 'CE', name: 'Civil Engineering' },
//       { code: 'ME', name: 'Mechanical Eng' },
//       { code: 'EE', name: 'Electrical Eng' },
//       { code: 'IT', name: 'Information Tech' }
//   ];

//   const menuItems = [
//     { id: 'subjects', label: 'Manage Subjects', icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-100' },
//     { id: 'teachers', label: 'Manage Teachers', icon: Users, color: 'text-purple-600', bg: 'bg-purple-100' },
//     { id: 'workload', label: 'Assign Workload', icon: Briefcase, color: 'text-orange-600', bg: 'bg-orange-100' },
//     { id: 'view', label: 'Interactive Timetable', icon: Calendar, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    
//   ];

//   useEffect(() => {
//     const hour = new Date().getHours();
//     if (hour >= 5 && hour < 12) {
//       setGreeting({ text: 'Good Morning', theme: 'morning', icon: <Sun className="text-amber-500 drop-shadow-sm" size={20} /> });
//     } else if (hour >= 12 && hour < 17) {
//       setGreeting({ text: 'Good Afternoon', theme: 'afternoon', icon: <Sun className="text-orange-500 drop-shadow-sm" size={20} /> });
//     } else if (hour >= 17 && hour < 21) {
//       setGreeting({ text: 'Good Evening', theme: 'evening', icon: <Sunset className="text-rose-500 drop-shadow-sm" size={20} /> });
//     } else {
//       setGreeting({ text: 'Good Night', theme: 'night', icon: <Moon className="text-indigo-500 drop-shadow-sm" size={20} fill="currentColor" /> });
//     }
//   }, []);

//   return (
//     <>
//       {/* DESKTOP NAVBAR */}
//       <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-50 hidden md:block">
//         <div className="relative rounded-full border border-white/40 bg-white/40 backdrop-blur-2xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.5),0_8px_20px_rgba(0,0,0,0.05)] px-8 py-3 flex items-center justify-between transition-all hover:bg-white/50">
//           <div className="absolute inset-x-4 top-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent opacity-50 rounded-t-full pointer-events-none" />

//           {/* Left Side: Logo */}
//           <div className="flex flex-col leading-none select-none z-10 text-left">
//             <span className="text-[10px] font-extrabold text-slate-500 tracking-[0.25em] uppercase pl-0.5">TimeTable</span>
//             <span className="text-xl font-black text-slate-800 tracking-tighter drop-shadow-sm">SCHEDULER</span>
//           </div>

//           {/* Center: Greeting & BRANCH SWITCHER */}
//           <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center justify-center leading-none z-10">
//             <div className="flex items-center gap-2 mb-1">
//               {greeting.icon}
//               <span className={`text-[11px] font-extrabold tracking-widest uppercase text-slate-700`}>{greeting.text}</span>
//             </div>
            
//             {/* THE GLOBAL SWITCHER DROPDOWN */}
//             <div className="flex items-center gap-2 bg-white/60 border border-white shadow-sm rounded-full px-3 py-1 mt-0.5 hover:bg-white/80 transition-colors cursor-pointer">
//                 <Building2 size={14} className="text-emerald-600" />
//                 <select 
//                     value={activeDept}
//                     onChange={(e) => setActiveDept(e.target.value)}
//                     className="bg-transparent font-black text-slate-800 text-sm outline-none cursor-pointer appearance-none text-center"
//                 >
//                     {branches.map(b => (
//                         <option key={b.code} value={b.code}>{b.name} ({b.code})</option>
//                     ))}
//                 </select>
//                 <span className="text-xs text-slate-500 pointer-events-none">▼</span>
//             </div>
//           </div>

//           {/* Right Side: Menu */}
//           <div className="flex items-center gap-3 z-10">
//             <button 
//                 onClick={() => setIsMenuOpen(true)} 
//                 className="p-3 rounded-full border border-white/40 bg-white/50 text-slate-800 hover:bg-white/80 active:scale-95 transition-all shadow-sm flex items-center justify-center"
//             >
//               <Menu size={22} strokeWidth={2.5} />
//             </button>
//           </div>
//         </div>
//       </nav>

//       {/* MOBILE NAVBAR */}
//       <nav className="md:hidden fixed top-4 left-1/2 -translate-x-1/2 w-[92%] z-50">
//         <div className="rounded-2xl border border-white/40 bg-white/40 backdrop-blur-2xl shadow-lg px-5 py-3 flex justify-between items-center relative overflow-hidden">
//           <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />
          
//           <div className="flex flex-col leading-none z-10 text-left w-1/3">
//             <span className="text-[9px] font-bold text-slate-500 tracking-[0.2em] uppercase">TimeTable</span>
//             <span className="text-lg font-black text-slate-800 tracking-tighter">SCHEDULER</span>
//           </div>

//           {/* Mobile Switcher */}
//           <div className="z-10 w-1/3 flex justify-center">
//              <select 
//                 value={activeDept}
//                 onChange={(e) => setActiveDept(e.target.value)}
//                 className="bg-white/70 border border-white/50 shadow-sm rounded-lg font-black text-slate-800 text-xs py-1.5 px-2 outline-none w-full max-w-[100px]"
//             >
//                 {branches.map(b => <option key={b.code} value={b.code}>{b.code}</option>)}
//             </select>
//           </div>

//           <div className="flex items-center justify-end w-1/3 z-10">
//             <button onClick={() => setIsMenuOpen(true)} className="p-2 bg-white/50 rounded-full border border-white/40 text-slate-800 active:scale-95 transition-all">
//               <Menu size={20} />
//             </button>
//           </div>
//         </div>
//       </nav>

//       {/* Slide-in Drawer Logic (Remains identical to your current drawer) */}
//       <button
//         type="button"
//         className={`fixed inset-0 z-[60] bg-slate-900/10 backdrop-blur-[4px] transition-opacity duration-200 w-full h-full border-none cursor-default ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
//         onClick={() => setIsMenuOpen(false)}
//       />

//       <div className={`fixed top-0 left-0 h-full z-[70] w-[85%] md:w-[400px] bg-white/40 backdrop-blur-3xl border-r border-white/50 shadow-2xl transition-transform duration-200 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
//         <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-transparent pointer-events-none" />
//         <div className="relative z-10 h-full flex flex-col p-6 overflow-y-auto">
//           <div className="flex justify-between items-center mb-8">
//             <div>
//               <h2 className="text-3xl font-black text-slate-900 leading-tight">Menu</h2>
//               <span className="text-xs font-bold text-slate-500 tracking-wider uppercase mt-1 block">Navigation</span>
//             </div>
//             <button onClick={() => setIsMenuOpen(false)} className="p-2 bg-white/50 border border-white/50 rounded-full text-slate-600 hover:bg-white hover:text-red-500 transition-all shadow-sm">
//               <X size={24} />
//             </button>
//           </div>

//           <div className="space-y-4 mb-8">
//             {menuItems.map((item) => {
//               const isActive = activeTab === item.id;
//               const Icon = item.icon;
//               return (
//                 <button
//                     key={item.id}
//                     onClick={() => handleMenuClick(item.id)}
//                     className={`w-full p-4 rounded-2xl border transition-all duration-300 flex items-center gap-4 group outline-none ${
//                         isActive ? 'bg-white/80 border-slate-300 transform scale-[1.02] shadow-md ring-1 ring-slate-200' : 'bg-white/40 border-white/60 hover:bg-white/70 hover:scale-[1.01] hover:shadow-sm'
//                     }`}
//                 >
//                     <div className={`p-3 rounded-xl shadow-sm transition-transform group-hover:scale-105 ${item.bg}`}>
//                         <Icon size={24} className={item.color} />
//                     </div>
//                     <div className="flex flex-col items-start">
//                         <span className="font-black text-lg tracking-tight text-slate-800 group-hover:text-slate-900">{item.label}</span>
//                     </div>
//                 </button>
//               );
//             })}
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default Navbar;