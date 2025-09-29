import React, { useState, useMemo, useEffect, useCallback } from "react";
import { CheckCircle, Hourglass, Settings, X, Plus, Trash2 } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { jwtDecode } from 'jwt-decode';

// --- API Helper Functions ---
const API_BASE_URL = "http://localhost:3000/api";

const getAuthHeaders = () => {
    const token = sessionStorage.getItem('token');
    return { 'Content-Type': 'application/json', 'Authorization': token ? `Bearer ${token}` : '' };
};

const api = {
    get: (path) => fetch(`${API_BASE_URL}${path}`, { headers: getAuthHeaders() }).then(res => res.ok ? res.json() : Promise.reject(res)),
    post: (path, data) => fetch(`${API_BASE_URL}${path}`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(data) }).then(res => res.ok ? res.json() : Promise.reject(res)),
    put: (path, data) => fetch(`${API_BASE_URL}${path}`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(data) }).then(res => res.ok ? res.json() : Promise.reject(res)),
    delete: (path) => fetch(`${API_BASE_URL}${path}`, { method: 'DELETE', headers: getAuthHeaders() }).then(res => res.ok ? res : Promise.reject(res)),
};

// --- Helper to get user info from the token ---
const getLoggedInUser = () => {
    const token = sessionStorage.getItem('token');
    if (!token) return { name: 'Guest', role: 'GUEST' };
    try {
        const decodedToken = jwtDecode(token);
        return { name: decodedToken.name, role: decodedToken.role, id: decodedToken.id };
    } catch (error) {
        console.error("Error decoding token:", error);
        return { name: 'Guest', role: 'GUEST' };
    }
};

