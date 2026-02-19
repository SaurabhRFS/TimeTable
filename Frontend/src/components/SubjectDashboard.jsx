import { useEffect, useState } from "react";
import { getSubjectsBySem, addSubject, updateSubject, deleteSubject } from "../services/subjectService";

const SubjectDashboard = () => {
    // --- 1. STATE ---
    const [subjects, setSubjects] = useState([]);
    const [filterDept, setFilterDept] = useState("CT");
    const [filterSem, setFilterSem] = useState(6);
    const [statusMsg, setStatusMsg] = useState({ text: "", type: "" });
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
        name: "", 
        code: "", 
        alias: "", 
        department: "CT", 
        semester: 6,
        weeklyLectureCount: 0, 
        weeklyLabCount: 0, 
        labDuration: 0,
        hasBatches: false,
        batchesPerSection: 0
    });

    // --- 2. LOAD DATA ---
    useEffect(() => {
        loadSubjects();
    }, [filterDept, filterSem]);

    const loadSubjects = async () => {
        try {
            const data = await getSubjectsBySem(filterDept, filterSem);
            setSubjects(data);
        } catch (error) {
            showMessage("Failed to load subjects.", "error");
        }
    };

    const showMessage = (text, type) => {
        setStatusMsg({ text, type });
        setTimeout(() => setStatusMsg({ text: "", type: "" }), 3000);
    };

    // --- 3. HANDLERS ---
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await updateSubject(editingId, formData);
                showMessage("Subject updated successfully!", "success");
            } else {
                await addSubject(formData);
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

    // STEP 4 FIX: The complete Delete Function
    const handleDeleteClick = async (id) => {
        if (window.confirm("Are you sure you want to delete this subject?")) {
            try {
                await deleteSubject(id);
                showMessage("Subject deleted successfully!", "success");
                loadSubjects(); // Refresh the table after deletion
            } catch (error) {
                showMessage("Failed to delete subject.", "error");
            }
        }
    };

    const resetForm = () => {
        setFormData({
            name: "", code: "", alias: "", department: filterDept, semester: filterSem,
            weeklyLectureCount: 0, weeklyLabCount: 0, labDuration: 0, hasBatches: false, batchesPerSection: 0
        });
        setEditingId(null);
    };

    // --- 4. UI ---
    return (
        <div className="p-6 max-w-6xl mx-auto font-sans">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b-2 border-green-500 pb-2">
                Manage Subjects
            </h2>

            {/* Notification Banner */}
            {statusMsg.text && (
                <div className={`p-3 mb-4 rounded text-white font-semibold transition-all ${statusMsg.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
                    {statusMsg.text}
                </div>
            )}

            {/* Filter Section */}
            <div className="flex gap-4 mb-6 bg-gray-100 p-4 rounded-lg border border-gray-200">
                <div>
                    <label className="font-semibold text-gray-700 mr-2">Department:</label>
                    <input 
                        className="border border-gray-300 p-1 rounded"
                        value={filterDept} onChange={(e) => setFilterDept(e.target.value)} 
                    />
                </div>
                <div>
                    <label className="font-semibold text-gray-700 mr-2">Semester:</label>
                    <input 
                        type="number" className="border border-gray-300 p-1 rounded w-16"
                        value={filterSem} onChange={(e) => setFilterSem(e.target.value)} 
                    />
                </div>
            </div>

            {/* Form Section */}
            <div className="bg-white shadow-lg rounded-lg p-6 mb-8 border-t-4 border-green-600">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                    {editingId ? "Edit Subject" : "Add New Subject"}
                </h3>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input className="border border-gray-300 p-2 rounded focus:ring-2 focus:ring-green-400" name="name" placeholder="Subject Name (e.g. Data Warehousing)" value={formData.name} onChange={handleInputChange} required />
                    <input className="border border-gray-300 p-2 rounded focus:ring-2 focus:ring-green-400" name="code" placeholder="Code (e.g. CT601)" value={formData.code} onChange={handleInputChange} required />
                    <input className="border border-gray-300 p-2 rounded focus:ring-2 focus:ring-green-400" name="alias" placeholder="Alias (e.g. DWM)" value={formData.alias} onChange={handleInputChange} required />
                    
                    <input type="number" className="border border-gray-300 p-2 rounded focus:ring-2 focus:ring-green-400" name="weeklyLectureCount" placeholder="Theory Lectures/Week" value={formData.weeklyLectureCount} onChange={handleInputChange} required />
                    <input type="number" className="border border-gray-300 p-2 rounded focus:ring-2 focus:ring-green-400" name="weeklyLabCount" placeholder="Lab Sessions/Week" value={formData.weeklyLabCount} onChange={handleInputChange} required />
                    <input type="number" className="border border-gray-300 p-2 rounded focus:ring-2 focus:ring-green-400" name="labDuration" placeholder="Lab Duration (in slots)" value={formData.labDuration} onChange={handleInputChange} required />
                    
                    <div className="flex items-center gap-2 col-span-1 md:col-span-3">
                        <input type="checkbox" name="hasBatches" checked={formData.hasBatches} onChange={handleInputChange} className="w-4 h-4" />
                        <label className="text-gray-700 font-semibold">Has Practical Batches?</label>
                        
                        {formData.hasBatches && (
                            <input type="number" className="border border-gray-300 p-2 rounded w-48 ml-4 focus:ring-2 focus:ring-green-400" name="batchesPerSection" placeholder="Batches per Section" value={formData.batchesPerSection} onChange={handleInputChange} />
                        )}
                    </div>

                    <div className="col-span-1 md:col-span-3 flex gap-4 mt-2">
                        <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded transition-colors">
                            {editingId ? "Update Subject" : "Add Subject"}
                        </button>
                        {editingId && (
                            <button type="button" onClick={resetForm} className="bg-gray-400 hover:bg-gray-500 text-white font-semibold px-4 py-2 rounded transition-colors">
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Table Section */}
            <div className="bg-white shadow-lg rounded-lg overflow-x-auto border border-gray-200">
                <table className="w-full text-left border-collapse min-w-max">
                    <thead className="bg-gray-100 border-b-2 border-gray-300 text-gray-700">
                        <tr>
                            <th className="p-4">Alias</th>
                            <th className="p-4">Name</th>
                            <th className="p-4">Code</th>
                            <th className="p-4">Theory/Wk</th>
                            <th className="p-4">Labs/Wk</th>
                            <th className="p-4">Duration</th>
                            <th className="p-4 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {subjects.map((sub) => (
                            <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4 font-bold text-gray-800">{sub.alias}</td>
                                <td className="p-4 text-gray-600">{sub.name}</td>
                                <td className="p-4 text-gray-500">{sub.code}</td>
                                <td className="p-4 text-gray-600">{sub.weeklyLectureCount}</td>
                                <td className="p-4 text-gray-600">{sub.weeklyLabCount}</td>
                                <td className="p-4 text-gray-600">{sub.labDuration} slots</td>
                                <td className="p-4 flex justify-center gap-2">
                                    <button 
                                        onClick={() => handleEditClick(sub)} 
                                        className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded text-sm font-semibold transition-colors">
                                        Edit
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteClick(sub.id)} 
                                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm font-semibold transition-colors">
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {subjects.length === 0 && (
                    <div className="p-6 text-center text-gray-500 italic">No subjects found for {filterDept} Sem {filterSem}.</div>
                )}
            </div>
        </div>
    );
};

export default SubjectDashboard;