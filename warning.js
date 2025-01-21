function proceedToSite() {
    const urlParams = new URLSearchParams(window.location.search);
    const suspiciousUrl = urlParams.get('url');
    if (suspiciousUrl) {
      window.location.href = suspiciousUrl;
    }
  }
  
  document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const suspiciousUrl = urlParams.get('url');
    document.getElementById('suspicious-url').textContent = suspiciousUrl || 'Unknown URL';
  });