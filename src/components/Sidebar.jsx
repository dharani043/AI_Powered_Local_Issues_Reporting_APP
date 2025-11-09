import React from 'react';
import { Home, FileText, Shield, Settings, Users, BarChart3, Info, Building2, MapPin, Wrench } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const menuItems = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'report', label: 'Report Issue', icon: FileText, regularUserOnly: true },
  { id: 'dashboard', label: 'My Issues', icon: BarChart3, regularUserOnly: true },
  { id: 'admin', label: 'Municipality Admin', icon: Shield, adminOnly: true },
  { id: 'municipality-management', label: 'Corporation Setup', icon: Users, adminOnly: true },
  { id: 'field-worker-management', label: 'Field Workers', icon: Wrench, municipalityAdminOnly: true },
  { id: 'field-worker-dashboard', label: 'My Tasks', icon: Wrench, fieldWorkerOnly: true },
  { id: 'admin', label: 'Corporation Admin', icon: Shield, municipalityAdminOnly: true },
  { id: 'municipality-admin', label: 'Corporation Login', icon: Building2 },
  { id: 'municipality-dashboard', label: 'Corporation Dashboard', icon: Building2, corporationAdminOnly: true },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'map', label: 'Map View', icon: MapPin },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'about', label: 'About', icon: Info },
];

export function Sidebar({ currentPage, onPageChange }) {
  const { user } = useAuth();

  const filteredItems = menuItems.filter(item => 
    (!item.adminOnly || (user?.role === 'admin')) && 
    (!item.municipalityAdminOnly || (user?.role === 'municipality_admin')) && 
    (!item.corporationAdminOnly || (user?.role === 'corporation_admin')) &&
    (!item.fieldWorkerOnly || (user?.role === 'field_worker')) &&
    (!item.regularUserOnly || (user && user.role === 'user'))
  );

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-40">
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-8">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">CivicFix</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Smart City Platform</p>
          </div>
        </div>

        <nav className="space-y-2">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors duration-200 ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600 dark:text-blue-400' : ''}`} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {user && (
          <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {user.role === 'municipality_admin' ? 'Municipality Admin' : 
                   user.role === 'corporation_admin' ? 'Corporation Admin' :
                   user.role === 'field_worker' ? 'Field Worker' : user.role}
                </p>
                {user.municipalityName && (
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    {user.municipalityName}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}