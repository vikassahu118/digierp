import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Attendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [lastAction, setLastAction] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // 🔹 Local lock flags
  const [didCheckIn, setDidCheckIn] = useState(false);
  const [didCheckOut, setDidCheckOut] = useState(false);

  const navigate = useNavigate();
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 🔹 Reset lock states every new day
  useEffect(() => {
    setDidCheckIn(false);
    setDidCheckOut(false);
  }, [today]);

  // 🔹 Fetch attendance from backend
  const fetchAttendance = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(
        "http://192.168.1.17:3000/api/attendance/me?from=2025-09-01&to=2025-09-30",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAttendance(data);
      } else {
        console.error("Failed to fetch attendance");
      }
    } catch (err) {
      console.error("Error fetching attendance:", err);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  // 🔹 Format time safely
  const formatTime = (iso) => {
    if (!iso) return "";
    const date = new Date(iso);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // 🔹 Mark attendance
  const markAttendance = async (status) => {
    if (status === "Leave") {
      navigate("/leave");
      return;
    }

    setIsProcessing(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Login required!");
        navigate("/login");
        return;
      }

      const endpoint =
        status === "Present"
          ? "check-in"
          : status === "Check-Out"
          ? "check-out"
          : null;

      if (!endpoint) return;

      const response = await fetch(
        `http://192.168.1.17:3000/api/attendance/${endpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const nowIso = new Date().toISOString();

        // 🔹 Optimistic updates
        if (status === "Present") {
          setAttendance((prev) => [
            ...prev,
            { check_in_at: nowIso, check_out_at: null, status: "Present" },
          ]);
          setDidCheckIn(true);
        }

        if (status === "Check-Out") {
          setAttendance((prev) =>
            prev.map((a) =>
              a.check_in_at?.startsWith(today)
                ? { ...a, check_out_at: nowIso }
                : a
            )
          );
          setDidCheckOut(true);
        }

        // Still fetch fresh data
        await fetchAttendance();

        const now = new Date();
        setLastAction({
          status,
          time: now.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }),
        });
      } else {
        const errorData = await response.json();
        console.error("Failed:", errorData.error || "Unknown error");
        if (response.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  // 🔹 Status check helpers based on backend fields
  const hasCheckedInToday = attendance.some(
    (a) => a.check_in_at && a.check_in_at.startsWith(today)
  );
  const hasCheckedOutToday = attendance.some(
    (a) => a.check_out_at && a.check_out_at.startsWith(today)
  );
  const hasLeaveToday = attendance.some(
    (a) => a.status?.includes("Leave") && a.check_in_at?.startsWith(today)
  );

  return (
    <div className="p-4 md:p-6 space-y-6  text-white h-full w-full">
      
      
      {/* Header + Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm text-gray-300">
            {currentTime.toLocaleDateString("en-GB", {
              weekday: "long",
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </p>
          <p className="text-base sm:text-lg md:text-xl font-semibold">
            {currentTime.toLocaleTimeString()}
          </p>
        </div>
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-center">
          Attendance
        </h2>
        <div className="flex flex-wrap gap-2 justify-center sm:justify-end">
          {/* ✅ Check-In */}
          <button
            onClick={() => markAttendance("Present")}
            disabled={
              hasCheckedInToday || hasLeaveToday || isProcessing || didCheckIn
            }
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              hasCheckedInToday || hasLeaveToday || isProcessing || didCheckIn
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {isProcessing && !hasCheckedInToday && !didCheckIn
              ? "Processing..."
              : "Check In"}
          </button>

          {/* ✅ Check-Out */}
          <button
            onClick={() => markAttendance("Check-Out")}
            disabled={
              !hasCheckedInToday ||
              hasCheckedOutToday ||
              hasLeaveToday ||
              isProcessing ||
              didCheckOut
            }
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              !hasCheckedInToday ||
              hasCheckedOutToday ||
              hasLeaveToday ||
              isProcessing ||
              didCheckOut
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isProcessing &&
            hasCheckedInToday &&
            !hasCheckedOutToday &&
            !didCheckOut
              ? "Processing..."
              : "Check-Out"}
          </button>

          {/* Leave */}
          <button
            onClick={() => markAttendance("Leave")}
            disabled={hasCheckedInToday || hasCheckedOutToday || isProcessing}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              hasCheckedInToday || hasCheckedOutToday || isProcessing
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-yellow-500 hover:bg-yellow-600"
            }`}
          >
            Leave
          </button>
        </div>
      </div>

      {/* Last Action */}
      {lastAction && (
        <div className="bg-black/15 backdrop-blur-md border border-white/40 p-4 rounded-lg shadow">
          <p className="text-gray-400 text-sm">Last Action</p>
          <h3 className="text-base sm:text-lg font-semibold">
            {lastAction.status} at {lastAction.time}
          </h3>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-black/15 backdrop-blur-md border border-white/40 p-4 rounded-lg shadow text-center">
          <p className="text-gray-400">Total Days</p>
          <h3 className="text-xl font-bold">30</h3>
        </div>
        <div className="bg-black/15 backdrop-blur-md border border-white/40 p-4 rounded-lg shadow text-center">
          <p className="text-gray-400">Present</p>
          <h3 className="text-xl font-bold text-green-400">
            {attendance.filter((a) => a.check_in_at).length}
          </h3>
        </div>
        <div className="bg-black/15 backdrop-blur-md border border-white/40 p-4 rounded-lg shadow text-center">
          <p className="text-gray-400">Leave</p>
          <h3 className="text-xl font-bold text-yellow-400">
            {attendance.filter((a) => a.status?.includes("Leave")).length}
          </h3>
        </div>
        <div className="bg-black/15 backdrop-blur-md border border-white/40 p-4 rounded-lg shadow text-center">
          <p className="text-gray-400">Check-Outs</p>
          <h3 className="text-xl font-bold text-blue-400">
            {attendance.filter((a) => a.check_out_at).length}
          </h3>
        </div>
      </div>

      {/* calendar  */}
      <div className="bg-black/15 backdrop-blur-md border border-white/40 p-6 rounded-lg shadow overflow-x-auto">
        <h3 className="text-lg font-semibold mb-4">September 2025 Report</h3>
        <div className="grid grid-cols-7 gap-2 text-center text-sm sm:text-base min-w-[420px]">
          {Array.from({ length: 30 }).map((_, i) => {
            const day = String(i + 1).padStart(2, "0");
            const date = `2025-09-${day}`;
            const record = attendance.find((a) =>
              a.check_in_at?.startsWith(date)
            );
            return (
              <div
                key={i}
                className={`p-2 rounded-lg ${
                  record?.check_in_at
                    ? !record.check_out_at
                      ? "bg-green-600"
                      : "bg-blue-600"
                    : record?.status?.includes("Leave")
                    ? "bg-yellow-500"
                    : "bg-gray-700 text-gray-300"
                }`}
              >
                {i + 1}
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Report */}
      <div className="bg-black/15 backdrop-blur-md border border-white/40 p-6 rounded-lg shadow overflow-x-auto">
        <h3 className="text-lg font-semibold mb-4">Detailed Report</h3>
        <table className="w-full text-left border-collapse min-w-[500px]">
          <thead>
            <tr className="text-gray-400">
              <th className="p-2">Date</th>
              <th className="p-2">Check-In Time</th>
              <th className="p-2">Check-Out Time</th>
              <th className="p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {attendance.map((a, i) => (
              <tr key={i} className="border-t border-gray-700">
                <td className="p-2">{a.check_in_at?.split("T")[0]}</td>
                <td className="p-2">{formatTime(a.check_in_at)}</td>
                <td className="p-2">{formatTime(a.check_out_at)}</td>
                <td
                  className={`p-2 ${
                    a.status === "Leave"
                      ? "text-yellow-400"
                      : a.check_out_at
                      ? "text-blue-400"
                      : a.check_in_at
                      ? "text-green-400"
                      : "text-gray-400"
                  }`}
                >
                  {a.status === "Leave"
                    ? "Leave"
                    : a.check_out_at
                    ? "Check-Out"
                    : a.check_in_at
                    ? "Present"
                    : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Attendance;
