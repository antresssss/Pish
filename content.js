//content.js
//THIS IS THE MAIN CODE

// // Global variable to track scanning status
// let isScanning = true;
// let notificationElement = null;

// // Function to create and inject notification HTML
// function createNotificationElement() {
//   const notification = document.createElement('div');
//   notification.id = 'phishing-alert-notification';
//   notification.innerHTML = `
//     <div class="notification-header">
//       <span class="warning-icon">⚠️</span>
//       <span class="notification-title">Scanning for phishing...</span>
//       <button class="close-button">✕</button>
//     </div>
//     <div class="notification-content">
//       <button class="view-details-button">View Details ▶</button>
//       <div class="urls-list" style="display: none;">
//         <ul></ul>
//       </div>
//     </div>
//   `;
  
//   // Add styles
//   const styles = document.createElement('style');
//   styles.textContent = `
//     #phishing-alert-notification {
//       position: fixed;
//       top: 20px;
//       right: 20px;
//       width: 350px;
//       background: white;
//       border: 2px solid #ff4444;
//       border-radius: 8px;
//       box-shadow: 0 4px 12px rgba(0,0,0,0.15);
//       z-index: 2147483647;
//       font-family: Arial, sans-serif;
//       display: none;
//     }
    
//     .notification-header {
//       background: #ff4444;
//       color: white;
//       padding: 12px;
//       display: flex;
//       align-items: center;
//       justify-content: space-between;
//       border-top-left-radius: 6px;
//       border-top-right-radius: 6px;
//     }
    
//     .notification-title {
//       font-weight: bold;
//       margin: 0 10px;
//       flex-grow: 1;
//     }
    
//     .close-button {
//       background: none;
//       border: none;
//       color: white;
//       cursor: pointer;
//       font-size: 16px;
//       padding: 0 5px;
//     }
    
//     .notification-content {
//       padding: 12px;
//     }
    
//     .view-details-button {
//       width: 100%;
//       text-align: left;
//       padding: 8px;
//       background: none;
//       border: none;
//       color: #ff4444;
//       cursor: pointer;
//       font-weight: bold;
//     }
    
//     .urls-list {
//       margin-top: 8px;
//       max-height: 200px;
//       overflow-y: auto;
//     }
    
//     .urls-list ul {
//       list-style: none;
//       padding: 0;
//       margin: 0;
//     }
    
//     .urls-list li {
//       padding: 8px;
//       border-left: 3px solid #ff4444;
//       margin: 5px 0;
//       background: #fff5f5;
//       word-break: break-all;
//       font-size: 13px;
//     }
//   `;
  
//   document.head.appendChild(styles);
//   document.body.appendChild(notification);
  
//   // Add event listeners
//   const closeBtn = notification.querySelector('.close-button');
//   closeBtn.addEventListener('click', () => {
//     notification.style.display = 'none';
//   });
  
//   const viewDetailsBtn = notification.querySelector('.view-details-button');
//   const urlsList = notification.querySelector('.urls-list');
//   viewDetailsBtn.addEventListener('click', () => {
//     const isExpanded = urlsList.style.display !== 'none';
//     urlsList.style.display = isExpanded ? 'none' : 'block';
//     viewDetailsBtn.textContent = `View Details ${isExpanded ? '▶' : '▼'}`;
//   });
  
//   return notification;
// }

// // Function to update notification
// function updateNotification(urls) {
//   if (!notificationElement) {
//     notificationElement = createNotificationElement();
//   }
  
//   const title = notificationElement.querySelector('.notification-title');
//   const urlsList = notificationElement.querySelector('.urls-list ul');
  
//   // Update title and content
//   title.textContent = urls.length === 1 
//     ? "1 Phishing Website Detected!" 
//     : `${urls.length} Phishing Websites Detected!`;
    
//   // Update URLs list
//   urlsList.innerHTML = urls.map(url => `<li>${url}</li>`).join('');
  
//   // Show notification
//   notificationElement.style.display = 'block';
// }

// // Function to extract all the URLs on the page
// function getUrlsFromPage() {
//   let urls = [];
  
//   // Access the DOM to get all anchor tags (<a>) on the page
//   let links = document.querySelectorAll('a');

//   // Iterate through each link and extract the 'href' attribute (URL)
//   links.forEach(link => {
//     if (link.href) {
//       urls.push(link.href);
//     }
//   });

//   // Also check for buttons or elements with click events and data attributes containing URLs
//   let elements = document.querySelectorAll('[onclick], [data-href], [data-url]');
//   elements.forEach(element => {
//     if (element.getAttribute('onclick')) {
//       const match = element.getAttribute('onclick').match(/https?:\/\/[^"'\s]+/);
//       if (match) {
//         urls.push(match[0]);
//       }
//     }
//     if (element.dataset.href) {
//       urls.push(element.dataset.href);
//     }
//     if (element.dataset.url) {
//       urls.push(element.dataset.url);
//     }
//   });

