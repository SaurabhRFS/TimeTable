import { useEffect, useState } from "react";
import { getAllTeachers, addTeacher, updateTeacher, deleteTeacher } from "../services/teacherService";

const TeacherDashboard = () => {
    const [teachers, setTeachers] = useState([]);
    const [formData, setFormData] = useState({ name: "", department: "", alias: "" });
    const [editingId, setEditingId] = useState(null);
    const [statusMsg, setStatusMsg] = useState({ text: "", type: "" });

    useEffect(() => {
        loadTeachers();
    }, []);

    const loadTeachers = async () => {
        try {
            const data = await getAllTeachers();
            setTeachers(data);
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
            if (editingId) {
                await updateTeacher(editingId, formData);
                showMessage("Teacher updated successfully!", "success");
            } else {
                await addTeacher(formData);
                showMessage("Teacher added successfully!", "success");
            }
            setFormData({ name: "", department: "", alias: "" });
            setEditingId(null);
            loadTeachers();
        } catch (error) {
            showMessage("Action failed. Please try again.", "error");
        }
    };

    const handleEditClick = (teacher) => {
        setFormData({ name: teacher.name, department: teacher.department, alias: teacher.alias });
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
        setFormData({ name: "", department: "", alias: "" });
        setEditingId(null);
    };

    return (
        <div className="p-6 max-w-5xl mx-auto font-sans">
            <div className="flex justify-between items-center mb-6 border-b-2 border-slate-800 pb-3">
                <h2 className="text-2xl font-bold text-slate-800">
                    Manage Teachers
                </h2>
            </div>

            {/* Notification Banner */}
            {statusMsg.text && (
                <div className={`p-3 mb-4 rounded text-white font-semibold transition-all shadow-sm ${statusMsg.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}>
                    {statusMsg.text}
                </div>
            )}

            {/* Form Section */}
            <div className="bg-white shadow-md rounded-lg p-6 mb-8 border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
                    {editingId ? (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit Teacher
                        </>
                    ) : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                            Add New Teacher
                        </>
                    )}
                </h3>
                <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
                    <input 
                        className="flex-1 border border-slate-300 p-2.5 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                        name="name" placeholder="Name (e.g. Mrs. Ghawade)" 
                        value={formData.name} onChange={handleInputChange} required 
                    />
                    <input 
                        className="flex-1 border border-slate-300 p-2.5 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                        name="department" placeholder="Dept (e.g. CT)" 
                        value={formData.department} onChange={handleInputChange} required 
                    />
                    <input 
                        className="w-full md:w-32 border border-slate-300 p-2.5 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
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

            {/* Table Section */}
            <div className="bg-white shadow-md rounded-lg overflow-hidden border border-slate-200">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm uppercase tracking-wider">
                        <tr>
                            <th className="p-4 font-semibold">ID</th>
                            <th className="p-4 font-semibold">Name</th>
                            <th className="p-4 font-semibold">Department</th>
                            <th className="p-4 font-semibold">Alias</th>
                            <th className="p-4 font-semibold text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {teachers.map((t) => (
                            <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-4 text-slate-500">{t.id}</td>
                                <td className="p-4 text-slate-800 font-medium">{t.name}</td>
                                <td className="p-4 text-slate-600">
                                    <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-bold border border-slate-200">
                                        {t.department}
                                    </span>
                                </td>
                                <td className="p-4 text-slate-600 font-bold">{t.alias}</td>
                                <td className="p-4 flex justify-center gap-3">
                                    <button 
                                        onClick={() => handleEditClick(t)} 
                                        title="Edit Teacher"
                                        className="p-2 text-blue-600 hover:bg-blue-100 hover:text-blue-800 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteClick(t.id)} 
                                        title="Delete Teacher"
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
                        <p>No teachers found. Add your first teacher above.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeacherDashboard;