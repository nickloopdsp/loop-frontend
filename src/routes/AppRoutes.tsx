
import Dashboard from '@/pages/Dashboard';
import NotFound from '@/pages/not-found';
import { Routes, Route } from 'react-router-dom'
export const AppRoutes = () => {
    return (
        <Routes>

            <Route index element={<Dashboard />} />
            <Route path="*" element={<NotFound />} />

        </Routes>
    );
}