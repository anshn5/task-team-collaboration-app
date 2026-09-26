import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api';
import { useAuth } from '../context/AuthContext';

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');

    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      return;
    }

    setLoading(true);

    try {
      const response = await API.post('/auth/login', {
        email: formData.email.trim(),
        password: formData.password,
      });

      if (response.data.success) {
        login(response.data);
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);

      setError(
        error.response?.data?.message ||
        'Unable to login. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4 relative overflow-hidden">

      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-[-150px] left-[-150px] h-[400px] w-[400px] rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-[-150px] right-[-150px] h-[400px] w-[400px] rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md">

        <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-8 shadow-2xl backdrop-blur-xl">

          {/* Logo / Heading */}
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-400/20">
              <span className="text-2xl">✓</span>
            </div>

            <h1 className="text-3xl font-bold">
              Welcome Back
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Login to your Task Collaboration workspace
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Email Address
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                autoComplete="email"
                className="w-full rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/10"
              />
            </div>

            {/* Password */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Password
              </label>

              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                autoComplete="current-password"
                className="w-full rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/10"
              />
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-cyan-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          {/* Signup */}
          <p className="mt-7 text-center text-sm text-slate-400">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="font-semibold text-cyan-400 hover:text-cyan-300"
            >
              Create account
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}

export default Login;