import { useEffect, useState } from "react";
import { getAllTeachers, addTeacher, updateTeacher, deleteTeacher } from "../services/teacherService";

// CRITICAL: Catching activeDept here
const TeacherDashboard = ({ activeDept }) => { 
    const [teachers, setTeachers] = useState([]);
    const [formData, setFormData] = useState({ name: "", department: activeDept, alias: "" });
    const [editingId, setEditingId] = useState(null);
    const [statusMsg, setStatusMsg] = useState({ text: "", type: "" });

    // Reloads and filters whenever you switch the branch!
    useEffect(() => {
        loadTeachers();
        setFormData(prev => ({ ...prev, department: activeDept }));
    }, [activeDept]);

    const loadTeachers = async () => {
        try {
            const data = await getAllTeachers();
            // Filter to only show teachers for the selected branch!
            const filteredTeachers = data.filter(t => t.department.toUpperCase() === activeDept.toUpperCase());
            setTeachers(filteredTeachers);
        } catch (error) {
            showMessage("Failed to load teachers.", "error");
        }
    };

    const showMessage = (text, type) => {
        setStatusMsg({ text, type });
        setTimeout(() => setStatusMsg({ text: "", type: "" }), 3000);
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Force the department to match the active Navbar branch
            const submissionData = { ...formData, department: activeDept };

            if (editingId) {
                await updateTeacher(editingId, submissionData);
                showMessage("Teacher updated successfully!", "success");
            } else {
                await addTeacher(submissionData);
                showMessage("Teacher added successfully!", "success");
            }
            setFormData({ name: "", department: activeDept, alias: "" });
            setEditingId(null);
            loadTeachers();
        } catch (error) {
            showMessage("Action failed. Please try again.", "error");
        }
    };

    const handleEditClick = (teacher) => {
        setFormData({ name: teacher.name, department: activeDept, alias: teacher.alias });
        setEditingId(teacher.id);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDeleteClick = async (id) => {
        if (window.confirm("Are you sure you want to delete this teacher?")) {
            try {
                await deleteTeacher(id);
                showMessage("Teacher deleted.", "success");
                loadTeachers();
            } catch (error) {
                showMessage("Failed to delete teacher.", "error");
            }
        }
    };

    const cancelEdit = () => {
        setFormData({ name: "", department: activeDept, alias: "" });
        setEditingId(null);
    };

    return (
        <div className="p-6 max-w-5xl mx-auto font-sans animate-fade-in-up">
            <div className="flex justify-between items-center mb-6 border-b-2 border-slate-800 pb-3">
                <h2 className="text-2xl font-bold text-slate-800">
                    Manage Teachers
                </h2>
                <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-500">Active Branch:</span>
                    <span className="bg-slate-800 text-white px-3 py-1 rounded font-black tracking-wide shadow-sm">
                        {activeDept}
                    </span>
                </div>
            </div>

            {statusMsg.text && (
                <div className={`p-3 mb-4 rounded text-white font-semibold transition-all shadow-sm ${statusMsg.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}>
                    {statusMsg.text}
                </div>
            )}

            <div className="bg-white/80 backdrop-blur-sm shadow-md rounded-lg p-6 mb-8 border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
                    {editingId ? "✏️ Edit Teacher" : `➕ Add New Teacher to ${activeDept}`}
                </h3>
                <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
                    <input 
                        className="flex-1 border border-slate-300 p-2.5 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow bg-white"
                        name="name" placeholder="Name (e.g. Mrs. Ghawade)" 
                        value={formData.name} onChange={handleInputChange} required 
                    />
                    
                    {/* The department input is hidden because it's managed globally now! */}
                    <input 
                        type="hidden"
                        name="department" 
                        value={activeDept} 
                    />

                    <input 
                        className="w-full md:w-48 border border-slate-300 p-2.5 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow bg-white"
                        name="alias" placeholder="Alias (e.g. KG)" 
                        value={formData.alias} onChange={handleInputChange} required 
                    />
                    
                    <button type="submit" className="bg-slate-800 hover:bg-slate-900 text-white font-semibold px-6 py-2.5 rounded transition-colors shadow-sm">
                        {editingId ? "Update" : "Add"}
                    </button>
                    
                    {editingId && (
                        <button type="button" onClick={cancelEdit} className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold px-4 py-2.5 rounded transition-colors">
                            Cancel
                        </button>
                    )}
                </form>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden border border-slate-200">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm uppercase tracking-wider">
                        <tr>
                            <th className="p-4 font-semibold w-16 text-center">ID</th>
                            <th className="p-4 font-semibold">Name</th>
                            <th className="p-4 font-semibold">Alias</th>
                            <th className="p-4 font-semibold text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {teachers.map((t) => (
                            <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-4 text-slate-500 font-mono text-center">{t.id}</td>
                                <td className="p-4 text-slate-800 font-bold text-lg">{t.name}</td>
                                <td className="p-4 text-slate-600 font-bold">
                                    <span className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full text-sm border border-slate-200">
                                        {t.alias}
                                    </span>
                                </td>
                                <td className="p-4 flex justify-center gap-3">
                                    <button 
                                        onClick={() => handleEditClick(t)} 
                                        className="p-2 text-blue-600 hover:bg-blue-100 hover:text-blue-800 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteClick(t.id)} 
                                        className="p-2 text-red-500 hover:bg-red-100 hover:text-red-700 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {teachers.length === 0 && (
                    <div className="p-8 text-center text-slate-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <p className="font-bold">No teachers found for {activeDept}. Add your first teacher above.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeacherDashboard;