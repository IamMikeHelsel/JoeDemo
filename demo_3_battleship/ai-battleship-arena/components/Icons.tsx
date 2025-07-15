
import React from 'react';

export const FireIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M12.963 2.286a.75.75 0 00-1.071 1.071l9 9a.75.75 0 001.071-1.071l-9-9z" clipRule="evenodd" />
    <path fillRule="evenodd" d="M10.93 2.286a.75.75 0 00-1.071-1.071l-9 9a.75.75 0 001.071 1.071l9-9z" clipRule="evenodd" />
  </svg>
);

export const WaterIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
  </svg>
);

export const SkullIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M11.996 2.251a2.25 2.25 0 011.696.726l5.503 5.504a2.25 2.25 0 01.726 1.695V18a2.25 2.25 0 01-2.25 2.25h-3.812a4.5 4.5 0 00-3.58 1.593l-.001.002a4.5 4.5 0 00-3.578-1.595H3.75A2.25 2.25 0 011.5 18V10.176a2.25 2.25 0 01.726-1.696l5.503-5.503a2.25 2.25 0 011.696-.726zM9.75 12a.75.75 0 01.75-.75h3a.75.75 0 010 1.5h-3a.75.75 0 01-.75-.75zm0 3a.75.75 0 01.75-.75h3a.75.75 0 010 1.5h-3a.75.75 0 01-.75-.75z" clipRule="evenodd" />
    </svg>
);

export const RotateIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.664 0l3.18-3.185m-3.181 9.348c-3.236 0-6.23-1.34-8.364-3.523l-3.18-3.182m0-4.991l3.182-3.182a8.25 8.25 0 0111.664 0l3.18 3.185" />
    </svg>
);
