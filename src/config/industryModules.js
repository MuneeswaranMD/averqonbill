export const ALL_INDUSTRIES = [
    { 
        id: 'retail', 
        name: 'Retail Store', 
        icon: '🛍️', 
        color: 'from-blue-500 to-blue-600',
        description: 'Products, POS billing and inventory management',
        modules: ['Dashboard', 'Products', 'Inventory', 'POS Billing', 'Customers', 'Orders', 'Invoices', 'Payments', 'Reports', 'Suppliers'],
        status: 'active'
    },
    { 
        id: 'wholesale', 
        name: 'Wholesale', 
        icon: '🚚', 
        color: 'from-emerald-500 to-emerald-600',
        description: 'Bulk orders, suppliers and delivery tracking',
        modules: ['Dashboard', 'Products', 'Bulk Orders', 'Inventory', 'Suppliers', 'Purchase Orders', 'Invoices', 'Delivery', 'Reports'],
        status: 'active'
    },
    { 
        id: 'tours', 
        name: 'Tours & Travels', 
        icon: '✈️', 
        color: 'from-sky-500 to-sky-600',
        description: 'Destinations, packages and booking management',
        modules: ['Dashboard', 'Destinations', 'Tour Packages', 'Bookings', 'Customers', 'Payments', 'Schedules', 'Agents', 'Reports'],
        status: 'active'
    },
    { 
        id: 'service', 
        name: 'Service Business', 
        icon: '🔧', 
        color: 'from-violet-500 to-violet-600',
        description: 'Appointments, staff and service billing',
        modules: ['Dashboard', 'Services', 'Appointments', 'Customers', 'Invoices', 'Payments', 'Staff', 'Reports'],
        status: 'active'
    },
    { 
        id: 'construction', 
        name: 'Construction', 
        icon: '🏗️', 
        color: 'from-amber-500 to-amber-600',
        description: 'Projects, materials and labor tracking',
        modules: ['Dashboard', 'Projects', 'Materials', 'Labor', 'Customers', 'Invoices', 'Payments', 'Reports'],
        status: 'active'
    },
    { 
        id: 'restaurant', 
        name: 'Restaurant / Food', 
        icon: '🍽️', 
        color: 'from-red-500 to-red-600',
        description: 'Menu management, table orders and billing',
        modules: ['Dashboard', 'Products', 'Orders', 'Customers', 'Payments', 'Staff', 'Reports'],
        status: 'active'
    },
    { 
        id: 'freelancer', 
        name: 'Freelancer', 
        icon: '💻', 
        color: 'from-pink-500 to-pink-600',
        description: 'Projects, time tracking and invoicing',
        modules: ['Dashboard', 'Services', 'Projects', 'Customers', 'Time Tracking', 'Invoices', 'Payments', 'Reports'],
        status: 'active'
    },
    { 
        id: 'ecommerce', 
        name: 'E-commerce', 
        icon: '🛒', 
        color: 'from-indigo-500 to-indigo-600',
        description: 'Online store, orders and shipping management',
        modules: ['Dashboard', 'Products', 'Inventory', 'Orders', 'Customers', 'Invoices', 'Payments', 'Reports'],
        status: 'active'
    },
    { 
        id: 'manufacturing', 
        name: 'Manufacturing', 
        icon: '🏭', 
        color: 'from-orange-500 to-orange-600',
        description: 'Production, materials and order management',
        modules: ['Dashboard', 'Products', 'Materials', 'Inventory', 'Orders', 'Invoices', 'Payments', 'Reports'],
        status: 'active'
    },
];

export const ALL_MODULES = [
    { id: 'Dashboard', icon: 'LayoutDashboard', description: 'Main business overview' },
    { id: 'Products', icon: 'Package', description: 'Product and service catalog' },
    { id: 'Inventory', icon: 'Layers', description: 'Stock levels and tracking' },
    { id: 'POS Billing', icon: 'Zap', description: 'Point of sale terminal' },
    { id: 'Orders', icon: 'ShoppingCart', description: 'Sales order management' },
    { id: 'Customers', icon: 'Users', description: 'CRM and customer history' },
    { id: 'Invoices', icon: 'Receipt', description: 'Billing and PDF invoices' },
    { id: 'Payments', icon: 'DollarSign', description: 'Accounts receivable tracking' },
    { id: 'Reports', icon: 'BarChart3', description: 'Business analytics data' },
    { id: 'Suppliers', icon: 'Truck', description: 'Vendor management' },
    { id: 'Delivery', icon: 'Truck', description: 'Dispatch and logistics' },
    { id: 'Bookings', icon: 'Calendar', description: 'Reservation management' },
    { id: 'Staff', icon: 'Users2', description: 'Employee and user management' },
    { id: 'Projects', icon: 'FolderKanban', description: 'Project tracking' },
    { id: 'Automation', icon: 'Cpu', description: 'n8n workflow triggers' },
    { id: 'Notifications', icon: 'Bell', description: 'Push and email alerts' },
    { id: 'CRM', icon: 'Target', description: 'Sales pipeline and leads' },
    { id: 'API Access', icon: 'Code2', description: 'External integration keys' },
    { id: 'Bulk Orders', icon: 'PackagePlus', description: 'Wholesale transactions' },
    { id: 'Purchase Orders', icon: 'ShoppingBag', description: 'Procurement management' },
    { id: 'Time Tracking', icon: 'Clock', description: 'Labor hour logging' },
    { id: 'Materials', icon: 'Box', description: 'Raw material inventory' },
    { id: 'Labor', icon: 'HardHat', description: 'Workforce management' },
    { id: 'Schedules', icon: 'CalendarClock', description: 'Roster and planning' },
    { id: 'Destinations', icon: 'MapPin', description: 'Travel locations' },
    { id: 'Tour Packages', icon: 'Globe', description: 'Travel bundles' },
];

export const DEFAULT_MODULES_BY_INDUSTRY = ALL_INDUSTRIES.reduce((acc, ind) => {
    acc[ind.id] = ind.modules;
    return acc;
}, {});
