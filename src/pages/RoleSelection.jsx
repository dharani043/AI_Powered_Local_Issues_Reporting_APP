import React from 'react';
import { User, Shield, Building2, Wrench } from 'lucide-react';

export function RoleSelection({ onRoleSelect }) {
  const roles = [
    {
      id: 'citizen',
      title: 'Citizen',
      description: 'Report civic issues and track their resolution',
      icon: User,
      color: 'blue'
    },
    {
      id: 'field_worker',
      title: 'Field Worker',
      description: 'Manage assigned issues and upload resolution photos',
      icon: Wrench,
      color: 'orange'
    },
    {
      id: 'corporation_admin',
      title: 'Corporation Admin',
      description: 'Manage issues within your municipality area',
      icon: Building2,
      color: 'indigo'
    },
    {
      id: 'municipality_admin',
      title: 'Municipality Admin',
      description: 'Oversee multiple corporations and manage field workers',
      icon: Shield,
      color: 'purple'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Civic Issue Tracker
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Select your role to continue
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <button
                key={role.id}
                onClick={() => onRoleSelect(role.id)}
                className={`p-8 bg-white dark:bg-gray-800 rounded-2xl border-2 border-transparent hover:border-${role.color}-500 hover:shadow-lg transition-all duration-200 text-left group`}
              >
                <div className={`w-16 h-16 bg-${role.color}-100 dark:bg-${role.color}-900/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-8 h-8 text-${role.color}-600 dark:text-${role.color}-400`} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {role.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {role.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}