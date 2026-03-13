import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AppLayout from './components/layout/AppLayout';
import SuperAdminLayout from './components/layout/SuperAdminLayout';
import MarketingLayout from './components/layout/MarketingLayout';

// ── Marketing Pages ──────────────────────────────────────────────────────────
const LandingPage = lazy(() => import('./pages/marketing/LandingPage'));
const FeaturesPage = lazy(() => import('./pages/marketing/FeaturesPage'));
const IndustriesMarketingPage = lazy(() => import('./pages/marketing/IndustriesPage'));
const IndustryDetailPage = lazy(() => import('./pages/marketing/IndustryDetailPage'));
const PricingPage = lazy(() => import('./pages/marketing/PricingPage'));
const ContactPage = lazy(() => import('./pages/marketing/ContactPage'));

// ── Auth & Onboarding ────────────────────────────────────────────────────────
const LoginPage = lazy(() => import('./pages/LoginPage'));
const OnboardingPage = lazy(() => import('./pages/OnboardingPage'));
const TrackOrderPage = lazy(() => import('./pages/TrackOrderPage'));
const PublicBookingPage = lazy(() => import('./pages/PublicBookingPage'));

// ── Business Dashboard Pages ─────────────────────────────────────────────────
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const CustomersPage = lazy(() => import('./pages/CustomersPage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const CreateOrderPage = lazy(() => import('./pages/CreateOrderPage'));
const CreateInvoicePage = lazy(() => import('./pages/CreateInvoicePage'));
const ViewInvoicePage = lazy(() => import('./pages/ViewInvoicePage'));
const EditInvoicePage = lazy(() => import('./pages/EditInvoicePage'));
const CreateEstimatePage = lazy(() => import('./pages/CreateEstimatePage'));
const ViewEstimatePage = lazy(() => import('./pages/ViewEstimatePage'));
const EditEstimatePage = lazy(() => import('./pages/EditEstimatePage'));
const POSPage = lazy(() => import('./pages/POSPage'));
const EstimatesPage = lazy(() => import('./pages/EstimatesPage'));
const InvoicesPage = lazy(() => import('./pages/InvoicesPage'));
const PaymentsPage = lazy(() => import('./pages/PaymentsPage'));
const DispatchPage = lazy(() => import('./pages/DispatchPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const AutomationPage = lazy(() => import('./pages/AutomationPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const StockPage = lazy(() => import('./pages/StockPage'));
const InvoiceTemplatesPage = lazy(() => import('./pages/InvoiceTemplatesPage'));
const BookingsPage = lazy(() => import('./pages/BookingsPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const StaffManagementPage = lazy(() => import('./pages/StaffManagementPage'));
const SuppliersPage = lazy(() => import('./pages/SuppliersPage'));
const IntegrationsPage = lazy(() => import('./pages/IntegrationsPage'));

// ── Super Admin Pages ────────────────────────────────────────────────────────
const SuperAdminDashboard = lazy(() => import('./pages/SuperAdminDashboard'));
const CompaniesPage = lazy(() => import('./pages/CompaniesPage'));
const IndustriesPage = lazy(() => import('./pages/superadmin/IndustriesPage'));
const ModulesPage = lazy(() => import('./pages/superadmin/ModulesPage'));
const PlansPage = lazy(() => import('./pages/superadmin/PlansPage'));
const TemplatesPage = lazy(() => import('./pages/superadmin/TemplatesPage'));
const AnalyticsPage = lazy(() => import('./pages/superadmin/AnalyticsPage'));
const FeatureFlagsPage = lazy(() => import('./pages/superadmin/FeatureFlagsPage'));
const ActivityLogsPage = lazy(() => import('./pages/superadmin/ActivityLogsPage'));
const RolesPage = lazy(() => import('./pages/superadmin/RolesPage'));

// Protected Route Component with Onboarding Guard
const PrivateRoute = ({ children }) => {
  const { currentUser, userData, loading, isSuperAdmin } = useAuth();

  if (loading) return <PageLoader />;
  if (!currentUser) return <Navigate to="/login" />;

  // Super admins skip onboarding
  if (!userData?.companyId && !isSuperAdmin) {
    if (window.location.pathname !== '/onboarding') {
      return <Navigate to="/onboarding" />;
    }
  }

  return children;
};

// Super Admin only route
const SuperAdminRoute = ({ children }) => {
  const { currentUser, loading, isSuperAdmin } = useAuth();
  if (loading) return <PageLoader />;
  if (!currentUser) return <Navigate to="/login" />;
  if (!isSuperAdmin) return <Navigate to="/" />;
  return children;
};

const PageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center bg-white/50 backdrop-blur-sm">
    <div className="h-1.5 w-48 overflow-hidden rounded-full bg-slate-100">
      <div className="h-full w-1/3 animate-pulse bg-violet-600 rounded-full"></div>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* ── MARKETING PUBLIC SITE ─────────────────────────────────── */}
            <Route element={<MarketingLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/features" element={<FeaturesPage />} />
              <Route path="/marketing-industries" element={<IndustriesMarketingPage />} />
              <Route path="/industry/:id" element={<IndustryDetailPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/contact" element={<ContactPage />} />
            </Route>

            {/* ── AUTH & TRACKING ───────────────────────────────────────── */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/track-order" element={<TrackOrderPage />} />
            <Route path="/book/:companyId" element={<PublicBookingPage />} />
            <Route path="/onboarding" element={<PrivateRoute><OnboardingPage /></PrivateRoute>} />

            {/* ── SUPER ADMIN PORTAL ────────────────────────────────────── */}
            <Route element={<SuperAdminRoute><SuperAdminLayout /></SuperAdminRoute>}>
              <Route path="/superadmin" element={<SuperAdminDashboard />} />
              <Route path="/superadmin/analytics" element={<AnalyticsPage />} />
              <Route path="/superadmin/industries" element={<IndustriesPage />} />
              <Route path="/superadmin/modules" element={<ModulesPage />} />
              <Route path="/superadmin/templates" element={<TemplatesPage />} />
              <Route path="/superadmin/feature-flags" element={<FeatureFlagsPage />} />
              <Route path="/superadmin/plans" element={<PlansPage />} />
              <Route path="/superadmin/roles" element={<RolesPage />} />
              <Route path="/superadmin/logs" element={<ActivityLogsPage />} />
              <Route path="/companies" element={<CompaniesPage />} />
            </Route>

            {/* ── BUSINESS DASHBOARD ────────────────────────────────────── */}
            <Route element={<PrivateRoute><AppLayout /></PrivateRoute>}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/stock" element={<StockPage />} />
              <Route path="/customers" element={<CustomersPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/orders/create" element={<CreateOrderPage />} />
              <Route path="/invoices/create" element={<CreateInvoicePage />} />
              <Route path="/invoices/view/:id" element={<ViewInvoicePage />} />
              <Route path="/invoices/edit/:id" element={<EditInvoicePage />} />
              <Route path="/estimates/create" element={<CreateEstimatePage />} />
              <Route path="/estimates/view/:id" element={<ViewEstimatePage />} />
              <Route path="/estimates/edit/:id" element={<EditEstimatePage />} />
              <Route path="/pos" element={<POSPage />} />
              <Route path="/estimates" element={<EstimatesPage />} />
              <Route path="/invoices" element={<InvoicesPage />} />
              <Route path="/payments" element={<PaymentsPage />} />
              <Route path="/dispatch" element={<DispatchPage />} />
              <Route path="/automation" element={<AutomationPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/bookings" element={<BookingsPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/staff" element={<StaffManagementPage />} />
              <Route path="/suppliers" element={<SuppliersPage />} />
              <Route path="/integrations" element={<IntegrationsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/settings/templates" element={<InvoiceTemplatesPage />} />
              <Route index element={<Navigate to="/dashboard" replace />} />
            </Route>

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}

export default App;
