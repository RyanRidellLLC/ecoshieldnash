import { useState, useEffect } from 'react';
import RecruitingPage from './RecruitingPage';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function Router() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const { isAdmin, loading } = useAuth();

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');

      if (anchor && anchor.href.startsWith(window.location.origin)) {
        e.preventDefault();
        const url = new URL(anchor.href);
        window.history.pushState({}, '', url.pathname);
        setCurrentPath(url.pathname);
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#009975] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (currentPath === '/admin') {
    if (!isAdmin) {
      window.history.pushState({}, '', '/login');
      setCurrentPath('/login');
      return <LoginPage />;
    }
    return <AdminDashboard />;
  }

  if (currentPath === '/login') {
    if (isAdmin) {
      window.history.pushState({}, '', '/admin');
      setCurrentPath('/admin');
      return <AdminDashboard />;
    }
    return <LoginPage />;
  }

  return <RecruitingPage />;
}

function App() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  );
}

export default App;