// --- Main Component ---
const Projects = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("project");
    const [modalView, setModalView] = useState("tabbed");

    const [allProjects, setAllProjects] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [selectedUserName, setSelectedUserName] = useState('');
    const [selectedProjectId, setSelectedProjectId] = useState(null);

    const loggedInUser = useMemo(() => getLoggedInUser(), []);
    const currentUserRole = loggedInUser.role;
    const isManagement = currentUserRole === 'ADMIN' || currentUserRole === 'TEAM LEADER';

    const visibleProjects = useMemo(() => {
        // The project list is now already filtered by the backend for EMPLOYEE
        if (currentUserRole === 'EMPLOYEE') {
            return allProjects;
        }
        // Admin/TL logic
        if (!selectedUserName) return allProjects;
        return allProjects.filter(p => Array.isArray(p.team) && p.team.some(member => member.name === selectedUserName));
    }, [allProjects, selectedUserName, currentUserRole]);

    const selectedProject = useMemo(() => {
        return allProjects.find(p => p.id === selectedProjectId);
    }, [allProjects, selectedProjectId]);

    const projectTeamMembers = useMemo(() => {
        if (!selectedProject || !Array.isArray(selectedProject.team)) return [];
        return selectedProject.team;
    }, [selectedProject]);

    // **STABLE FETCH HELPER**: Fetches detailed project data (including metrics/tasks)
    const fetchProjectDetails = useCallback(async (projectId) => {
        if (!projectId) return;

        try {
            const projectDetailsPath = isManagement 
                ? `/projects/${projectId}` 
                : `/projects/team/${projectId}`;
                
            const projectData = await api.get(projectDetailsPath);
            
            setAllProjects(prev => prev.map(p => p.id === projectId ? {...p, ...projectData} : p));
            setTasks(projectData.tasklist || []); 
            
        } catch (error) {
            console.error("Fetch project details error:", error);
            
            if (currentUserRole === 'EMPLOYEE' && error.status === 403) {
                 toast.error("Access denied. You are not assigned to this project.");
                 setSelectedProjectId(null); 
            } else if (error.status !== 404) {
                 toast.error("Failed to fetch project details.");
            }
            setTasks([]);
        }
    }, [isManagement, currentUserRole]);


    // **STABLE FETCH ALL DATA**: Fetches the initial list of projects and all users
    const fetchAllData = useCallback(async () => {
        try {
            const projectsPath = isManagement ? '/projects' : '/projects/team'; 

            const [usersData, projectsData] = await Promise.all([
                api.get('/projects/assignable-users'),
                api.get(projectsPath), 
            ]);
            
            setAllUsers(usersData); 
            setAllProjects(projectsData);

            if (isManagement && usersData.length > 0) {
                setSelectedUserName(usersData[0].name);
            } else if (currentUserRole === 'EMPLOYEE') {
                setSelectedUserName(loggedInUser.name);
            }
        } catch (error) {
            toast.error("Failed to fetch initial data.");
        }
    }, [isManagement, currentUserRole, loggedInUser.name]);

    // Initial Data Load
    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    // Effect for fetching details when selected project changes
    useEffect(() => {
        fetchProjectDetails(selectedProjectId);
    }, [selectedProjectId, fetchProjectDetails]); 

    // Effect to select a default project
    useEffect(() => {
        if (!selectedProjectId && visibleProjects.length > 0) {
            setSelectedProjectId(visibleProjects[0].id);
        } else if (selectedProjectId && !visibleProjects.some(p => p.id === selectedProjectId)) {
            setSelectedProjectId(visibleProjects.length > 0 ? visibleProjects[0].id : null);
        }
    }, [visibleProjects, selectedProjectId]);
    
    
    // --- Handlers (using fetchProjectDetails for refresh) ---

    const handleAddProject = async (projectData) => {
        try {
            const createdProject = await api.post('/projects', projectData);
            await fetchAllData();
            setSelectedProjectId(createdProject.id);
            toast.success(`Project "${createdProject.name}" created!`);
            toggleModal();
        } catch (error) {
            toast.error("Failed to create project.");
        }
    };

    const handleUpdateProjectDetails = async (projectData) => {
        try {
            const updatedProject = await api.put(`/projects/${selectedProject.id}`, projectData);
            setAllProjects(allProjects.map(p => p.id === selectedProject.id ? updatedProject : p));
            toast.success("Project details updated.");
            toggleModal();
        } catch (error) {
            toast.error("Failed to update project details.");
        }
    };

    const handleUpdateBudget = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const newBudget = {
            totalBudget: Number(formData.get("totalBudget")), usedBudget: Number(formData.get("usedBudget")), amountReceived: Number(formData.get("receivedBudget")), targetBudget: Number(formData.get("targetBudget")),
            budget_distribution: selectedProject.budget_distribution.map((d, i) => ({ ...d, amount: Number(formData.get(`distribution-${i}`)) })),
        };
        try {
            const updatedProject = await api.put(`/projects/${selectedProject.id}/budget`, newBudget);
            setAllProjects(allProjects.map(p => p.id === selectedProject.id ? updatedProject : p));
            toast.success("Budget updated successfully.");
            toggleModal();
        } catch (error) { toast.error("Failed to update budget."); }
    };

    const handleUpdatePhases = async (e) => {
        e.preventDefault();
        const phasesObject = selectedProject.phases || {};
        const newPhases = Object.keys(phasesObject).reduce((acc, phaseName, i) => {
            const status = e.target[`phase-status-${i}`].value;
            let progress = phasesObject[phaseName].progress;
            if (status === "Completed") progress = 100; else if (status === "Waiting") progress = 0; else { const progressInput = e.target[`phase-progress-${i}`]; if (progressInput) progress = Number(progressInput.value) || 0; }
            acc[phaseName] = { ...phasesObject[phaseName], status, progress };
            return acc;
        }, {});
        try {
            const updatedProject = await api.put(`/projects/${selectedProject.id}/phases`, { phases: newPhases });
            setAllProjects(allProjects.map(p => p.id === selectedProject.id ? updatedProject : p));
            toast.success("Project phases updated.");
            toggleModal();
        } catch (error) { toast.error("Failed to update phases."); }
    };

    const handleAddTask = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const newTask = { title: formData.get("taskName"), description: "N/A", dueDate: formData.get("dueDate"), userId: Number(formData.get("userId")), category: "General", priority: "Medium" };
        try {
            await api.post(`/projects/${selectedProject.id}/tasks`, newTask);
            await fetchProjectDetails(selectedProject.id); // Refresh data
            toast.success("New task added.");
            toggleModal();
        } catch (error) { toast.error("Failed to add task."); }
    };

    const handleDeleteTask = async (taskId) => {
        if (window.confirm("Mark this task as done? It will be removed from the list.")) {
            try {
                await api.delete(`/projects/${selectedProject.id}/tasks/${taskId}`);
                await fetchProjectDetails(selectedProject.id); // Refresh data
                toast.success("Task marked as done.");
            } catch (error) { toast.error("Failed to remove task."); }
        }
    };

    const handleDeleteProject = async (projectId) => {
        if (window.confirm("Are you sure? This action cannot be undone.")) {
            try {
                await api.delete(`/projects/${projectId}`);
                toast.success("Project deleted successfully.");
                fetchAllData();
            } catch (error) { toast.error("Failed to delete project."); }
        }
    };

    const toggleModal = () => setIsModalOpen(!isModalOpen);

    const overdueTasks = useMemo(() => {
        const today = new Date(); today.setHours(0, 0, 0, 0);
        return tasks.filter(t => new Date(t.due_date) < today).map(t => {
            const deadlineDate = new Date(t.due_date);
            const diffTime = Math.abs(today - deadlineDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return { ...t, overdue: `${diffDays} Day${diffDays > 1 ? 's' : ''}` };
        });
    }, [tasks]);

    const workloadData = useMemo(() => {
        if (!tasks || tasks.length === 0) return [];
        const workloadMap = {};
        (selectedProject?.team || []).forEach(member => {
            workloadMap[member.name] = 0;
        });
        tasks.forEach(task => {
            if (workloadMap[task.assigned_user_name] !== undefined) {
                workloadMap[task.assigned_user_name]++;
            }
        });
        return Object.keys(workloadMap).map(name => ({ name, tasks: workloadMap[name] }));
    }, [tasks, selectedProject]);

    const burndownData = useMemo(() => [{ day: "Start", remaining: tasks.length + 1 }, { day: "Current", remaining: tasks.length }], [tasks]);

    const BudgetBreakdown = () => (
        <div className="flex flex-col space-y-2 mt-4 text-sm text-gray-700">
            <h3 className="font-bold text-base mt-4">Step-wise Distribution</h3>
            {selectedProject?.budget_distribution?.map((d, i) => (
                <div key={i} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                    <span>{d.step}</span>
                    <span className="font-semibold text-blue-500">₹{d.amount?.toLocaleString('en-IN')}</span>
                </div>
            ))}
        </div>
    );

    const formatLaunchDate = useMemo(() => {
        if (!selectedProject?.launch_date) return "";
        const launchDate = new Date(selectedProject.launch_date); const today = new Date(); const diffTime = launchDate.getTime() - today.getTime(); const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); const formattedDate = launchDate.toLocaleDateString("en-US", { weekday: 'short', month: 'long', day: 'numeric' }); const dayString = diffDays === 0 ? "Today" : `${diffDays} Day${diffDays === 1 ? '' : 's'}`; return `${diffDays >= 0 ? '+' : ''}${dayString} - ${formattedDate}`;
    }, [selectedProject]);

    const ProjectForm = ({ onSubmit, project }) => {
        const [name, setName] = useState(project?.name || '');
        const [description, setDescription] = useState(project?.description || '');
        const [launchDate, setLaunchDate] = useState(project?.launch_date?.split('T')[0] || '');
        const [selectedTeamMemberIds, setSelectedTeamMemberIds] = useState(project?.team?.map(member => member.id.toString()) || []);

        const handleTeamMemberChange = (e) => {
            const { value, checked } = e.target;
            if (checked) {
                setSelectedTeamMemberIds(prev => [...prev, value]);
            } else {
                setSelectedTeamMemberIds(prev => prev.filter(id => id !== value));
            }
        };

        const handleSubmit = (e) => {
            e.preventDefault();
            onSubmit({
                name,
                description,
                launch_date: launchDate,
                teamMemberIds: selectedTeamMemberIds.map(id => parseInt(id, 10))
            });
        };

        return (
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block font-semibold mb-1">Project Name</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border rounded-lg" required />
                </div>
                <div>
                    <label className="block font-semibold mb-1">Project Description</label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} rows="3" className="w-full p-2 border rounded-lg" required />
                </div>

                <div>
                    <label className="block font-semibold mb-1">Team Members</label>
                    <div className="border rounded-lg p-3 h-32 overflow-y-auto space-y-2">
                        {allUsers.map(user => (
                            <div key={user.id} className="flex items-center">
                                <input
                                    type="checkbox"
                                    id={`user-checkbox-${user.id}`}
                                    value={user.id.toString()}
                                    checked={selectedTeamMemberIds.includes(user.id.toString())}
                                    onChange={handleTeamMemberChange}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <label htmlFor={`user-checkbox-${user.id}`} className="ml-3 block text-sm font-medium text-gray-700">
                                    {user.name}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block font-semibold mb-1">Projected Launch Date</label>
                    <input type="date" value={launchDate} onChange={e => setLaunchDate(e.target.value)} className="w-full p-2 border rounded-lg" required />
                </div>
                <div className="flex justify-end">
                    <button type="submit" className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors">
                        {project ? 'Update Project' : 'Create Project'}
                    </button>
                </div>
            </form>
        );
    };

    const Modal = () => (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">
                            {modalView === "addTask" && "Add New Task"}
                            {modalView === "addProject" && "Add New Project"}
                            {modalView === "tabbed" && "Update Dashboard Data"}
                        </h2>
                        <button onClick={toggleModal} className="text-gray-500 hover:text-gray-800"><X size={24} /></button>
                    </div>

                    {modalView === "tabbed" && (
                        <div>
                            <div className="flex border-b mb-4 overflow-x-auto">
                                <button onClick={() => setActiveTab("project")} className={`py-2 px-4 ${activeTab === "project" ? "border-b-2 border-blue-500 font-semibold" : ""}`}>Project Details</button>
                                <button onClick={() => setActiveTab("budget")} className={`py-2 px-4 ${activeTab === "budget" ? "border-b-2 border-blue-500 font-semibold" : ""}`}>Update Budget</button>
                                <button onClick={() => setActiveTab("phases")} className={`py-2 px-4 ${activeTab === "phases" ? "border-b-2 border-blue-500 font-semibold" : ""}`}>Update Phases</button>
                            </div>

                            {activeTab === "project" && (
                                <ProjectForm onSubmit={handleUpdateProjectDetails} project={selectedProject} />
                            )}

                            {activeTab === "budget" && (
                                <form onSubmit={handleUpdateBudget} className="space-y-4">
                                    <div><label className="block font-semibold mb-1">Total Budget</label><input type="number" name="totalBudget" defaultValue={selectedProject?.total_budget} className="w-full p-2 border rounded-lg" required /></div>
                                    <div><label className="block font-semibold mb-1">Used Budget</label><input type="number" name="usedBudget" defaultValue={selectedProject?.used_budget} className="w-full p-2 border rounded-lg" required /></div>
                                    <div><label className="block font-semibold mb-1">Amount Received</label><input type="number" name="receivedBudget" defaultValue={selectedProject?.amount_received} className="w-full p-2 border rounded-lg" required /></div>
                                    <div><label className="block font-semibold mb-1">Target Budget</label><input type="number" name="targetBudget" defaultValue={selectedProject?.target_budget} className="w-full p-2 border rounded-lg" required /></div>
                                    <div className="space-y-2"><h3 className="font-bold">Step-wise Amount Distribution</h3>{selectedProject?.budget_distribution?.map((d, i) => (<div key={i}><label className="block mb-1">{d.step}</label><input type="number" name={`distribution-${i}`} defaultValue={d.amount} className="w-full p-2 border rounded-lg" required /></div>))}</div>
                                    <div className="flex justify-end"><button type="submit" className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg">Update Budget</button></div>
                                </form>
                            )}

                            {activeTab === "phases" && (
                                <form onSubmit={handleUpdatePhases} className="space-y-6">
                                    {Object.entries(selectedProject?.phases || {}).map(([phaseName, phaseData], i) => (
                                        <div key={i} className="bg-gray-50 p-4 rounded-lg">
                                            <h3 className="text-lg font-semibold mb-2">{phaseName.charAt(0).toUpperCase() + phaseName.slice(1)}</h3>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm mb-1">Status</label>
                                                    <select name={`phase-status-${i}`} defaultValue={phaseData.status} className="w-full p-2 border rounded-lg">
                                                        <option>Completed</option>
                                                        <option>In Progress</option>
                                                        <option>Waiting</option>
                                                    </select>
                                                </div>
                                                {phaseData.status === "In Progress" && (
                                                    <div>
                                                        <label className="block text-sm mb-1">Progress (%)</label>
                                                        <input type="number" name={`phase-progress-${i}`} defaultValue={phaseData.progress || 0} min="0" max="100" className="w-full p-2 border rounded-lg" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    <div className="flex justify-end"><button type="submit" className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg">Save Changes</button></div>
                                </form>
                            )}
                        </div>
                    )}

                    {modalView === "addProject" && (
                        <ProjectForm onSubmit={handleAddProject} />
                    )}

                    {modalView === "addTask" && (
                        <form onSubmit={handleAddTask} className="space-y-4">
                            <div><label className="block font-semibold mb-1">Task Name</label><input type="text" name="taskName" className="w-full p-2 border rounded-lg" required /></div>
                            <div>
                                <label className="block font-semibold mb-1">Assigned To</label>
                                <select name="userId" className="w-full p-2 border rounded-lg" required>
                                    <option value="">Select a team member</option>
                                    {projectTeamMembers.map((user) => (<option key={user.id} value={user.id}>{user.name}</option>))}
                                </select>
                            </div>
                            <div><label className="block font-semibold mb-1">Due Date</label><input type="date" name="dueDate" className="w-full p-2 border rounded-lg" required /></div>
                            <div className="flex justify-end"><button type="submit" className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg">Add Task</button></div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );

    // Safety check for metrics rendering
    const projectProgress = selectedProject?.progress || 0;
    const projectTotalBudget = selectedProject?.total_budget || 0;
    const projectUsedBudget = selectedProject?.used_budget || 0;
    const projectReceivedBudget = selectedProject?.amount_received || 0;

    return (
        <div className="p-6 space-y-6 bg-gray-100 min-h-screen font-sans">
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
            {isModalOpen && <Modal />}

            <header className="flex justify-between items-center flex-wrap gap-4">
                <div>
                    {isManagement && (
                        <div className="mb-2">
                            <label htmlFor="user-select" className="block text-sm">Select User:</label>
                            <select id="user-select" value={selectedUserName} onChange={(e) => setSelectedUserName(e.target.value)} className="rounded-md border-gray-300 shadow-sm">
                                {allUsers.map(user => <option key={user.id} value={user.name}>{user.name}</option>)}
                            </select>
                        </div>
                    )}
                    <h1 className="text-2xl font-bold">{selectedProject?.name || "No Projects"}</h1>
                    <p className="text-gray-600 mt-1">{selectedProject?.description || "Select a project to get started."}</p>
                    <div className="mt-2 flex items-center gap-2">
                        <label htmlFor="project-select" className="sr-only">Select Project</label>
                        <select
                            id="project-select"
                            value={selectedProjectId || ''}
                            onChange={(e) => setSelectedProjectId(Number(e.target.value))}
                            className="block w-full rounded-md border-gray-300 shadow-sm"
                        >
                            {visibleProjects.length > 0 ? (
                                visibleProjects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)
                            ) : (
                                <option disabled>No projects for this user</option>
                            )}
                        </select>
                        {isManagement && (
                            <button onClick={() => { setModalView("addProject"); toggleModal(); }} className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors">
                                <Plus size={20} />
                            </button>
                        )}
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="text-right">
                        <p className="text-gray-600 text-sm">Projected Launch Date</p>
                        <p className="font-bold text-blue-600 text-lg">{formatLaunchDate}</p>
                    </div>
                    {selectedProject && isManagement && (
                        <div className="flex items-center gap-2">
                            <button onClick={() => { setModalView("tabbed"); setActiveTab("project"); toggleModal(); }} className="p-3 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors">
                                <Settings size={20} />
                            </button>
                            <button onClick={() => handleDeleteProject(selectedProject.id)} className="p-3 bg-red-100 text-red-600 rounded-full shadow-md hover:bg-red-200 transition-colors">
                                <Trash2 size={20} />
                            </button>
                        </div>
                    )}
                </div>
            </header>

            {selectedProject ? (
                <>
                    <div className="bg-white shadow rounded-xl p-6">
                        <h2 className="font-bold mb-2">Team Members</h2>
                        <div className="flex flex-wrap gap-2">
                            {selectedProject.team?.map((member) => (
                                <span key={member.id} className="bg-blue-100 text-blue-800 text-sm px-4 py-1 rounded-full">{member.name}</span>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(selectedProject.phases || {}).map(([phaseName, phaseData], i) => (
                            <div key={i} className="bg-white shadow rounded-xl p-4 text-center">
                                {phaseData.status === "Completed" ? (
                                    <CheckCircle className="text-green-500 w-10 h-10 mx-auto" />
                                ) : phaseData.status === "In Progress" ? (
                                    <div className="relative w-16 h-16 mx-auto">
                                        <svg className="absolute top-0 left-0 w-full h-full">
                                            <circle className="text-gray-200" strokeWidth="6" stroke="currentColor" fill="transparent" r="25" cx="32" cy="32" />
                                            <circle className="text-blue-500" strokeWidth="6" strokeLinecap="round" stroke="currentColor" fill="transparent" r="25" cx="32" cy="32" strokeDasharray={157} strokeDashoffset={157 * (1 - projectProgress / 100)} transform="rotate(-90 32 32)" />
                                        </svg>
                                        <span className="absolute inset-0 flex items-center justify-center font-bold text-lg">{projectProgress}%</span>
                                    </div>
                                ) : (
                                    <Hourglass className="text-orange-400 w-10 h-10 mx-auto" />
                                )}
                                <h3 className="mt-2 font-semibold">{phaseName.charAt(0).toUpperCase() + phaseName.slice(1)}</h3>
                                <p className="text-sm text-gray-500">{phaseData.status}</p>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-white shadow rounded-xl p-6">
                            <h2 className="font-bold mb-4">Project Budget</h2>
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={[{ name: "Budget", Total: projectTotalBudget, Used: projectUsedBudget, Received: projectReceivedBudget }]}>
                                    <XAxis dataKey="name" />
                                    <YAxis /><Tooltip />
                                    <Bar dataKey="Total" fill="#3b82f6" />
                                    <Bar dataKey="Used" fill="#dc2626" />
                                    <Bar dataKey="Received" fill="#22c55e" />
                                </BarChart>
                            </ResponsiveContainer>
                            <BudgetBreakdown />
                        </div>

                        <div className="bg-white shadow rounded-xl p-6">
                            <h2 className="font-bold mb-4">Burndown Chart</h2>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={burndownData}>
                                    <CartesianGrid />
                                    <XAxis dataKey="day" />
                                    <YAxis domain={[0, 'dataMax + 1']} />
                                    <Tooltip /><Line type="monotone" dataKey="remaining" stroke="#ef4444" strokeWidth={3} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="bg-white shadow rounded-xl p-6">
                            <h2 className="font-bold mb-4">Overdue Tasks</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr>
                                            <th className="p-2 text-sm">Overdue</th>
                                            <th className="p-2 text-sm">Task</th>
                                            <th className="p-2 text-sm">Employee</th>
                                        </tr>
                                    </thead>
                                    <tbody>{overdueTasks.map((t) => (<tr key={t.id} className="border-t">
                                        <td className="p-2 text-sm text-red-500 font-medium">
                                            {t.overdue}
                                        </td>
                                        <td className="p-2 text-sm">{t.title}</td>
                                        <td className="p-2 text-sm">{t.assigned_user_name}</td>
                                    </tr>))}</tbody>
                                </table>
                            </div>
                        </div>

                        <div className="bg-white shadow rounded-xl p-6">
                            <h2 className="font-bold mb-4">Team Workload</h2>
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={workloadData}>
                                    <CartesianGrid />
                                    <XAxis dataKey="name" />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip />
                                    <Bar dataKey="tasks" fill="#3b82f6" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white shadow rounded-xl p-6 mt-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="font-bold">Project Task List</h2>
                            {isManagement && <button onClick={() => { setModalView("addTask"); toggleModal(); }} className="flex items-center space-x-2 bg-blue-600 text-white text-sm font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                                <Plus size={16} />
                                <span>Add Task</span>
                            </button>}
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr>
                                        <th className="p-3 text-sm">Task</th>
                                        <th className="p-3 text-sm">Assigned To</th>
                                        <th className="p-3 text-sm">Due Date</th>
                                        <th className="p-3 text-sm">Action</th>
                                    </tr>
                                </thead>
                                <tbody>{tasks.map((t) => (<tr key={t.id} className="border-t">
                                    <td className="p-3 text-sm">{t.title}</td>
                                    <td className="p-3 text-sm">{t.assigned_user_name}</td>
                                    <td className="p-3 text-sm">{new Date(t.due_date).toLocaleDateString()}</td>
                                    <td className="p-3 text-sm">{isManagement && <button onClick={() => handleDeleteTask(t.id)} className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold hover:bg-green-600 transition-colors">Done</button>}</td>
                                </tr>))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : (
                <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl shadow">
                    <p className="text-gray-500 text-lg">No projects found for this user.</p>
                </div>
            )}
        </div>
    );
};

export default Projects;
