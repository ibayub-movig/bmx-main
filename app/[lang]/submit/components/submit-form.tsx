'use client';

import { useEffect } from 'react';

function SubmitForm() {
  useEffect(() => {
    // Initialize Fillout embed script
    const script = document.createElement('script');
    script.src = 'https://server.fillout.com/embed/v1/';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div 
      style={{width: '100%', height: '800px'}} 
      data-fillout-id="cxpfeDK39Eus" 
      data-fillout-embed-type="standard" 
      data-fillout-inherit-parameters 
      data-fillout-dynamic-resize
    />
  );
}

// Server component wrapper
export function SubmitFormWrapper() {
  return <SubmitForm />;
}