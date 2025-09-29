import React, { useEffect, useState } from "react";
import {
  Search,
  Calendar,
  Download,
  Filter,
  Users,
  TrendingUp,
  XCircle,
  CheckCircle,
} from "lucide-react";

const API_URL = "http://localhost:3000/api/admin/attendance";

// 🔔 Simple notification component
const Notification = ({ message, type, onClose }) => {
  if (!message) return null;

  const bgColor = type === "success" ? "bg-green-500" : "bg-red-500";
  const icon =
    type === "success" ? (
      <CheckCircle className="h-5 w-5" />
    ) : (
      <XCircle className="h-5 w-5" />
    );

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 flex items-center p-4 rounded-lg text-white shadow-lg ${bgColor}`}
    >
      {icon}
      <span className="ml-3 text-sm font-medium">{message}</span>
      <button
        onClick={onClose}
        className="ml-4 -mr-1 rounded-full p-1 hover:bg-white/20"
      >
        <XCircle className="h-4 w-4" />
      </button>
    </div>
  );
};

const MonthSummary = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [filterType, setFilterType] = useState("all");
  const [notification, setNotification] = useState({ message: "", type: "" });

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: "", type: "" }), 3000);
  };

  // 📅 Helper: get first & last day of month
  const getMonthRange = (monthStr) => {
    const [year, month] = monthStr.split("-");
    const from = new Date(year, month - 1, 1).toISOString().slice(0, 10);
    const to = new Date(year, month, 0).toISOString().slice(0, 10);
    return { from, to };
  };

  // 📡 Fetch attendance data
  const fetchAttendanceData = async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");
    if (!token) {
      setError("You are not authenticated. Please log in.");
      setLoading(false);
      return;
    }

    try {
      const { from, to } = getMonthRange(selectedMonth);

      const response = await fetch(
        `${API_URL}/?from=${from}&to=${to}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch attendance data");

      const data = await response.json();
      setAttendanceData(data);
    } catch (err) {
      setError("Error fetching attendance data. Please try again.");
      console.error("Error fetching attendance:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceData();
  }, [selectedMonth]);

  // 🔍 Filter & search
  const filteredData = attendanceData.filter((emp) => {
    const matchesSearch = emp.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const attendanceRate = (emp.present / emp.totalDays) * 100;

    let matchesFilter = true;
    switch (filterType) {
      case "high":
        matchesFilter = attendanceRate > 90;
        break;
      case "medium":
        matchesFilter = attendanceRate >= 70 && attendanceRate <= 90;
        break;
      case "low":
        matchesFilter = attendanceRate < 70;
        break;
      default:
        matchesFilter = true;
    }

    return matchesSearch && matchesFilter;
  });

  // 📊 Summary stats
  const totalEmployees = attendanceData.length;
  const avgAttendance =
    attendanceData.length > 0
      ? (
          attendanceData.reduce(
            (sum, emp) => sum + (emp.present / emp.totalDays) * 100,
            0
          ) / attendanceData.length
        ).toFixed(1)
      : 0;
  const highPerformers = attendanceData.filter(
    (emp) => (emp.present / emp.totalDays) * 100 > 90
  ).length;

  const getAttendanceRate = (present, total) =>
    ((present / total) * 100).toFixed(1);

  const getAttendanceColor = (rate) => {
    if (rate >= 90) return "text-green-600";
    if (rate >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  // ⬇️ Export CSV
  const exportToCSV = () => {
    const headers = [
      "Employee Name",
      "Present Days",
      "Absent Days",
      "Leave Days",
      "Attendance Rate",
    ];
    const csvContent = [
      headers.join(","),
      ...filteredData.map((emp) =>
        [
          emp.name,
          emp.present,
          emp.absent,
          emp.onLeave,
          `${getAttendanceRate(emp.present, emp.totalDays)}%`,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance-report-${selectedMonth}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    showNotification("CSV exported successfully!", "success");
  };

  // 🖼️ UI
  return (
    <div className="bg-white/15 backdrop-blur-md  p-6 space-y-6">
      {/* Title & Month Selector */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">
          Monthly Attendance Summary
        </h1>
        <div className="flex items-center space-x-3">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm"
          />
          <button
            onClick={exportToCSV}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-4 bg-black/15 backdrop-blur-md border border-white/40 rounded-lg shadow flex items-center space-x-4">
          <Users className="h-8 w-8 text-blue-500" />
          <div>
            <p className="text-sm text-gray-100">Total Employees</p>
            <p className="text-xl font-bold text-white">{totalEmployees}</p>
          </div>
        </div>
        <div className="p-4 bg-black/15 backdrop-blur-md border border-white/40 rounded-lg shadow flex items-center space-x-4">
          <Calendar className="h-8 w-8 text-green-500" />
          <div>
            <p className="text-sm text-gray-100">Average Attendance</p>
            <p className="text-xl font-bold text-white">{avgAttendance}%</p>
          </div>
        </div>
        <div className="p-4 bg-black/15 backdrop-blur-md border border-white/40 rounded-lg shadow flex items-center space-x-4">
          <TrendingUp className="h-8 w-8 text-purple-500" />
          <div>
            <p className="text-sm text-gray-100">High Performers</p>
            <p className="text-xl font-bold text-white">{highPerformers}</p>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0">
        <div className="flex items-center w-full md:w-1/3">
          <Search className="h-4 w-4 text-gray-400 absolute ml-3" />
          <input
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border rounded-lg text-sm"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm"
          >
            <option value="all">All Employees</option>
            <option value="high">High Attendance (&gt;90%)</option>
            <option value="medium">Medium (70-90%)</option>
            <option value="low">Low (&lt;70%)</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        {loading ? (
          <p className="p-4 text-center text-gray-500">Loading...</p>
        ) : error ? (
          <p className="p-4 text-center text-red-500">{error}</p>
        ) : filteredData.length === 0 ? (
          <p className="p-4 text-center text-gray-500">
            No records found for this filter.
          </p>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 font-medium text-gray-500">Employee</th>
                <th className="px-6 py-3 font-medium text-gray-500">Present</th>
                <th className="px-6 py-3 font-medium text-gray-500">Absent</th>
                <th className="px-6 py-3 font-medium text-gray-500">On Leave</th>
                <th className="px-6 py-3 font-medium text-gray-500">
                  Attendance Rate
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((emp) => {
                const rate = getAttendanceRate(emp.present, emp.totalDays);
                return (
                  <tr key={emp.id} className="border-t hover:bg-gray-50">
                    <td className="px-6 py-3">{emp.name}</td>
                    <td className="px-6 py-3">{emp.present}</td>
                    <td className="px-6 py-3">{emp.absent}</td>
                    <td className="px-6 py-3">{emp.onLeave}</td>
                    <td
                      className={`px-6 py-3 font-medium ${getAttendanceColor(
                        rate
                      )}`}
                    >
                      {rate}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Notification */}
      <Notification
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ message: "", type: "" })}
      />
    </div>
  );
};

export default MonthSummary;