//   return urls;
// }

// // Function to scan for URLs on the page and send them for checking
// function scanForUrls() {
//   // Get all URLs from the page using `getUrlsFromPage`
//   const urls = getUrlsFromPage();

//   // Send URLs to the background script for checking
//   if (urls.length > 0) {
//     chrome.runtime.sendMessage({
//       action: 'checkUrls',
//       urls: urls
//     });
//   }
// }

// // Function to highlight a specific URL element
// function highlightUrl(element) {
//   element.style.backgroundColor = '#ffff00';
//   element.style.textDecoration = 'underline wavy red';
// }

// // Function to remove all highlights
// function removeHighlights() {
//   const links = document.querySelectorAll('a');
//   links.forEach(link => {
//     link.style.removeProperty('background-color');
//     link.style.removeProperty('color');
//     link.style.removeProperty('border');
//     link.style.removeProperty('padding');
//   });

//   const elements = document.querySelectorAll('[onclick], [data-href], [data-url]');
//   elements.forEach(element => {
//     element.style.removeProperty('background-color');
//     element.style.removeProperty('color');
//     element.style.removeProperty('border');
//     element.style.removeProperty('padding');
//   });
// }

// // Listen for messages from the background script
// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   if (request.action === 'highlightPhishingUrl') {
//     const links = document.getElementsByTagName('a');
//     for (let link of links) {
//       if (link.href === request.url) {
//         highlightUrl(link);
        
//         // Get all detected URLs from background script
//         chrome.runtime.sendMessage({ action: 'getDetectedUrls' }, (response) => {
//           if (response && response.urls) {
//             updateNotification(response.urls);
//           }
//         });
        
//         // Add a click event listener to show a warning
//         link.addEventListener('click', (e) => {
//           e.preventDefault();
//           // Create custom warning notification
//           const warningNotification = document.createElement('div');
//           warningNotification.style.position = 'fixed';
//           warningNotification.style.top = '20%';
//           warningNotification.style.left = '50%';
//           warningNotification.style.transform = 'translate(-50%, -50%)';
//           warningNotification.style.backgroundColor = '#fff';
//           warningNotification.style.border = '2px solid red';
//           warningNotification.style.padding = '20px';
//           warningNotification.style.borderRadius = '5px';
//           warningNotification.style.zIndex = '9999';
//           warningNotification.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
//           warningNotification.style.minWidth = '300px';
//           warningNotification.style.textAlign = 'center';
          
//           warningNotification.innerHTML = `
//             <h3 style="color: red; margin-top: 0;">⚠️ Phishing Alert!</h3>
//             <p>This URL appears to be suspicious and may be a phishing attempt.</p>
//             <p style="font-weight: bold;">${link.href}</p>
//             <div style="display: flex; justify-content: space-around; margin-top: 15px;">
//               <button id="proceed-btn" style="padding: 8px 15px; background-color: #f44336; color: white; border: none; border-radius: 3px; cursor: pointer;">Proceed Anyway</button>
//               <button id="cancel-btn" style="padding: 8px 15px; background-color: #4CAF50; color: white; border: none; border-radius: 3px; cursor: pointer;">Cancel</button>
//             </div>
//           `;
          
//           document.body.appendChild(warningNotification);
          
//           // Add event listeners to buttons
//           document.getElementById('proceed-btn').addEventListener('click', () => {
//             document.body.removeChild(warningNotification);
//             window.location.href = link.href;
//           });
          
//           document.getElementById('cancel-btn').addEventListener('click', () => {
//             document.body.removeChild(warningNotification);
//           });
//         });
//       }
//     }
//   } else if (request.action === 'cleanup') {
//     cleanup();
//   }
// });

// // Function to clean up
// function cleanup() {
//   if (notificationElement) {
//     document.body.removeChild(notificationElement);
//     notificationElement = null;
//   }
//   removeHighlights();
// }

// // Start initial scan when the page loads
// scanForUrls();

// // Set up periodic scanning on scroll
// let lastScanTime = 0;
// document.addEventListener('scroll', () => {
//     let now = Date.now();
//     if (now - lastScanTime > 30000) { // Scan every 30 seconds max
//         scanForUrls();
//         lastScanTime = now;
//     }
// });







//MAIN WORKING CODE IG THE HIGHLIGHT ALL URLS ISNT THERE 



let isScanning = true;

