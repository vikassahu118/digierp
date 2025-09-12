import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import digilogo from "../../assets/images/digilogo.svg";
import employeelogo from "../../assets/images/employeelogo.svg";
import bg from "../../assets/images/bg.jpg";




const LoginPage = () => {
  const navigate = useNavigate();

  const [employeeId, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const BACKEND_URL = 'http://192.168.1.17:3000/api/auth/login';

  
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ employeeId, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed. Please check your credentials.');
      }

      console.log('Login successful:', data);

      localStorage.setItem('token', data.token);
      localStorage.setItem('userRole', data.role);

      navigate("/employee-dashboard/attendance");

    } catch (err) {
      console.error('Login error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gray-900"
      style={{
        backgroundImage: `url(${bg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 rounded-xl shadow-lg overflow-hidden bg-white/15 backdrop-blur-md border border-white/40">
        



        <div className="p-8 md:p-12 flex flex-col justify-center">
          <div>
            <img src={digilogo} alt="Company Logo" className="h-40 w-40" />
          </div>
          <h2 className="text-3xl font-bold text-white mt-4">Welcome back</h2>
          
          <form onSubmit={handleLogin} className="space-y-4 mt-6">
            <div>
              <label className="block mb-2 text-sm font-medium text-white">ID</label>
              <input
                type=""
                placeholder="Employee ID"
                value={employeeId}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-3 rounded-lg border border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-white">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-3 rounded-lg border border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            



            {error && <p className="text-sm text-center text-red-400">{error}</p>}

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-white">
                <input type="checkbox" className="h-4 w-4 rounded-full accent-blue-500 " />
                Remember me
              </label>
              {/* <a href="#" className="text-blue-500 hover:underline">
                Forgot password?
              </a> */}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>



        <div className="hidden md:flex items-center justify-center p-8">
          <img src={employeelogo} alt="Employee Illustration" className="max-w-md" />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

