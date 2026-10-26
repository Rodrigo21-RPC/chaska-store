import React from 'react';
const paths = {
  search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></>,
  bag: <><path d="M5 7h14l1 14H4L5 7Z" /><path d="M8 8V6a4 4 0 0 1 8 0v2" /></>,
  store: <><path d="M3 10 5 3h14l2 7M4 10v11h16V10M9 21v-7h6v7M3 10c0 3 4 3 4 0 0 3 5 3 5 0 0 3 5 3 5 0 0 3 4 3 4 0" /></>,
  cart: <><path d="M2 3h3l3 12h11l3-9H6M10 3v6m-3-3h6" /><circle cx="9" cy="20" r="1" /><circle cx="19" cy="20" r="1" /></>,
  arrow: <path d="m14 5-7 7 7 7M7 12h14" />,
  user: <><circle cx="12" cy="7" r="4" /><path d="M4 21c0-10 16-10 16 0Z" /></>,
  upload: <><path d="M7 17H5a4 4 0 0 1-1-8 8 8 0 0 1 15-1 5 5 0 0 1 0 10h-2M12 22V10m-4 4 4-4 4 4" /></>,
  whatsapp: <><path d="M21 11a9 9 0 0 1-13 8l-5 2 1-5A9 9 0 1 1 21 11Z" /><path d="M8 7c0 6 3 8 8 9l1-3-3-1-1 1-2-2 1-1-2-3Z" /></>,
};
export default function Icon({ name, ...props }) { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name]}</svg>; }
