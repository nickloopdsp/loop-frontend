
import { BaseLayout } from '@/layouts/BaseLayout';
import Dashboard from '@/pages/dashboard/Dashboard';
import NotFound from '@/pages/notfound/not-found';
import { Routes, Route } from 'react-router-dom'
export const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<BaseLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="*" element={<NotFound />} />
            </Route>

        </Routes>
    );
}