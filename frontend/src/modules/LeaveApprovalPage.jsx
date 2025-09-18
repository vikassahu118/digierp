import React, { useEffect, useState } from "react";
import axios from "axios";

const LeaveApprovalPage = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Get JWT token from localStorage
  const token = localStorage.getItem("token");

  // Fetch leave applications
  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://192.168.1.13:3000/api/leaves/admin", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLeaves(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load leave applications.");
    } finally {
      setLoading(false);
    }
  };

  // Approve or Reject leave
  const handleAction = async (id, status) => {
    try {
      await axios.put(
        `http://192.168.1.13:3000/api/leaves/admin/${id}/status`,
        { status },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchLeaves(); // refresh after action
    } catch (err) {
      console.error(err);
      alert("Failed to update leave status.");
    }
  };

  useEffect(() => {
    fetchLeaves();
    // eslint-disable-next-line
  }, []);

  if (loading) return <p className="text-center">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="p-6 ">
      <h2 className="text-xl font-bold mb-4 text-white">Leave Approval (Admin/HR)</h2>

      {leaves.length === 0 ? (
        <p className="text-gray-500">No leave applications found.</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Employee</th>
              <th className="border p-2">Start Date</th>
              <th className="border p-2">End Date</th>
              <th className="border p-2">Reason</th>
              <th className="border p-2">Document</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {leaves.map((leave) => (
              <tr key={leave.id} className="text-center">
                <td className="border p-2 text-white">
                  {leave.employee_name} ({leave.employee_id})
                </td>
                <td className="border p-2 text-white">{leave.start_date}</td>
                <td className="border p-2 text-white">{leave.end_date}</td>
                <td className="border p-2 text-white">{leave.reason}</td>
                <td className="border p-2 text-white">
                  {leave.document_path ? (
                    <a
                      href={`http://192.168.1.13:3000/${leave.document_path}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 underline"
                    >
                      View
                    </a>
                  ) : (
                    "No File"
                  )}
                </td>
                <td className="border p-2 text-white">{leave.status}</td>
                <td className="border p-2 space-x-2">
                  <button
                    onClick={() => handleAction(leave.id, "APPROVED")}
                    className="px-3 py-1 bg-green-500 text-white rounded"
                    disabled={leave.status !== "PENDING"}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleAction(leave.id, "REJECTED")}
                    className="px-3 py-1 bg-red-500 text-white rounded"
                    disabled={leave.status !== "PENDING"}
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default LeaveApprovalPage;
