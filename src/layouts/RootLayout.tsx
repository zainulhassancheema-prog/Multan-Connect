import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { CraftGuideWidget } from '@/components/buyer/CraftGuideWidget';
import { CustomCursor } from '@/components/layout/CustomCursor';
import { motion, AnimatePresence } from 'motion/react';

export default function RootLayout() {
  const location = useLocation();

  return (
    <div className="flex flex-col min-h-screen relative overflow-x-hidden">
      <CustomCursor />
      <Navbar />
      <main className="flex-1 overflow-hidden relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{
              duration: 0.3,
              ease: [0.22, 1, 0.36, 1]
            }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
      <CraftGuideWidget />
    </div>
  );
}
