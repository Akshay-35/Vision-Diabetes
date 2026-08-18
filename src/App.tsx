import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { Landing } from '@/pages/Landing';
import { SignIn, SignUp } from '@/pages/Auth';
import { AppShell } from '@/components/AppShell';
import { Dashboard } from '@/pages/Dashboard';
import { Patients } from '@/pages/Patients';
import { Screening } from '@/pages/Screening';
import { RiskPrediction } from '@/pages/RiskPrediction';
import { Progression } from '@/pages/Progression';
import { Medications } from '@/pages/Medications';
import { Labs } from '@/pages/Labs';
import { Appointments } from '@/pages/Appointments';
import { Records } from '@/pages/Records';
import { Reports } from '@/pages/Reports';
import { Explainable } from '@/pages/Explainable';
import { Assistant } from '@/pages/Assistant';
import { Hospitals } from '@/pages/Hospitals';
import { Users } from '@/pages/Users';
import { Audit } from '@/pages/Audit';
import { Analytics } from '@/pages/Analytics';
import { Spinner } from '@/components/ui';
import type { Role } from '@/types';

function Protected({ children, roles }: { children: React.ReactNode; roles?: Role[] }) {
  const { profile, loading } = useAuth();
  if (loading) return <div className="grid min-h-screen place-items-center"><Spinner className="h-8 w-8" /></div>;
  if (!profile) return <Navigate to="/signin" replace />;
  if (roles && !roles.includes(profile.role)) return <Navigate to="/app" replace />;
  return <>{children}</>;
}

function Router() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route
        path="/app"
        element={
          <Protected>
            <AppShell />
          </Protected>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="patients" element={<Protected roles={['super_admin', 'hospital_admin', 'doctor', 'lab_tech']}><Patients /></Protected>} />
        <Route path="screening" element={<Protected roles={['doctor', 'hospital_admin']}><Screening /></Protected>} />
        <Route path="risk" element={<Protected roles={['doctor', 'hospital_admin']}><RiskPrediction /></Protected>} />
        <Route path="progression" element={<Protected roles={['doctor', 'patient', 'hospital_admin']}><Progression /></Protected>} />
        <Route path="medications" element={<Protected roles={['doctor', 'patient']}><Medications /></Protected>} />
        <Route path="labs" element={<Protected roles={['doctor', 'lab_tech', 'patient']}><Labs /></Protected>} />
        <Route path="appointments" element={<Protected roles={['doctor', 'patient', 'hospital_admin']}><Appointments /></Protected>} />
        <Route path="records" element={<Protected roles={['doctor', 'patient', 'hospital_admin']}><Records /></Protected>} />
        <Route path="reports" element={<Protected roles={['doctor', 'patient']}><Reports /></Protected>} />
        <Route path="explainable" element={<Protected roles={['doctor', 'hospital_admin']}><Explainable /></Protected>} />
        <Route path="assistant" element={<Protected roles={['doctor', 'patient', 'hospital_admin']}><Assistant /></Protected>} />
        <Route path="hospitals" element={<Protected roles={['super_admin']}><Hospitals /></Protected>} />
        <Route path="users" element={<Protected roles={['super_admin', 'hospital_admin']}><Users /></Protected>} />
        <Route path="audit" element={<Protected roles={['super_admin']}><Audit /></Protected>} />
        <Route path="analytics" element={<Protected roles={['super_admin', 'hospital_admin', 'doctor']}><Analytics /></Protected>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Router />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
