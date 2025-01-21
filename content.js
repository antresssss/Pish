function scanForUrls() {
    // Get all links from the page
    const links = document.getElementsByTagName('a');
    const urls = Array.from(links).map(link => link.href);
    
    // Send URLs to background script for checking
    chrome.runtime.sendMessage({
      action: 'checkUrls',
      urls: urls
    });
  }
  
  // Highlight suspicious URL
  function highlightUrl(element) {
    element.style.backgroundColor = '#ffff00';
    element.style.textDecoration = 'underline wavy red';
  }
  
  // Listen for messages from background script
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'highlightPhishingUrl') {
      const links = document.getElementsByTagName('a');
      for (let link of links) {
        if (link.href === request.url) {
          highlightUrl(link);
          
          // Add click event listener
          link.addEventListener('click', (e) => {
            e.preventDefault();
            chrome.runtime.sendMessage({
              action: 'openWarningPage',
              url: link.href
            });
          });
        }
      }
    }
  });
  
  // Start scanning when page loads
  scanForUrls();