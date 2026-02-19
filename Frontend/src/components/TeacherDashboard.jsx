import { useEffect, useState } from "react";
import { getAllTeachers, addTeacher, updateTeacher, deleteTeacher } from "../services/teacherService";

const TeacherDashboard = () => {
    const [teachers, setTeachers] = useState([]);
    const [formData, setFormData] = useState({ name: "", department: "", alias: "" });
    const [editingId, setEditingId] = useState(null);
    const [statusMsg, setStatusMsg] = useState({ text: "", type: "" }); // Replaces annoying alerts

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
        setTimeout(() => setStatusMsg({ text: "", type: "" }), 3000); // Auto-hide after 3 seconds
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
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b-2 border-blue-500 pb-2">
                Manage Teachers
            </h2>

            {/* Notification Banner */}
            {statusMsg.text && (
                <div className={`p-3 mb-4 rounded text-white font-semibold transition-all ${statusMsg.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
                    {statusMsg.text}
                </div>
            )}

            {/* Form Section */}
            <div className="bg-white shadow-lg rounded-lg p-6 mb-8 border-t-4 border-blue-600">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                    {editingId ? "Edit Teacher" : "Add New Teacher"}
                </h3>
                <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
                    <input 
                        className="flex-1 border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                        name="name" placeholder="Name (e.g. Mrs. Ghawade)" 
                        value={formData.name} onChange={handleInputChange} required 
                    />
                    <input 
                        className="flex-1 border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                        name="department" placeholder="Dept (e.g. CT)" 
                        value={formData.department} onChange={handleInputChange} required 
                    />
                    <input 
                        className="w-full md:w-32 border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                        name="alias" placeholder="Alias (e.g. KG)" 
                        value={formData.alias} onChange={handleInputChange} required 
                    />
                    
                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded transition-colors">
                        {editingId ? "Update" : "Add"}
                    </button>
                    
                    {editingId && (
                        <button type="button" onClick={cancelEdit} className="bg-gray-400 hover:bg-gray-500 text-white font-semibold px-4 py-2 rounded transition-colors">
                            Cancel
                        </button>
                    )}
                </form>
            </div>

            {/* Table Section */}
            <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-100 border-b-2 border-gray-300 text-gray-700">
                        <tr>
                            <th className="p-4">ID</th>
                            <th className="p-4">Name</th>
                            <th className="p-4">Department</th>
                            <th className="p-4">Alias</th>
                            <th className="p-4 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {teachers.map((t) => (
                            <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4 font-medium text-gray-600">{t.id}</td>
                                <td className="p-4 text-gray-800">{t.name}</td>
                                <td className="p-4 text-gray-600">{t.department}</td>
                                <td className="p-4 text-gray-600 font-bold">{t.alias}</td>
                                <td className="p-4 flex justify-center gap-2">
                                    <button 
                                        onClick={() => handleEditClick(t)} 
                                        className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded text-sm font-semibold transition-colors">
                                        Edit
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteClick(t.id)} 
                                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm font-semibold transition-colors">
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {teachers.length === 0 && (
                    <div className="p-6 text-center text-gray-500 italic">No teachers found. Add one above.</div>
                )}
            </div>
        </div>
    );
};

export default TeacherDashboard;