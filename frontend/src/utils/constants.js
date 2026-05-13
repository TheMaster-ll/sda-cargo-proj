export const ROLES = {
  ADMIN: 'Admin',
  DISPATCHER: 'Dispatcher',
  CUSTOMER: 'Customer',
  CARRIER: 'CarrierPartner'
};

export const STATUS_COLORS = {
  Pending: { bg: '#f1f5f9', color: '#475569' },
  Confirmed: { bg: '#dbeafe', color: '#1d4ed8' },
  Assigned: { bg: '#dbeafe', color: '#1d4ed8' },
  'Picked Up': { bg: '#cffafe', color: '#0e7490' },
  PickedUp: { bg: '#cffafe', color: '#0e7490' },
  'In Transit': { bg: '#fff7ed', color: '#c2410c' },
  InTransit: { bg: '#fff7ed', color: '#c2410c' },
  Delivered: { bg: '#d1fae5', color: '#047857' },
  Completed: { bg: '#d1fae5', color: '#047857' },
  Cancelled: { bg: '#fee2e2', color: '#dc2626' },
  Delayed: { bg: '#fef9c3', color: '#a16207' },
  Open: { bg: '#dbeafe', color: '#1d4ed8' },
  'Under Review': { bg: '#fff7ed', color: '#c2410c' },
  Approved: { bg: '#d1fae5', color: '#047857' },
  Denied: { bg: '#fee2e2', color: '#dc2626' },
  Settled: { bg: '#d1fae5', color: '#047857' },
  Paid: { bg: '#d1fae5', color: '#047857' },
  Overdue: { bg: '#fee2e2', color: '#dc2626' },
  Active: { bg: '#d1fae5', color: '#047857' },
  Inactive: { bg: '#f1f5f9', color: '#475569' },
  Suspended: { bg: '#fee2e2', color: '#dc2626' },
  Available: { bg: '#d1fae5', color: '#047857' },
  Maintenance: { bg: '#fef9c3', color: '#a16207' }
};

export const TRANSPORT_MODES = ['Air', 'Sea', 'Road'];

export const PACKAGING_TYPES = ['Box', 'Pallet', 'Crate'];

export const SHIPMENT_STATUS_ORDER = ['Created', 'Assigned', 'Picked Up', 'In Transit', 'Delivered'];

export const ROLE_DASHBOARD_ROUTES = {
  Admin: '/admin/dashboard',
  Dispatcher: '/dispatcher/dashboard',
  Customer: '/customer/dashboard',
  CarrierPartner: '/carrier/dashboard'
};

export const SIDEBAR_ITEMS = {
  Customer: [
    { label: 'Dashboard', path: '/customer/dashboard', icon: 'LayoutDashboard' },
    { label: 'Orders', path: '/customer/orders', icon: 'Package' },
    { label: 'Invoices', path: '/customer/invoices', icon: 'Receipt' },
    { label: 'Settings', path: '/settings', icon: 'Settings' }
  ],
  Dispatcher: [
    { label: 'Dashboard', path: '/dispatcher/dashboard', icon: 'LayoutDashboard' },
    { label: 'Orders', path: '/dispatcher/orders', icon: 'Package' },
    { label: 'Shipments', path: '/dispatcher/shipments', icon: 'Truck' },
    { label: 'Fleet', path: '/dispatcher/carriers', icon: 'Users' },
    { label: 'Billing', path: '/dispatcher/billing', icon: 'Receipt' },
    { label: 'Reports', path: '/dispatcher/reports', icon: 'BarChart3' },
    { label: 'Settings', path: '/settings', icon: 'Settings' }
  ],
  Admin: [
    { label: 'Dashboard', path: '/admin/dashboard', icon: 'LayoutDashboard' },
    { label: 'Users', path: '/admin/users', icon: 'Users' },
    { label: 'Carriers', path: '/admin/carriers', icon: 'Truck' },
    { label: 'Orders', path: '/admin/orders', icon: 'Package' },
    { label: 'Rates', path: '/admin/settings', icon: 'DollarSign' },
    { label: 'System Status', path: '/admin/status', icon: 'Activity' }
  ],
  CarrierPartner: [
    { label: 'Dashboard', path: '/carrier/dashboard', icon: 'LayoutDashboard' },
    { label: 'My Shipments', path: '/carrier/shipments', icon: 'Truck' },
    { label: 'Pickups Today', path: '/carrier/pickups', icon: 'ClipboardList' },
    { label: 'Earnings', path: '/carrier/earnings', icon: 'DollarSign' },
    { label: 'Settings', path: '/settings', icon: 'Settings' }
  ]
};
