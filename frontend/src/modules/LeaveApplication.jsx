import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const LeaveApplication = () => {
    const [reason, setReason] = useState("");
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState("Pending");
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        alert("Leave submitted! Status: Pending");
        setStatus("Pending");

        // Redirect back to Attendance page
        navigate("/employee-dashboard");
    };

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="bg-white/15 backdrop-blur-md rounded-xl shadow-lg border border-white/40 p-6 max-w-lg mx-auto space-y-6">
                <h2 className="text-2xl font-bold text-white">Apply for Leave</h2>

                <form
                    onSubmit={handleSubmit}
                    className=" p-6 rounded-lg shadow space-y-4"
                >
                    <div>
                        <label className="block text-gray-300 mb-2">Reason</label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            required
                            className="w-full p-2 rounded bg-gray-700 text-white"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-300 mb-2">Upload Document</label>
                        <input
                            type="file"
                            onChange={(e) => setFile(e.target.files[0])}
                            className="w-full text-gray-300"
                        />
                    </div>

                    <button
                        type="submit"
                        className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg"
                    >
                        Submit Leave
                    </button>
                </form>

                {status && (
                    <div className="bg-gray-700 p-4 rounded-lg text-white">
                        Current Leave Status:{" "}
                        <span
                            className={`${status === "Pending"
                                ? "text-yellow-400"
                                : status === "Approved"
                                    ? "text-green-400"
                                    : "text-red-400"
                                }`}
                        >
                            {status}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LeaveApplication;
