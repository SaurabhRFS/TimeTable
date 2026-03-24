import { useEffect, useState } from "react";
import { getSubjectsBySem, addSubject, updateSubject, deleteSubject } from "../services/subjectService";

// CRITICAL: Catching activeDept here
const SubjectDashboard = ({ activeDept }) => { 
    const [subjects, setSubjects] = useState([]);
    const [filterSem, setFilterSem] = useState(6);
    const [statusMsg, setStatusMsg] = useState({ text: "", type: "" });
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
        name: "", code: "", alias: "", 
        department: activeDept, // Auto-sets to the selected branch
        semester: 6,
        subjectType: "THEORY",
        weeklyLectureCount: 0, 
        weeklyLabCount: 0, 
        labDuration: 0, 
        hasBatches: false, 
        batchesPerSection: 0
    });

    // Reloads whenever you switch the branch in the Navbar!
    useEffect(() => {
        loadSubjects();
        setFormData(prev => ({ ...prev, department: activeDept }));
    }, [activeDept, filterSem]);

    const loadSubjects = async () => {
        try {
            // Fetches strictly for the active branch
            const data = await getSubjectsBySem(activeDept, filterSem); 
            setSubjects(data);
        } catch (error) {
            showMessage("Failed to load subjects.", "error");
        }
    };

    const showMessage = (text, type) => {
        setStatusMsg({ text, type });
        setTimeout(() => setStatusMsg({ text: "", type: "" }), 3000);
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        let parsedValue = value;
        
        if (type === "checkbox") {
            parsedValue = checked;
        } else if (type === "number") {
            parsedValue = value === "" ? 0 : parseInt(value, 10);
        }

        if (name === "subjectType") {
            setFormData({
                ...formData,
                subjectType: parsedValue,
                weeklyLectureCount: 0,
                weeklyLabCount: 0,
                labDuration: parsedValue === 'LAB' ? 2 : 0, 
                hasBatches: parsedValue === 'LAB', 
                batchesPerSection: parsedValue === 'LAB' ? 2 : 0
            });
        } else {
            setFormData({ ...formData, [name]: parsedValue });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const submissionData = { ...formData, department: activeDept }; 
            if (editingId) {
                await updateSubject(editingId, submissionData);
                showMessage("Subject updated successfully!", "success");
            } else {
                await addSubject(submissionData);
                showMessage("Subject added successfully!", "success");
            }
            resetForm();
            loadSubjects();
        } catch (error) {
            showMessage("Action failed. Please try again.", "error");
        }
    };

    const handleEditClick = (subject) => {
        setFormData(subject);
        setEditingId(subject.id);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDeleteClick = async (id) => {
        if (window.confirm("Are you sure you want to delete this subject?")) {
            try {
                await deleteSubject(id);
                showMessage("Subject deleted successfully!", "success");
                loadSubjects(); 
            } catch (error) {
                showMessage("Failed to delete subject.", "error");
            }
        }
    };

    const resetForm = () => {
        setFormData({
            name: "", code: "", alias: "", 
            department: activeDept, 
            semester: filterSem,
            subjectType: "THEORY",
            weeklyLectureCount: 0, weeklyLabCount: 0, labDuration: 0, hasBatches: false, batchesPerSection: 0
        });
        setEditingId(null);
    };

    const getTypeBadge = (type) => {
        switch(type) {
            case 'THEORY': return <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded border border-blue-200">THEORY</span>;
            case 'LAB': return <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2 py-1 rounded border border-purple-200">LAB</span>;
            case 'ACTIVITY': return <span className="bg-orange-100 text-orange-800 text-xs font-bold px-2 py-1 rounded border border-orange-200">ACTIVITY</span>;
            default: return <span className="bg-gray-100 text-gray-800 text-xs font-bold px-2 py-1 rounded border border-gray-200">{type}</span>;
        }
    };

    return (
        <div className="p-6 max-w-6xl mx-auto font-sans animate-fade-in-up">
            <div className="flex justify-between items-center mb-6 border-b-2 border-slate-800 pb-3">
                <h2 className="text-2xl font-bold text-slate-800">Manage Subjects</h2>
            </div>

            {statusMsg.text && (
                <div className={`p-3 mb-4 rounded text-white font-semibold transition-all shadow-sm ${statusMsg.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}>
                    {statusMsg.text}
                </div>
            )}

            <div className="flex gap-4 mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200 shadow-sm">
                <div className="flex items-center">
                    <span className="font-semibold text-slate-500 mr-2">Department:</span>
                    <span className="bg-white border border-slate-300 px-3 py-1.5 rounded font-black text-slate-800 shadow-sm">
                        {activeDept}
                    </span>
                </div>
                <div className="flex items-center ml-4">
                    <label className="font-semibold text-slate-700 mr-2">View Semester:</label>
                    <select 
                        className="border border-slate-300 p-1.5 rounded focus:ring-2 focus:ring-emerald-500 outline-none w-28 text-center font-bold text-slate-700 bg-white cursor-pointer" 
                        value={filterSem} 
                        onChange={(e) => setFilterSem(parseInt(e.target.value))}
                    >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                            <option key={num} value={num}>Sem {num}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm shadow-md rounded-lg p-6 mb-8 border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
                    {editingId ? "✏️ Edit Subject" : `➕ Add New Subject to ${activeDept}`}
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div className="md:col-span-1">
                            <label className="block text-sm font-bold text-slate-600 mb-1">Type</label>
                            <select className="w-full border border-slate-300 p-2.5 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-semibold text-slate-700" name="subjectType" value={formData.subjectType} onChange={handleInputChange}>
                                <option value="THEORY">Theory</option>
                                <option value="LAB">Lab Only</option>
                                <option value="ACTIVITY">Activity</option>
                            </select>
                        </div>
                        
                        <div className="md:col-span-1">
                            <label className="block text-sm font-bold text-slate-600 mb-1">Target Semester</label>
                            <select className="w-full border border-slate-300 p-2.5 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-semibold text-slate-700" name="semester" value={formData.semester} onChange={handleInputChange}>
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                                    <option key={num} value={num}>Semester {num}</option>
                                ))}
                            </select>
                        </div>

                        <div className="md:col-span-1">
                            <label className="block text-sm font-bold text-slate-600 mb-1">Alias (e.g. DWM)</label>
                            <input className="w-full border border-slate-300 p-2.5 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase font-bold" name="alias" value={formData.alias} onChange={handleInputChange} required />
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-sm font-bold text-slate-600 mb-1">Code (e.g. CT601)</label>
                            <input className="w-full border border-slate-300 p-2.5 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase font-bold" name="code" value={formData.code} onChange={handleInputChange} required />
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-sm font-bold text-slate-600 mb-1">Full Name</label>
                            <input className="w-full border border-slate-300 p-2.5 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500" name="name" value={formData.name} onChange={handleInputChange} required />
                        </div>
                    </div>

                    <div className="bg-emerald-50/50 p-4 rounded-lg border border-emerald-100">
                        {formData.subjectType === 'THEORY' && (
                            <div>
                                <label className="block text-sm font-extrabold text-emerald-900 mb-1">Lectures per Week</label>
                                <input type="number" min="0" className="w-full md:w-1/4 border border-emerald-300 p-2.5 rounded font-bold text-lg text-center focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white" name="weeklyLectureCount" value={formData.weeklyLectureCount} onChange={handleInputChange} required />
                            </div>
                        )}

                        {formData.subjectType === 'ACTIVITY' && (
                            <div>
                                <label className="block text-sm font-extrabold text-emerald-900 mb-1">Slots per Week</label>
                                <input type="number" min="0" className="w-full md:w-1/4 border border-emerald-300 p-2.5 rounded font-bold text-lg text-center focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white" name="weeklyLectureCount" value={formData.weeklyLectureCount} onChange={handleInputChange} required />
                            </div>
                        )}

                        {formData.subjectType === 'LAB' && (
                            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                                <div>
                                    <label className="block text-sm font-extrabold text-emerald-900 mb-1">Labs per Week</label>
                                    <input type="number" min="0" className="w-full border border-emerald-300 p-2.5 rounded font-bold text-lg text-center focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white" name="weeklyLabCount" value={formData.weeklyLabCount} onChange={handleInputChange} required />
                                </div>
                                
                                <div className="flex items-center gap-2 mt-4 md:mt-0">
                                    <input type="checkbox" id="hasBatches" name="hasBatches" checked={formData.hasBatches} onChange={handleInputChange} className="w-5 h-5 text-emerald-600 rounded cursor-pointer" />
                                    <label htmlFor="hasBatches" className="text-slate-700 font-bold cursor-pointer">Has Batches?</label>
                                    
                                    {formData.hasBatches && (
                                        <div className="ml-2 flex items-center gap-2">
                                            <label className="text-sm font-semibold text-slate-600">Count:</label>
                                            <input type="number" min="1" className="border border-slate-300 p-1.5 rounded w-16 text-center font-bold bg-white" name="batchesPerSection" value={formData.batchesPerSection} onChange={handleInputChange} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-4 pt-4 border-t border-slate-200">
                        <button type="submit" className="bg-slate-800 hover:bg-slate-900 text-white font-semibold px-6 py-2.5 rounded transition-colors shadow-sm">
                            {editingId ? "Update Subject" : "Add Subject"}
                        </button>
                        {editingId && (
                            <button type="button" onClick={resetForm} className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold px-4 py-2.5 rounded">Cancel</button>
                        )}
                    </div>
                </form>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden border border-slate-200">
                <table className="w-full text-left border-collapse min-w-max">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm uppercase tracking-wider">
                        <tr>
                            <th className="p-4 font-semibold">Type</th>
                            <th className="p-4 font-semibold">Code</th>
                            <th className="p-4 font-semibold">Subject</th>
                            <th className="p-4 font-semibold text-center">Weekly Load</th>
                            <th className="p-4 font-semibold text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {subjects.map((sub) => (
                            <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-4">{getTypeBadge(sub.subjectType)}</td>
                                <td className="p-4 text-slate-500 font-mono text-sm font-semibold">{sub.code}</td>
                                <td className="p-4">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-slate-800">{sub.name}</span>
                                        <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">{sub.alias}</span>
                                    </div>
                                </td>
                                <td className="p-4 text-center">
                                    {sub.subjectType === 'THEORY' && (
                                        <span className="bg-blue-100 text-blue-800 font-extrabold px-3 py-1.5 rounded-full text-sm border border-blue-200">
                                            {sub.weeklyLectureCount} Lectures
                                        </span>
                                    )}
                                    {sub.subjectType === 'LAB' && (
                                        <span className="bg-purple-100 text-purple-800 font-extrabold px-3 py-1.5 rounded-full text-sm border border-purple-200">
                                            {sub.weeklyLabCount} Labs {sub.hasBatches ? `(${sub.batchesPerSection} Batches)` : ''}
                                        </span>
                                    )}
                                    {sub.subjectType === 'ACTIVITY' && (
                                        <span className="bg-orange-100 text-orange-800 font-extrabold px-3 py-1.5 rounded-full text-sm border border-orange-200">
                                            {sub.weeklyLectureCount} Slots
                                        </span>
                                    )}
                                </td>
                                <td className="p-4 flex justify-center gap-3">
                                    <button 
                                        onClick={() => handleEditClick(sub)} 
                                        title="Edit Subject"
                                        className="p-2 text-blue-600 hover:bg-blue-100 hover:text-blue-800 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteClick(sub.id)} 
                                        title="Delete Subject"
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
                {subjects.length === 0 && (
                    <div className="p-8 text-center text-slate-500 bg-slate-50">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <p>No subjects found for {activeDept} Sem {filterSem}. Add your first subject above.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SubjectDashboard;