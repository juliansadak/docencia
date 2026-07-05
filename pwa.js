(function () {
  // Obtener la URL base del sitio
  const baseUrl = window.location.origin + '/';
  const manifestUrl = baseUrl + 'manifest.json';
  const serviceWorkerUrl = baseUrl + 'service-worker.js';
  const iconUrl = baseUrl + 'logo.png';

  const manifestLink = document.querySelector('link[rel="manifest"]');
  if (manifestLink) {
    manifestLink.href = manifestUrl;
  } else {
    const link = document.createElement('link');
    link.rel = 'manifest';
    link.href = manifestUrl;
    document.head.appendChild(link);
  }

  const appleTouchIconLink = document.querySelector('link[rel="apple-touch-icon"]');
  if (appleTouchIconLink) {
    appleTouchIconLink.href = iconUrl;
  } else {
    const link = document.createElement('link');
    link.rel = 'apple-touch-icon';
    link.href = iconUrl;
    document.head.appendChild(link);
  }

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register(serviceWorkerUrl).catch((error) => {
        console.error('PWA SW: Fallo.', error);
      });
    });
  }

  let deferredPrompt = null;
  const installButtons = Array.from(document.querySelectorAll('[id*="install"], [data-pwa-install]'));
  const installCard = document.getElementById('pwa-install-card');

  const showInstallCard = () => {
    if (installCard) {
      installCard.classList.remove('hidden');
    }
    installButtons.forEach((button) => {
      button.classList.remove('hidden');
    });
  };

  const triggerInstall = async () => {
    if (!deferredPrompt) {
      return;
    }

    if (installCard) {
      installCard.classList.add('hidden');
    }

    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
  };

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event;
    showInstallCard();
  });

  installButtons.forEach((button) => {
    button.addEventListener('click', triggerInstall);
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    if (installCard) {
      installCard.classList.add('hidden');
    }
  });
})();