// Function to extract all the URLs on the page
function getUrlsFromPage() {
  let urls = [];
  
  // Access the DOM to get all anchor tags (<a>) on the page
  let links = document.querySelectorAll('a');

  // Iterate through each link and extract the 'href' attribute (URL)
  links.forEach(link => {
    if (link.href) {
      urls.push(link.href);
    }
  });

  // Also check for buttons or elements with click events and data attributes containing URLs
  let elements = document.querySelectorAll('[onclick], [data-href], [data-url]');
  elements.forEach(element => {
    if (element.getAttribute('onclick')) {
      const match = element.getAttribute('onclick').match(/https?:\/\/[^"'\s]+/);
      if (match) {
        urls.push(match[0]);
      }
    }
    if (element.dataset.href) {
      urls.push(element.dataset.href);
    }
    if (element.dataset.url) {
      urls.push(element.dataset.url);
    }
  });

  return urls;
}

// Function to scan for URLs on the page and send them for checking
function scanForUrls() {
  // Get all URLs from the page using `getUrlsFromPage`
  const urls = getUrlsFromPage();

  // Send URLs to the background script for checking
  if (urls.length > 0) {
    chrome.runtime.sendMessage({
      action: 'checkUrls',
      urls: urls
    });
  }

  // Highlight all URLs
  //highlightAllUrls();
}

// Function to highlight a specific URL element
function highlightUrl(element) {
  element.style.backgroundColor = '#ffff00';
  element.style.textDecoration = 'underline wavy red';
}

// Function to highlight all URLs on the screen with neon yellow
/*function highlightAllUrls() {
  const links = document.querySelectorAll('a');
  links.forEach(link => {
    link.style.backgroundColor = 'neonyellow';
    link.style.color = 'yellow';
    link.style.border = '1px solid black';
    link.style.padding = '2px';
  });

  const elements = document.querySelectorAll('[onclick], [data-href], [data-url]');
  elements.forEach(element => {
    element.style.backgroundColor = 'neonyellow';
    element.style.color = 'yellow';
    element.style.border = '1px solid black';
    element.style.padding = '2px';
  });
}*/

// Function to remove all highlights
function removeHighlights() {
  const links = document.querySelectorAll('a');
  links.forEach(link => {
    link.style.removeProperty('background-color');
    link.style.removeProperty('color');
    link.style.removeProperty('border');
    link.style.removeProperty('padding');
  });

  const elements = document.querySelectorAll('[onclick], [data-href], [data-url]');
  elements.forEach(element => {
    element.style.removeProperty('background-color');
    element.style.removeProperty('color');
    element.style.removeProperty('border');
    element.style.removeProperty('padding');
  });
}

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'highlightPhishingUrl') {
    const links = document.getElementsByTagName('a');
    for (let link of links) {
      if (link.href === request.url) {
        highlightUrl(link);
        
        // Add a click event listener to show a warning page
        link.addEventListener('click', (e) => {
          e.preventDefault();
          // Create custom notification
          const notification = document.createElement('div');
          notification.style.position = 'fixed';
          notification.style.top = '20%';
          notification.style.left = '50%';
          notification.style.transform = 'translate(-50%, -50%)';
          notification.style.backgroundColor = '#fff';
          notification.style.border = '2px solid red';
          notification.style.padding = '20px';
          notification.style.borderRadius = '5px';
          notification.style.zIndex = '9999';
          notification.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
          notification.style.minWidth = '300px';
          notification.style.textAlign = 'center';
          
          notification.innerHTML = `
            <h3 style="color: red; margin-top: 0;">⚠️ Phishing Alert!</h3>
            <p>This URL appears to be suspicious and may be a phishing attempt.</p>
            <p style="font-weight: bold;">${link.href}</p>
            <div style="display: flex; justify-content: space-around; margin-top: 15px;">
              <button id="proceed-btn" style="padding: 8px 15px; background-color: #f44336; color: white; border: none; border-radius: 3px; cursor: pointer;">Proceed Anyway</button>
              <button id="cancel-btn" style="padding: 8px 15px; background-color: #4CAF50; color: white; border: none; border-radius: 3px; cursor: pointer;">Cancel</button>
            </div>
          `;
          
          document.body.appendChild(notification);
          
          // Add event listeners to buttons
          document.getElementById('proceed-btn').addEventListener('click', () => {
            document.body.removeChild(notification);
            window.location.href = link.href;
          });
          
          document.getElementById('cancel-btn').addEventListener('click', () => {
            document.body.removeChild(notification);
          });
        });
      }
    }
  }
});

// Start initial scan when the page loads
scanForUrls();

// Set up periodic scanning
//setInterval(scanForUrls, 5000); // Scan every 5 seconds changed this to try for better cpu usage 
let lastScanTime = 0;
document.addEventListener('scroll', () => {
    let now = Date.now();
    if (now - lastScanTime > 30000) { // Scan every 30 seconds max
        scanForUrls();
        lastScanTime = now;
    }
});

