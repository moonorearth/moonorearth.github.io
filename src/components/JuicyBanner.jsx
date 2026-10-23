import { useEffect, useRef } from 'react';

export default function JuicyBanner({ zoneId, width, height }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clear any existing content to prevent duplicates on re-render
    container.innerHTML = '';

    // 1. Create the <ins> tag required by JuicyAds
    const ins = document.createElement('ins');
    ins.id = zoneId;
    ins.setAttribute('data-width', width);
    ins.setAttribute('data-height', height);
    container.appendChild(ins);

    // 2. Create the main external jads.js script
    const mainScript = document.createElement('script');
    mainScript.type = 'text/javascript';
    mainScript.setAttribute('data-cfasync', 'false');
    mainScript.async = true;
    mainScript.src = 'https://poweredby.jads.co/js/jads.js';
    container.appendChild(mainScript);

    // 3. Create the push configuration script
    const pushScript = document.createElement('script');
    pushScript.type = 'text/javascript';
    pushScript.setAttribute('data-cfasync', 'false');
    pushScript.async = true;
    pushScript.text = `(adsbyjuicy = window.adsbyjuicy || []).push({'adzone':${zoneId}});`;
    container.appendChild(pushScript);

    // Cleanup when component unmounts
    return () => {
      container.innerHTML = '';
    };
  }, [zoneId, width, height]);

  return (
    <div className="juicy-ad-wrapper my-3 flex justify-center overflow-hidden">
      <div ref={containerRef} />
    </div>
  );
}
