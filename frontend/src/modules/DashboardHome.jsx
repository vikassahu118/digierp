import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit3, Trash2, Filter, Download, Mail, Phone, MapPin, Calendar, Building, IndianRupee } from 'lucide-react';




const DashboardHome = () => {
  const [employees, setEmployees] = useState([
    {
      id: 1,
      name: 'Vikas',
      email: 'vikassahu118@gmail.com',
      phone: '+917404145341',
      position: 'Full Stack Developer',
      department: 'Engineering',
      salary: 7000,
      hireDate: '2025-08-25',
      status: 'Active',
      location: 'Hisar',
      avatar: ''
    },

  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'

  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    salary: '',
    hireDate: '',
    status: 'Active',
    location: ''
  });

  const departments = ['Engineering', 'Product', 'Design', 'Marketing', 'HR', 'Finance', 'Sales'];
  const statuses = ['Active', 'Inactive', 'On Leave'];

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = !filterDepartment || employee.department === filterDepartment;
    const matchesStatus = !filterStatus || employee.status === filterStatus;

    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const handleAddEmployee = () => {
    if (newEmployee.name && newEmployee.email && newEmployee.position) {
      const employee = {
        ...newEmployee,
        id: employees.length > 0 ? Math.max(...employees.map(e => e.id)) + 1 : 1,
        salary: parseInt(newEmployee.salary) || 0,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face'
      };
      setEmployees([...employees, employee]);
      setNewEmployee({
        name: '',
        email: '',
        phone: '',
        position: '',
        department: '',
        salary: 0,
        hireDate: '',
        status: 'Active',
        location: ''
      });
      setShowAddModal(false);
    }
  };


  const handleEditEmployee = () => {
    if (selectedEmployee) {
      setEmployees(employees.map(emp =>
        emp.id === selectedEmployee.id
          ? { ...selectedEmployee, salary: parseInt(selectedEmployee.salary) || 0 }
          : emp
      ));
      setShowEditModal(false);
      setSelectedEmployee(null);
    }
  };

  const handleDeleteEmployee = (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      setEmployees(employees.filter(emp => emp.id !== id));
    }
  };

  const openEditModal = (employee) => {
    setSelectedEmployee({ ...employee });
    setShowEditModal(true);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const EmployeeCard = ({ employee }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {/* <img
              src={employee.avatar}
              alt={employee.name}
              className="w-12 h-12 rounded-full object-cover"
            /> */}
            <div>
              <h3 className="font-semibold text-gray-900">{employee.name}</h3>
              <p className="text-sm text-gray-600">{employee.position}</p>
            </div>
          </div>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${employee.status === 'Active' ? 'bg-green-100 text-green-800' :
            employee.status === 'Inactive' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
            {employee.status}
          </span>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Mail className="w-4 h-4 mr-2" />
            {employee.email}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Phone className="w-4 h-4 mr-2" />
            {employee.phone}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Building className="w-4 h-4 mr-2" />
            {employee.department}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-2" />
            {employee.location}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            < IndianRupee className="w-4 h-4 mr-2" />
            {(employee.salary)}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-2" />
            Hired {formatDate(employee.hireDate)}
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => openEditModal(employee)}
            className="flex-1 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors duration-200 flex items-center justify-center"
          >
            <Edit3 className="w-4 h-4 mr-1" />
            Edit
          </button>
          <button
            onClick={() => handleDeleteEmployee(employee.id)}
            className="flex-1 bg-red-50 text-red-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors duration-200 flex items-center justify-center"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );

  const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-96 overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ×
              </button>
            </div>
            {children}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen ">
      {/* Header */}
      <div className="bg-black/15 backdrop-blur-md border border-white/40 rounded-xl  shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Employee Management</h1>
              <p className="text-gray-600 mt-1">Manage your team members and their information</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Employee
              </button>
              <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center">
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-black/15 backdrop-blur-md border border-white/40 rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Statuses</option>
              {statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Employees</p>
                <p className="text-2xl font-bold text-gray-900">{employees.length}</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building className="w-4 h-4 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">{employees.filter(e => e.status === 'Active').length}</p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Departments</p>
                <p className="text-2xl font-bold text-purple-600">{new Set(employees.map(e => e.department)).size}</p>
              </div>
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Filter className="w-4 h-4 text-purple-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Salary</p>
                <p className="text-2xl font-bold text-orange-600">
                  {employees.length > 0
                    ? formatCurrency(
                      employees.reduce((sum, e) => sum + Number(e.salary || 0), 0)
                    )
                    : formatCurrency(0)}
                </p>


              </div>
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                < IndianRupee className="w-4 h-4 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Employee Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmployees.map(employee => (
            <EmployeeCard key={employee.id} employee={employee} />
          ))}
        </div>

        {filteredEmployees.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No employees found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>

      {/* Add Employee Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Employee"
      >
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            value={newEmployee.name}
            onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="email"
            placeholder="Email Address"
            value={newEmployee.email}
            onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="tel"
            placeholder="Phone Number"
            value={newEmployee.phone}
            onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Position"
            value={newEmployee.position}
            onChange={(e) => setNewEmployee({ ...newEmployee, position: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={newEmployee.department}
            onChange={(e) => setNewEmployee({ ...newEmployee, department: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Department</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Annual Salary"
            value={newEmployee.salary}
            onChange={(e) => setNewEmployee({ ...newEmployee, salary: Number(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="date"
            placeholder="Hire Date"
            value={newEmployee.hireDate}
            onChange={(e) => setNewEmployee({ ...newEmployee, hireDate: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Location"
            value={newEmployee.location}
            onChange={(e) => setNewEmployee({ ...newEmployee, location: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex space-x-3 pt-4">
            <button
              onClick={handleAddEmployee}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Add Employee
            </button>
            <button
              onClick={() => setShowAddModal(false)}
              className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Employee Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Employee"
      >
        {selectedEmployee && (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Full Name"
              value={selectedEmployee.name}
              onChange={(e) => setSelectedEmployee({ ...selectedEmployee, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="email"
              placeholder="Email Address"
              value={selectedEmployee.email}
              onChange={(e) => setSelectedEmployee({ ...selectedEmployee, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="tel"
              placeholder="Phone Number"
              value={selectedEmployee.phone}
              onChange={(e) => setSelectedEmployee({ ...selectedEmployee, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Position"
              value={selectedEmployee.position}
              onChange={(e) => setSelectedEmployee({ ...selectedEmployee, position: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={selectedEmployee.department}
              onChange={(e) => setSelectedEmployee({ ...selectedEmployee, department: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Department</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Annual Salary"
              value={selectedEmployee.salary}
              onChange={(e) => setSelectedEmployee({ ...selectedEmployee, salary: Number(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="date"
              placeholder="Hire Date"
              value={selectedEmployee.hireDate}
              onChange={(e) => setSelectedEmployee({ ...selectedEmployee, hireDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Location"
              value={selectedEmployee.location}
              onChange={(e) => setSelectedEmployee({ ...selectedEmployee, location: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={selectedEmployee.status}
              onChange={(e) => setSelectedEmployee({ ...selectedEmployee, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            <div className="flex space-x-3 pt-4">
              <button
                onClick={handleEditEmployee}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Save Changes
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DashboardHome