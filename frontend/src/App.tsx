import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';

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

export default function App() {
  const location = useLocation();
  const isLandingRoute = location.pathname === '/';

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
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

          <Route
            path="/admin"
            element={
              <>
                <SignedIn>
                  <AdminDashboard />
                </SignedIn>
                <SignedOut>
                  <RedirectToSignIn redirectUrl="/#/admin" />
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