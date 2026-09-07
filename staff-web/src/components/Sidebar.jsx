import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  AlertTriangle, 
  History, 
  ShieldCheck, 
  Settings, 
  LogOut, 
  Pill,
  Building2
} from 'lucide-react';

export default function Sidebar({ missedAlertsCount = 0 }) {
  const { hospital, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Patients', path: '/patients', icon: Users },
    { 
      name: 'Missed Alerts', 
      path: '/alerts', 
      icon: AlertTriangle, 
      badge: missedAlertsCount > 0 ? missedAlertsCount : null 
    },
    { name: 'Medication History', path: '/history', icon: History },
    { name: 'Audit Logs', path: '/audit-logs', icon: ShieldCheck },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen sticky top-0 border-r border-slate-800 shadow-xl z-20">
      {/* Brand Header */}
      <div className="p-6 flex items-center gap-3 border-b border-slate-800/80">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-sky-400 flex items-center justify-center shadow-lg shadow-teal-500/20 text-white">
          <Pill className="w-6 h-6 rotate-45" />
        </div>
        <div>
          <h1 className="font-bold text-white text-lg tracking-tight flex items-center gap-1.5">
            StayMeds
            <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
              Staff
            </span>
          </h1>
          <p className="text-xs text-slate-400 truncate max-w-[140px]">Medication Tracking</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          Hospital Portal
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-teal-500/15 text-teal-400 font-semibold border border-teal-500/20 shadow-inner'
                    : 'hover:bg-slate-800/60 hover:text-white text-slate-400'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-red-500 text-white animate-pulse shadow-sm shadow-red-500/50">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Hospital Profile & Logout Footer */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/50">
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/50 mb-3">
          <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center text-teal-400">
            <Building2 className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">
              {hospital?.name || 'CarePlus Hospital'}
            </p>
            <p className="text-[11px] text-slate-400 truncate">
              {hospital?.email || 'staff@careplus.com'}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors border border-transparent hover:border-red-500/20"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
