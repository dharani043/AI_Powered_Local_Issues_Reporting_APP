import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { RoleSelection } from './pages/RoleSelection';
import { CitizenLogin } from './pages/CitizenLogin';
import { CitizenRegister } from './pages/CitizenRegister';
import { FieldWorkerLogin } from './pages/FieldWorkerLogin';
import { CorporationLogin } from './pages/CorporationLogin';
import { MunicipalityLogin } from './pages/MunicipalityLogin';
import { HomePage } from './pages/HomePage';
import { ReportPage } from './pages/ReportPage';
import { AdminPage } from './pages/AdminPage';
import { CorporationDashboard } from './pages/CorporationDashboard';
import { MunicipalityAdminManagement } from './pages/MunicipalityAdminManagement';
import { FieldWorkerManagement } from './pages/FieldWorkerManagement';
import { FieldWorkerDashboard } from './pages/FieldWorkerDashboard';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { MapView } from './pages/MapView';
import { SettingsPage } from './pages/SettingsPage';
import { UserDashboard } from './pages/UserDashboard';
import { AboutPage } from './pages/AboutPage';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { IssueProvider } from './contexts/IssueContextAPI';

function AppContent() {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState('home');
  const [authPage, setAuthPage] = useState('role-selection');

  if (!user) {
    return (
      <div>
        {authPage === 'role-selection' && (
          <RoleSelection onRoleSelect={(role) => setAuthPage(`${role}-login`)} />
        )}
        {authPage === 'citizen-login' && (
          <CitizenLogin 
            onBack={() => setAuthPage('role-selection')}
            onSwitchToRegister={() => setAuthPage('citizen-register')}
          />
        )}
        {authPage === 'citizen-register' && (
          <CitizenRegister 
            onBack={() => setAuthPage('citizen-login')}
            onSwitchToLogin={() => setAuthPage('citizen-login')}
          />
        )}
        {authPage === 'field_worker-login' && (
          <FieldWorkerLogin onBack={() => setAuthPage('role-selection')} />
        )}
        {authPage === 'corporation_admin-login' && (
          <CorporationLogin onBack={() => setAuthPage('role-selection')} />
        )}
        {authPage === 'municipality_admin-login' && (
          <MunicipalityLogin onBack={() => setAuthPage('role-selection')} />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="flex">
        <Sidebar 
          currentPage={currentPage} 
          onPageChange={setCurrentPage}
        />
        
        <div className="flex-1 ml-64">
          <Header />
          
          <main className="p-6">
            {currentPage === 'home' && <HomePage />}
            {currentPage === 'report' && <ReportPage />}
            {currentPage === 'admin' && <AdminPage />}
            {currentPage === 'municipality-admin' && <MunicipalityAdminManagement />}
            {currentPage === 'municipality-dashboard' && <CorporationDashboard />}
            {currentPage === 'municipality-management' && <MunicipalityAdminManagement />}
            {currentPage === 'field-worker-management' && <FieldWorkerManagement />}
            {currentPage === 'field-worker-dashboard' && <FieldWorkerDashboard />}
            {currentPage === 'analytics' && <AnalyticsPage />}
            {currentPage === 'map' && <MapView />}
            {currentPage === 'settings' && <SettingsPage />}
            {currentPage === 'dashboard' && <UserDashboard />}
            {currentPage === 'about' && <AboutPage />}
          </main>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <IssueProvider>
          <AppContent />
        </IssueProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;