import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { lazy, Suspense, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router';
import LandingPage from '../features/landing/LandingPage';
import NotFound from './NotFound';

// The back-office is only loaded by staff, so it is split out of the public bundle.
const AdminPage = lazy(() => import('../features/admin/AdminPage'));

export function App() {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { refetchOnWindowFocus: true } } }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/admin"
            element={
              <Suspense fallback={null}>
                <AdminPage />
              </Suspense>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
