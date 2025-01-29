
// popup.js
let port = null;

document.addEventListener('DOMContentLoaded', () => {
  const statusElement = document.getElementById('status');
  const startButton = document.getElementById('start');
  const stopButton = document.getElementById('stop');
  const exitButton = document.getElementById('exit');

  // Connect to background script
  port = chrome.runtime.connect({ name: 'popup' });

  // Handle messages from background script
  port.onMessage.addListener((msg) => {
    if (msg.type === 'scanningStatus') {
      updateStatus(msg.isScanning, msg.detectedUrls || []);
    }
  });

  function updateStatus(isScanning, detectedUrls) {
    if (isScanning) {
      if (detectedUrls.length > 0) {
        statusElement.innerHTML = `
          <p class="warning">⚠️ Detected ${detectedUrls.length} suspicious URL${detectedUrls.length > 1 ? 's' : ''}:</p>
          <ul style="text-align: left; max-height: 100px; overflow-y: auto;">
            ${detectedUrls.map(url => `<li style="word-break: break-all;">${url}</li>`).join('')}
          </ul>
        `;
      } else {
        statusElement.textContent = 'Actively scanning... No suspicious URLs detected';
      }
      startButton.disabled = true;
      stopButton.disabled = false;
    } else {
      statusElement.textContent = 'Scanning is paused';
      startButton.disabled = false;
      stopButton.disabled = true;
    }
  }

  startButton.addEventListener('click', () => {
    port.postMessage({ action: 'startScanning' });
  });

  stopButton.addEventListener('click', () => {
    port.postMessage({ action: 'stopScanning' });
  });

  // Enhanced exit button functionality
  exitButton.addEventListener('click', () => {
    // Add ripple effect
    const ripple = document.createElement('div');
    ripple.style.position = 'absolute';
    ripple.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
    ripple.style.borderRadius = '50%';
    ripple.style.width = '100px';
    ripple.style.height = '100px';
    ripple.style.transform = 'translate(-50%, -50%)';
    ripple.style.animation = 'ripple 0.6s linear';
    
    exitButton.appendChild(ripple);
    
    // Send exit message and close after animation
    setTimeout(() => {
      port.postMessage({ action: 'exitExtension' });
      chrome.tabs.query({ active: true, currentWindow: true }, () => {
        window.close();
      });
    }, 200);
  });

  // Request initial status
  port.postMessage({ action: 'getStatus' });
});

// Add to background.js (add this to your existing background.js)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'exitExtension') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'cleanup' });
        chrome.runtime.reload();
      }
    });
    return true;
  }
});








/*document.addEventListener('DOMContentLoaded', () => {
  const statusElement = document.getElementById('status');
  const startButton = document.getElementById('start');
  const stopButton = document.getElementById('stop');
  const exitButton = document.getElementById('exit');

  // Connect to the background script
  const port = chrome.runtime.connect({ name: 'popup' });

  // Handle messages from the background script
  port.onMessage.addListener((msg) => {
    if (msg.type === 'scanningStatus') {
      updateStatus(msg.isScanning); // Update the popup UI based on scanning status
    }
  });

  // Function to update the popup status and button states
  function updateStatus(isScanning) {
    if (isScanning) {
      statusElement.textContent = 'Actively scanning...';
      startButton.classList.add('hidden');
      stopButton.classList.remove('hidden');
    } else {
      statusElement.textContent = 'Scanning is paused';
      startButton.classList.remove('hidden');
      stopButton.classList.add('hidden');
    }
  }

  // Start scanning
  startButton.addEventListener('click', () => {
    port.postMessage({ action: 'startScanning' }); // Notify the background script to start scanning
    statusElement.textContent = 'Resuming scanning...';
  });

  // Stop scanning
  stopButton.addEventListener('click', () => {
    port.postMessage({ action: 'stopScanning' }); // Notify the background script to stop scanning
    statusElement.textContent = 'Pausing scanning and reverting page to normal...';
  });

  // Exit the extension
  exitButton.addEventListener('click', () => {
    port.postMessage({ action: 'exitExtension' }); // Notify the background script to exit
    chrome.tabs.query({ active: true, currentWindow: true }, () => {
      window.close(); // Close the popup window
    });
  });

  // Request the initial scanning status on popup load
  port.postMessage({ action: 'getStatus' });
});*/
