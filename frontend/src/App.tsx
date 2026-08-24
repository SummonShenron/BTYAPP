import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { SignedIn, SignedOut, RedirectToSignIn, useAuth } from '@clerk/clerk-react';

import Layout from './layout';
import Landing from './pages/Landing.tsx';
import Home from './pages/Home.tsx';
import Programs from './pages/Programs.tsx';
import Consultation from './pages/Consultation.tsx';
import BookSession from './pages/BookSession.tsx';
import Merch from './pages/Merch.tsx';
import AdminDashboard from './pages/AdminDashboard.tsx';
import AboutMe from './pages/AboutPage.tsx';
import Qualifications from './pages/Qualifications.tsx';
import Testimonials from './pages/Testimonials.tsx';
import SonicWidget from './components/SonicWidget';
import SeoManager from './components/SeoManager';
import Calculator from './pages/Calculator.tsx';
import DesMoinesPersonalTraining from './pages/DesMoinesPersonalTraining.tsx';

function AdminTokenInjector({ children }: { children: React.ReactNode }) {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      (window as any).__patchy_get_token = async () => await getToken();
    }
  }, [isLoaded, isSignedIn, getToken]);

  return <>{children}</>;
}


export default function App() {
  const location = useLocation();
  const isLandingRoute = location.pathname === '/';
  const { getToken } = useAuth();

  useEffect(() => {
    (window as any).__patchy_get_token = async () => await getToken();
  }, [getToken]);

  React.useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname]);

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <SeoManager pathname={location.pathname} />
      <Routes>
        <Route path="/" element={<Landing />} />

        <Route element={<Layout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/programs" element={<Programs />} />
          <Route path="/consultation" element={<Consultation />} />
          <Route path="/book" element={<BookSession />} />
          <Route path="/merch" element={<Merch />} />
          <Route path="/about" element={<AboutMe />} />
          <Route path="/qualifications" element={<Qualifications />} />
          <Route path="/testimonials" element={<Testimonials />} />
          <Route path="/calculator" element={<Calculator />} />
          <Route path="/des-moines-personal-training" element={<DesMoinesPersonalTraining />} />

          <Route
            path="/admin"
            element={
              <>
                <SignedIn>
                  <AdminTokenInjector>
                    <AdminDashboard />
                  </AdminTokenInjector>
                </SignedIn>

                <SignedOut>
                  <RedirectToSignIn redirectUrl="/admin" />
                </SignedOut>
              </>
            }
          />
        </Route>
      </Routes>

      {!isLandingRoute && <SonicWidget />}
    </div>
  );
}