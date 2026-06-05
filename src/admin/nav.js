// Single source of truth for admin navigation.
export const NAV = [
  {
    section: 'Sales',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: 'dash' },
      { id: 'pos',       label: 'POS',       icon: 'pos' },
      { id: 'invoices',  label: 'Online Orders', icon: 'invoice', badge: true },
      { id: 'receipts',  label: 'Receipts',  icon: 'receipt' },
      { id: 'refunds',   label: 'Refunds',   icon: 'refund' },
    ],
  },
  {
    section: 'Inventory',
    items: [
      { id: 'products',  label: 'Products',  icon: 'box' },
      { id: 'promos',    label: 'Promos & Bundles', icon: 'tag' },
      { id: 'restock',   label: 'Restock',   icon: 'truck' },
      { id: 'stock',     label: 'Stock & Adjust', icon: 'adjust' },
    ],
  },
  {
    section: 'Business',
    items: [
      { id: 'customers', label: 'Customers', icon: 'users' },
      { id: 'expenses',  label: 'Expenses',  icon: 'expense' },
      { id: 'reports',   label: 'Reports',   icon: 'reports' },
      { id: 'staff',     label: 'Staff',     icon: 'staff' },
    ],
  },
]

export const NAV_FLAT = NAV.flatMap(s => s.items)
