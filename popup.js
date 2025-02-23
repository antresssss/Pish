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

      // Update URLs list with unflag buttons
      urlsList.innerHTML = Array.from(detectedUrls)
        .map(url => `
          <div class="url-item flex justify-between items-center p-2">
            <span class="url-text flex-grow">${url}</span>
            <button class="unflag-btn bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded ml-2"
                    data-url="${url}">
              Unflag
            </button>
          </div>
        `).join('');

      // Add event listeners to unflag buttons
      document.querySelectorAll('.unflag-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const url = e.target.dataset.url;
          const success = await unflagUrl(url);
          if (success) {
            // Remove URL from list and update UI
            const urlItem = e.target.closest('.url-item');
            urlItem.remove();
            
            // Update detectedUrls count
            if (urlsList.children.length === 0) {
              normalState.classList.remove('hidden');
              alertContainer.classList.add('hidden');
            }
          }
        });
      });

      // Update notification
      const notificationId = 'phishing-detector';
      chrome.notifications.clear(notificationId, () => {
        chrome.notifications.create(notificationId, {
          type: 'basic',
          iconUrl: 'icon.png',
          title: 'Phishing Alert!!',
          message: `Total of ${detectedUrls.length} suspicious URL${detectedUrls.length > 1 ? 's' : ''} found.`,
          priority: 2,
          requireInteraction: true // Keep notification visible
        });
      });
    } else {
      normalState.classList.remove('hidden');
      alertContainer.classList.add('hidden');
    }

    lastDetectedUrls = new Set(detectedUrls);
  }

  // Update the unflagUrl function in popup.js
  async function unflagUrl(url) {
    try {
        // Send unflag request to background script
        const response = await chrome.runtime.sendMessage({
            action: 'unflagUrl',
            url: url
        });

        if (response.success) {
            // Remove URL from local list
            const urlItem = document.querySelector(`[data-url="${url}"]`).closest('.url-item');
            if (urlItem) {
                urlItem.remove();
            }

            // Update UI if no URLs left
            if (document.querySelectorAll('.url-item').length === 0) {
                normalState.classList.remove('hidden');
                alertContainer.classList.add('hidden');
            }

            // Update the alert message count
            const remainingUrls = document.querySelectorAll('.url-item').length;
            if (remainingUrls > 0) {
                const alertMessage = `${remainingUrls} Phishing URL${remainingUrls > 1 ? 's' : ''} Detected!`;
                document.getElementById('alert-message').textContent = alertMessage;
            }
        }
        return response.success;
    } catch (error) {
        console.error('Error unflagging URL:', error);
        return false;
    }
  }

  // Toggle URL list visibility
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