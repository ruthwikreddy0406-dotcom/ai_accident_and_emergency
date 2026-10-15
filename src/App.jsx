import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WebSocketProvider } from './context/WebSocketContext';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import LiveAlertBanner from './components/common/LiveAlertBanner';

// Pages
import Dashboard from './pages/Dashboard';
import LiveMonitoring from './pages/LiveMonitoring';
import VideoAnalysis from './pages/VideoAnalysis';
import IncidentList from './pages/IncidentList';
import IncidentDetail from './pages/IncidentDetail';
import IncidentMapPage from './pages/IncidentMapPage';
import ResponseCoordination from './pages/ResponseCoordination';
import Analytics from './pages/Analytics';
import Cameras from './pages/Cameras';
import Notifications from './pages/Notifications';
import PresentationGuide from './pages/PresentationGuide';
import Settings from './pages/Settings';
import Login from './pages/Login';

// Layout Wrapper
function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />
      <div className="flex-1 flex">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
      <LiveAlertBanner />
    </div>
  );
}

// 404 Not Found Component
function NotFound() {
  return (
    <div className="p-16 text-center space-y-3">
      <h1 className="text-4xl font-black text-rose-500 font-mono">404</h1>
      <h2 className="text-base font-bold text-white">Ops Console Page Not Found</h2>
      <p className="text-xs text-slate-400">The requested incident record or operational panel does not exist.</p>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <WebSocketProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route path="/" element={<AppLayout><Dashboard /></AppLayout>} />
            <Route path="/monitoring" element={<AppLayout><LiveMonitoring /></AppLayout>} />
            <Route path="/video-analysis" element={<AppLayout><VideoAnalysis /></AppLayout>} />
            <Route path="/incidents" element={<AppLayout><IncidentList /></AppLayout>} />
            <Route path="/incidents/:incidentId" element={<AppLayout><IncidentDetail /></AppLayout>} />
            <Route path="/map" element={<AppLayout><IncidentMapPage /></AppLayout>} />
            <Route path="/response" element={<AppLayout><ResponseCoordination /></AppLayout>} />
            <Route path="/analytics" element={<AppLayout><Analytics /></AppLayout>} />
            <Route path="/cameras" element={<AppLayout><Cameras /></AppLayout>} />
            <Route path="/notifications" element={<AppLayout><Notifications /></AppLayout>} />
            <Route path="/presentation" element={<AppLayout><PresentationGuide /></AppLayout>} />
            <Route path="/settings" element={<AppLayout><Settings /></AppLayout>} />

            <Route path="*" element={<AppLayout><NotFound /></AppLayout>} />
          </Routes>
        </BrowserRouter>
      </WebSocketProvider>
    </AuthProvider>
  );
}
