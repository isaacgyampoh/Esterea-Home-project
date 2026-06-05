// Consistent 24x24 stroke icons. Use: <Icon name="dash" />
const P = {
  dash:     'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z',
  pos:      'M3 3h18v4H3zM3 7v13a1 1 0 001 1h16a1 1 0 001-1V7M8 11h8',
  invoice:  'M6 2h9l5 5v15H6zM15 2v5h5M9 13h6M9 17h4',
  receipt:  'M6 2h12v20l-3-2-3 2-3-2-3 2zM9 7h6M9 11h6',
  refund:   'M3 12a9 9 0 109-9 9 9 0 00-9 9M3 12V7M3 12h5',
  box:      'M21 8l-9-5-9 5 9 5 9-5zM3 8v8l9 5 9-5V8M12 13v8',
  tag:      'M20 12l-8 8-9-9V3h8zM7 7h.01',
  truck:    'M1 5h13v11H1zM14 8h5l3 3v5h-8M5 19a2 2 0 11-4 0 2 2 0 014 0M19 19a2 2 0 11-4 0 2 2 0 014 0',
  adjust:   'M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6',
  users:    'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75',
  expense:  'M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6',
  reports:  'M3 3v18h18M7 16l4-4 3 3 5-6',
  staff:    'M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6zM9 12l2 2 4-4',
  menu:     'M3 6h18M3 12h18M3 18h18',
  store:    'M3 9l1.5-5h15L21 9M3 9v11a1 1 0 001 1h16a1 1 0 001-1V9M3 9h18M9 21v-6h6v6',
  out:      'M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9',
  x:        'M18 6L6 18M6 6l12 12',
  plus:     'M12 5v14M5 12h14',
  search:   'M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.35-4.35',
  edit:     'M11 4H4v16h16v-7M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4z',
  trash:    'M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6',
  chev:     'M9 6l6 6-6 6',
  check:    'M20 6L9 17l-5-5',
  print:    'M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5h20v5a2 2 0 01-2 2h-2M6 14h12v8H6z',
  download: 'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3',
  cart:     'M9 22a1 1 0 100-2 1 1 0 000 2M20 22a1 1 0 100-2 1 1 0 000 2M1 1h4l2.7 13.4a2 2 0 002 1.6h9.7a2 2 0 002-1.6L23 6H6',
  alert:    'M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0M12 9v4M12 17h.01',
  pkg:      'M16.5 9.4L7.5 4.2M21 16V8a2 2 0 00-1-1.7l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.7l7 4a2 2 0 002 0l7-4A2 2 0 0021 16zM3.3 7L12 12l8.7-5M12 22V12',
}

export default function Icon({ name, size = 18, className, style }) {
  const d = P[name]
  if (!d) return null
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d={d} />
    </svg>
  )
}
