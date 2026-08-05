import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';

import Layout from './layout';
import Home from './pages/Home';
import Programs from './pages/Programs';
import Consultation from './pages/Consultation';
import BookSession from './pages/BookSession';
import Merch from './pages/Merch';
import AdminDashboard from './pages/AdminDashboard';
import AboutMe from './pages/AboutPage';
import Qualifications from './pages/Qualifications';
import Testimonials from './pages/Testimonials';
import SonicWidget from './components/SonicWidget';

export default function App() {
  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
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

      <SonicWidget />
    </div>
  );
}