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
    CreditCard,
    User,
    CalendarCheck2,
} from "lucide-react";

import DashboardHome from "../../modules/DashboardHome";
import Attendance from "../../modules/Attendance";
import Projects from "../../modules/Projects";
import Performance from "../../modules/Performance";
import Todo from "../../modules/Todo";
import LeaveApprovalPage from "../../modules/LeaveApprovalPage";
import FinancialDashboard from "../../modules/FinancialReports";
import MonthSummary from "../../modules/attendance/MonthSummary";

const EmployeeDashboard = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState({ name: "Loading...", role: "..." });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/"); // Redirect to the main login page
                return;
            }

            try {
                const response = await fetch("http://localhost:3000/api/me", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error("Authentication failed");
                }

                const userData = await response.json();
                setUser(userData);
            } catch (error) {
                console.error("Failed to fetch user data:", error);
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
            <div
                className={`fixed left-0 h-screen text-white transform ${isOpen ? "translate-x-0" : "-translate-x-full"
                    } md:translate-x-0 transition-transform duration-300 ease-in-out w-64 z-50`}
            >
                <div
                    className="bg-black/30 backdrop-blur-md border border-white/15 
                rounded-r-md shadow-lg h-full"
                >
                    {/* digilogo */}
                    <div className="flex items-center justify-between p-4">
                        <img
                            src={digilogo}
                            alt="Digiwing ERP"
                            className="h-13 w-13"
                        />
                    </div>

                    {/* sidebar menu */}
                    <div className="flex-1 p-4 overflow-y-auto">
                        <ul className="space-y-2">
                            {/* Dashboard - only for admins */}
                            {user.role === "ADMIN" && (
                                <li>
                                    <Link
                                        to="/employee-dashboard"
                                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700 transition"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <User size={18} />
                                        <span>Employee Management</span>
                                    </Link>
                                </li>
                            )}

                            {/* Attendance */}
                            {(user.role === "HR" || user.role === "EMPLOYEE") && (
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
                            )}

                            {/* Leave Approval */}
                            {(user.role === "ADMIN" || user.role === "HR") && (
                                <li>
                                    <Link
                                        to="/employee-dashboard/leaveapprovalpage"
                                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700 transition"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <CalendarCheck size={18} />
                                        <span>Leave Approval</span>
                                    </Link>
                                </li>
                            )}

                            {/* Financial */}
                            {(user.role === "ADMIN" || user.role === "HR") && (
                                <li>
                                    <Link
                                        to="/employee-dashboard/FinancialDashboard"
                                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700 transition"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <CreditCard size={18} /> {/* Add the icon here */}
                                        <span>Financial</span>
                                    </Link>
                                </li>
                            )}


                            {/* Attendance summary */}
                             {(user.role === "ADMIN" || user.role === "HR") && (
                                <li>
                                    <Link
                                        to="/employee-dashboard/MonthSummary"
                                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700 transition"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <CalendarCheck2 size={18} /> {/* Add the icon here */}
                                        <span>Attendance Summary</span>
                                    </Link>
                                </li>
                            )}

                            {/* Projects */}
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

                            {/* Performance */}
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

                            {/* To-Do List */}
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

                            {/* Logout */}
                            <li>
                                <button
                                    onClick={() => {
                                        if (
                                            window.confirm(
                                                "Are you sure you want to logout?"
                                            )
                                        ) {
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

            {/* main area */}
            <div className="flex-1 flex flex-col overflow-y-auto md:ml-64 h-screen">
                <div className="flex items-center justify-between px-4 md:px-6 py-4 sticky top-0 z-40">
                    {/* mobile menu button */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden fixed top-4 right-4 z-50 p-2 text-white bg-gray-900 rounded-md"
                    >
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>

                    {/* user info */}
                    <div className="flex items-center space-x-3 ml-auto">
                        <div className="hidden sm:block text-right">
                            <p className="text-gray-400 text-sm capitalize">
                                {user.role}
                            </p>
                            <h4 className="text-white font-semibold">
                                {user.name}
                            </h4>
                        </div>
                    </div>
                </div>

                {/* modules */}
                <div className="p-0 text-gray-900 overflow-y-auto flex-1 scrollbar-hide">
                    <Routes>
                        {/* Conditional Index Route */}
                        {user.role === "ADMIN" ? (
                            <Route index element={<DashboardHome />} />
                        ) : (
                            <Route index element={<Attendance />} />
                        )}

                        <Route path="attendance" element={<Attendance />} />
                        <Route path="projects" element={<Projects />} />
                        <Route path="performance" element={<Performance />} />
                        <Route path="todo" element={<Todo />} />

                        {(user.role === "ADMIN" || user.role === "HR") && (
                            <Route path="leaveapprovalpage" element={<LeaveApprovalPage />} />
                        )}

                        {(user.role === "ADMIN" || user.role === "HR") && (
                            <Route path="FinancialDashboard" element={<FinancialDashboard />} />
                        )}

                    
                        {(user.role === "ADMIN" || user.role === "HR") && (
                            <Route path="MonthSummary" element={<MonthSummary />} />
                        )}
                    </Routes>
                </div>
            </div>
        </div>
    );
};

export default EmployeeDashboard;
