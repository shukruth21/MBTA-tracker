import React, { useState, useEffect } from 'react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    console.log(`User ${outcome === 'accepted' ? 'accepted' : 'dismissed'} install prompt`);
    
    setDeferredPrompt(null);
    setShowInstall(false);
  };

  if (!showInstall) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: '#003082',
      color: 'white',
      padding: '12px 20px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      zIndex: 1000,
      maxWidth: '90%'
    }}>
      <span style={{ fontSize: '14px' }}>Install app for quick access</span>
      <button
        onClick={handleInstall}
        style={{
          background: 'white',
          color: '#003082',
          border: 'none',
          padding: '6px 16px',
          borderRadius: '6px',
          fontWeight: '600',
          cursor: 'pointer'
        }}
      >
        Install
      </button>
      <button
        onClick={() => setShowInstall(false)}
        style={{
          background: 'transparent',
          color: 'white',
          border: 'none',
          padding: '6px',
          cursor: 'pointer',
          fontSize: '18px'
        }}
      >
        ✕
      </button>
    </div>
  );
}