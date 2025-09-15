import React, { useState, useEffect } from "react";
import { useNavigate, Routes, Route, Link, Navigate } from "react-router-dom";
import digilogo from "../../assets/images/digilogo.svg";
import {
    Home,
    CalendarCheck,
    ListChecks,
    BarChart3,
    CheckCircle,
    LogOut,
    Menu,
    X,
} from "lucide-react";

import DashboardHome from "../../modules/DashboardHome";
import Attendance from "../../modules/Attendance";
import Projects from "../../modules/Projects";
import Performance from "../../modules/Performance";
import Todo from "../../modules/Todo";

const EmployeeDashboard = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState({ name: 'Loading...', role: '...' });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/employee');
                return;
            }

            try {
                const response = await fetch('http://192.168.1.17:3000/api/me', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Authentication failed');
                }

                const userData = await response.json();
                setUser(userData);

            } catch (error) {
                console.error('Failed to fetch user data:', error);
                handleLogout();
            }
        };

        fetchUserData();
    }, [navigate]);


    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
    };


    return (
        <div className="flex min-h-screen">
            {/* sidebar */}
            <div className={`fixed top-1/4 left-0 h-screen  text-white transform ${isOpen ? "translate-x-0" : "-translate-x-full"
                    } md:translate-x-0 transition-transform duration-300 ease-in-out w-64 z-50`}
            >

                <div className="bg-white/15 backdrop-blur-md border border-white/15 
                rounded-xl shadow-lg">
                    {/* digilogo */}
                    <div className="flex items-center justify-between p-4  ">
                        <img src={digilogo}
                            alt="Digiwing ERP"
                            className="h-13 w-13" />

                      

                    {/* sidebar nenu */}
                    <div className="flex-1 p-4 overflow-y-auto">
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    to="/employee-dashboard"
                                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700 transition"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <Home size={18} />
                                    <span>Dashboard</span>
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/employee-dashboard/attendance"
                                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700 transition"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <CalendarCheck size={18} />
                                    <span>Attendance</span>
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/employee-dashboard/projects"
                                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700 transition"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <ListChecks size={18} />
                                    <span>Projects</span>
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/employee-dashboard/performance"
                                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700 transition"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <BarChart3 size={18} />
                                    <span>Performance</span>
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/employee-dashboard/todo"
                                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700 transition"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <CheckCircle size={18} />
                                    <span>To-Do List</span>
                                </Link>
                            </li>
                           <li>
                                <button
                                    onClick={() => {
                                        if (window.confirm("Are you sure you want to logout?")) {
                                            handleLogout();
                                        }
                                    }}
                                    className="flex items-center gap-3 p-2 w-full text-left rounded-lg hover:bg-red-600 transition"
                                >
                                    <LogOut size={18} />
                                    <span>Logout</span>
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>




            {/* modules ares */}
            <div className="flex-1 flex flex-col overflow-y-auto md:ml-64 h-screen  ">
                <div className=" flex items-center justify-between px-4 md:px-6 py-4 sticky top-0 z-40">


                    {/* mobile */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden fixed top-5 right-4 z-50 p-2 text-white bg-gray-900 rounded-md"
                    >
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>

                    {/* user */}
                    <div className="flex items-center space-x-3 ml-auto ">
                        <div className="hidden sm:block text-right">
                            <p className="text-gray-400 text-sm capitalize">{user.role}</p>
                            <h4 className="text-white font-semibold">{user.name}</h4>
                        </div>
                    </div>
                </div>

                {/* modules */}
                <div className="p-0 text-gray-900 overflow-y-auto flex-1 scrollbar-hide">
                    <Routes>
                        <Route index element={<DashboardHome />} />
                        <Route path="attendance" element={<Attendance />} />
                        <Route path="projects" element={<Projects />} />
                        <Route path="performance" element={<Performance />} />
                        <Route path="todo" element={<Todo />} />
                        <Route
                            path="*"
                            element={<Navigate to="/employee-dashboard" replace />}
                        />
                    </Routes>
                </div>
            </div>
        </div>
    );
};

export default EmployeeDashboard;



