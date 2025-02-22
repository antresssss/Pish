//Main CODE
// popup.js


let port = null;
let lastDetectedUrls = new Set();

document.addEventListener('DOMContentLoaded', () => {
  const normalState = document.getElementById('normal-state');
  const alertContainer = document.getElementById('alert-container');
  const alertTitle = document.getElementById('alert-title');
  const urlsList = document.getElementById('urls-list');
  const viewDetailsBtn = document.getElementById('view-details-btn');
  const exitBtn = document.getElementById('exit-btn');

  // Connect to background script
  port = chrome.runtime.connect({ name: 'popup' });

  // Handle messages from background script
  port.onMessage.addListener((msg) => {
    if (msg.type === 'scanningStatus') {
      updateStatus(msg.detectedUrls || []);
    }
  });

  function updateStatus(detectedUrls) {
    if (detectedUrls.length > 0) {
      normalState.classList.add('hidden');
      alertContainer.classList.remove('hidden');
      
      // Update alert message with current count
      const alertMessage = `${detectedUrls.length} Phishing URL${detectedUrls.length > 1 ? 's' : ''} Detected!`;
      document.getElementById('alert-message').textContent = alertMessage;
      
      // Update URLs list in real-time
      urlsList.innerHTML = Array.from(detectedUrls)
        .map(url => `<div class="url-item">${url}</div>`)
        .join('');

      // Update notification to show current count
      const notificationId = 'phishing-detector';
      chrome.notifications.clear(notificationId, () => {
        chrome.notifications.create(notificationId, {
          type: 'basic',
          iconUrl: 'icon.png',
          title: 'Phishing URLs Detected!',
          message: `Total of ${detectedUrls.length} suspicious URL${detectedUrls.length > 1 ? 's' : ''} found.`,
          priority: 2,
          requireInteraction: true // Keep notification visible
        });
      });
    } else {
      normalState.classList.remove('hidden');
      alertContainer.classList.add('hidden');
    }

    // Update the stored URLs set
    lastDetectedUrls = new Set(detectedUrls);
  }

  // Toggle URL list visibility with current content
  viewDetailsBtn.addEventListener('click', () => {
    urlsList.classList.toggle('visible');
    viewDetailsBtn.textContent = urlsList.classList.contains('visible') ? 'Hide Details' : 'View Details';
  });

  exitBtn.addEventListener('click', () => {
    window.close();
  });

  // Initial status request
  port.postMessage({ action: 'getStatus' });

  port.onDisconnect.addListener(() => {
    console.log('Port disconnected');
    port = null;
  });
});