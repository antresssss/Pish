// background.js
//MAIN CODE 

// console.log("Background script is running!");

// let detectedUrls = new Set();
// let ports = new Set();

// const VIRUSTOTAL_API_KEY = 'your key'; // Your VirusTotal API key
// const VIRUSTOTAL_API_URL = 'https://www.virustotal.com/api/v3/urls';
// const GROQ_API_KEY = "your key"; // Your GROQ API key

// // Modified broadcast status function to ensure popup gets updates
// function broadcastStatus() {
//     const urlsArray = Array.from(detectedUrls);
//     // Try to update popup if it's open
//     chrome.runtime.sendMessage({
//         type: 'scanningStatus',
//         detectedUrls: urlsArray
//     });
    
//     // Also send through port connections
//     for (const port of ports) {
//         try {
//             port.postMessage({
//                 type: 'scanningStatus',
//                 detectedUrls: urlsArray
//             });
//         } catch (error) {
//             console.error('Error broadcasting status:', error);
//             ports.delete(port);
//         }
//     }
// }

// // Updated Groq API helper function with correct endpoint and model
// async function makeGroqRequest(messages) {
//     const maxRetries = 3;
//     let retryCount = 0;

//     while (retryCount < maxRetries) {
//         try {
//             const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
//                 method: 'POST',
//                 headers: {
//                     'Authorization': `Bearer ${GROQ_API_KEY}`,
//                     'Content-Type': 'application/json'
//                 },
//                 body: JSON.stringify({
//                     model: "mixtral-8x7b-32768",
//                     messages: messages,
//                     temperature: 0.7,
//                     max_tokens: 100
//                 })
//             });

//             if (!response.ok) {
//                 const errorData = await response.json();
//                 throw new Error(`HTTP error! status: ${response.status}, message: ${JSON.stringify(errorData)}`);
//             }

//             const data = await response.json();
//             return data.choices[0].message.content;
//         } catch (error) {
//             retryCount++;
//             console.error(`Attempt ${retryCount} failed:`, error);
//             if (retryCount === maxRetries) throw error;
//             // Exponential backoff
//             await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
//         }
//     }
//     return null;
// }

// // Test Groq connection with error handling
// async function testGroq() {
//     try {
//         console.log("Testing Groq connection...");
//         const response = await makeGroqRequest([
//             { role: "user", content: "Hello, what is 2+2?" }
//         ]);
//         console.log("Groq API Response:", response);
//         if (response) {
//             console.log("Groq connection successful!");
//         }
//     } catch (error) {
//         console.error("Error connecting to Groq API:", error);
//     }
// }

// // Run initial test
// testGroq();

// // Feature extraction function
// function extractUrlFeatures(url) {
//     const urlObj = new URL(url);
//     return {
//         domainLength: urlObj.hostname.length,
//         numSpecialChars: (urlObj.hostname.match(/[^a-zA-Z0-9.-]/g) || []).length,
//         numDigits: (urlObj.hostname.match(/\d/g) || []).length,
//         hasIPAddress: /\d+\.\d+\.\d+\.\d+/.test(urlObj.hostname),
//         numDots: (urlObj.hostname.match(/\./g) || []).length,
//         pathLength: urlObj.pathname.length,
//         queryLength: urlObj.search.length,
//         hasHTTPS: urlObj.protocol === 'https:',
//         hasMultiSubdomains: urlObj.hostname.split('.').length > 2
//     };
// }

// // Site comparison functions
// async function compareWithOriginalSite(suspectedUrl, originalUrl) {
//     try {
//         const [suspectedResponse, originalResponse] = await Promise.all([
//             fetch(suspectedUrl),
//             fetch(originalUrl)
//         ]);

//         const [suspectedHtml, originalHtml] = await Promise.all([
//             suspectedResponse.text(),
//             originalResponse.text()
//         ]);

//         const similarity = calculateSimilarity(suspectedHtml, originalHtml);
//         return similarity > 0.9;
//     } catch (error) {
//         console.error('Site comparison error:', error);
//         return false;
//     }
// }

// function calculateSimilarity(str1, str2) {
//     const len1 = str1.length;
//     const len2 = str2.length;
//     const matrix = Array(len2 + 1).fill().map(() => Array(len1 + 1).fill(0));

//     for (let i = 0; i <= len1; i++) matrix[0][i] = i;
//     for (let j = 0; j <= len2; j++) matrix[j][0] = j;

//     for (let j = 1; j <= len2; j++) {
//         for (let i = 1; i <= len1; i++) {
//             const substitutionCost = str1[i - 1] === str2[j - 1] ? 0 : 1;
//             matrix[j][i] = Math.min(
//                 matrix[j][i - 1] + 1,
//                 matrix[j - 1][i] + 1,
//                 matrix[j - 1][i - 1] + substitutionCost
//             );
//         }
//     }

//     return 1 - (matrix[len2][len1] / Math.max(len1, len2));
// }

// let urlCache = new Map();

// // Check URL with Groq LLM
// async function checkWithLLM(url) {    
//     if (urlCache.has(url)) {
//         console.log("Using cached result for:", url);
//         return urlCache.get(url);
//     }

//     try {
//         const urlFeatures = extractUrlFeatures(url);
//         const response = await makeGroqRequest([
//             {
//                 role: "user",
//                 content: `Analyze this URL and its features for phishing characteristics:
//                 URL: ${url}
                
//                 Features:
//                 - Domain Length: ${urlFeatures.domainLength}
//                 - Special Characters: ${urlFeatures.numSpecialChars}
//                 - Number of Digits: ${urlFeatures.numDigits}
//                 - Contains IP Address: ${urlFeatures.hasIPAddress}
//                 - Number of Dots: ${urlFeatures.numDots}
//                 - Path Length: ${urlFeatures.pathLength}
//                 - Query Length: ${urlFeatures.queryLength}
//                 - Uses HTTPS: ${urlFeatures.hasHTTPS}
//                 - Multiple Subdomains: ${urlFeatures.hasMultiSubdomains}
                
//                 Return only "suspicious" or "safe"`
//             }
//         ]);

//         const result = response?.toLowerCase().includes("suspicious");
//         urlCache.set(url, result);
//         return result;
        
//     } catch (error) {
//         console.error('Groq API error:', error);
//         return false;
//     }
// }

// // Check URL with VirusTotal API with rate limiting
// async function checkWithVirusTotal(url) {
//     try {
//         // Add delay for rate limiting
//         await new Promise(resolve => setTimeout(resolve, 15000));
        
//         const encodedUrl = encodeURIComponent(url);
//         const submitResponse = await fetch(VIRUSTOTAL_API_URL, {
//             method: 'POST',
//             headers: {
//                 'x-apikey': VIRUSTOTAL_API_KEY,
//                 'accept': 'application/json',
//                 'content-type': 'application/x-www-form-urlencoded'
//             },
//             body: `url=${encodedUrl}`
//         });

//         if (submitResponse.status === 429) {
//             console.log('VirusTotal API rate limit reached, skipping check');
//             return false;
//         }

//         if (!submitResponse.ok) {
//             throw new Error(`URL submission failed: ${submitResponse.status}`);
//         }

//         const submitData = await submitResponse.json();
//         await new Promise(resolve => setTimeout(resolve, 2000));

//         const analysisId = submitData.data.id;
//         const analysisResponse = await fetch(`https://www.virustotal.com/api/v3/analyses/${analysisId}`, {
//             headers: {
//                 'x-apikey': VIRUSTOTAL_API_KEY,
//                 'accept': 'application/json'
//             }
//         });

//         if (!analysisResponse.ok) {
//             throw new Error('Analysis retrieval failed');
//         }

//         const analysisData = await analysisResponse.json();
//         return analysisData.data.attributes.stats.malicious > 0;
//     } catch (error) {
//         console.error('VirusTotal API error:', error);
//         return false;
//     }
// }

// // Handle port connections from popup
// chrome.runtime.onConnect.addListener((port) => {
//     if (port.name === 'popup') {
//         ports.add(port);
        
//         // Send initial status
//         port.postMessage({
//             type: 'scanningStatus',
//             detectedUrls: Array.from(detectedUrls)
//         });

//         port.onMessage.addListener(async (msg) => {
//             if (msg.action === 'getStatus') {
//                 port.postMessage({
//                     type: 'scanningStatus',
//                     detectedUrls: Array.from(detectedUrls)
//                 });
//             }
//             broadcastStatus();
//         });

//         port.onDisconnect.addListener(() => {
//             ports.delete(port);
//         });
//     }
// });

// // Handle messages from content scripts and popup
// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//     if (request.action === 'checkUrls') {
//         checkUrls(request.urls, sender.tab.id).then(() => {
//             broadcastStatus();
//             sendResponse({ success: true });
//         });
//         return true;
//     }
    
//     if (request.action === 'openWarningPage') {
//         chrome.tabs.create({
//             url: `warning.html?url=${encodeURIComponent(request.url)}`
//         });
//         return true;
//     }

//     if (request.action === 'getStatus') {
//         sendResponse({
//             type: 'scanningStatus',
//             detectedUrls: Array.from(detectedUrls)
//         });
//         return true;
//     }
// });

// // Modified checkUrls function to update more frequently
// async function checkUrls(urls, tabId) {
//     let updatedUrls = false;
    
//     for (const url of urls) {
//         // Skip if URL is already detected as suspicious
//         if (detectedUrls.has(url)) continue;

//         // Extract features and perform initial checks
//         const urlFeatures = extractUrlFeatures(url);
        
//         // Quick check for obvious phishing indicators
//         if (urlFeatures.hasIPAddress || urlFeatures.numSpecialChars > 3) {
//             detectedUrls.add(url);
//             highlightUrl(url, tabId);
//             updatedUrls = true;
//             continue;
//         }

//         // Check with Groq LLM first
//         const isLLMPhishing = await checkWithLLM(url);
//         if (isLLMPhishing) {
//             detectedUrls.add(url);
//             highlightUrl(url, tabId);
//             updatedUrls = true;
//             continue;
//         }

//         // If not flagged by Groq LLM, check with VirusTotal
//         const isVirusTotalPhishing = await checkWithVirusTotal(url);
//         if (isVirusTotalPhishing) {
//             detectedUrls.add(url);
//             highlightUrl(url, tabId);
//             updatedUrls = true;
//         }
        
//         // Broadcast status after each detection
//         if (updatedUrls) {
//             broadcastStatus();
//         }
//     }
// }

// // Modified highlightUrl function to ensure popup updates
// function highlightUrl(url, tabId) {
//     chrome.tabs.sendMessage(tabId, {
//         action: 'highlightPhishingUrl',
//         url: url
//     });
    
//     // Try to open popup if not already open
//     chrome.action.openPopup();

//     // Broadcast updated status immediately
//     broadcastStatus();
// }

// // Handle extension install/update
// chrome.runtime.onInstalled.addListener(() => {
//     // Initialize extension state
//     detectedUrls.clear();
// });










console.log("Background script is running!");

let detectedUrls = new Set();
let ports = new Set();
const VIRUSTOTAL_API_KEY = 'your key'; 
const VIRUSTOTAL_API_URL = 'https://www.virustotal.com/api/v3/urls';
const GROQ_API_KEY = "your key";

// Supabase configuration
const supabaseUrl = 'https://gcohsrptxssxhpafwvvj.supabase.co';
const supabaseKey = 'your key'; 

// Function to add URL to Supabase database
async function addUrlToDatabase(url) {
    try {
        const response = await fetch(`${supabaseUrl}/rest/v1/SuspiciousURL`, {
            method: 'POST',
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({ url: url })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('URL added to database:', data);
        return true;
    } catch (error) {
        console.error('Error adding URL to database:', error);
        return false;
    }
}

// Modified broadcast status function to ensure popup gets updates
function broadcastStatus() {
    const urlsArray = Array.from(detectedUrls);
    
    // Update all connected ports
    for (const port of ports) {
        try {
            port.postMessage({
                type: 'scanningStatus',
                detectedUrls: urlsArray
            });
        } catch (error) {
            console.error('Error broadcasting status:', error);
            ports.delete(port);
        }
    }

    // Update notification if needed
    if (urlsArray.length > 0) {
        chrome.notifications.create('phishing-detector', {
            type: 'basic',
            iconUrl: 'icon.png',
            title: 'Phishing URLs Detected!',
            message: `Total of ${urlsArray.length} suspicious URL${urlsArray.length > 1 ? 's' : ''} found.`,
            priority: 2,
            requireInteraction: true
        });
    } else {
        chrome.notifications.clear('phishing-detector');
    }
}

// Updated Groq API helper function with correct endpoint and model
async function makeGroqRequest(messages) {
    const maxRetries = 3;
    let retryCount = 0;

    while (retryCount < maxRetries) {
        try {
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: "mixtral-8x7b-32768",
                    messages: messages,
                    temperature: 0.7,
                    max_tokens: 100
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`HTTP error! status: ${response.status}, message: ${JSON.stringify(errorData)}`);
            }

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            retryCount++;
            console.error(`Attempt ${retryCount} failed:`, error);
            if (retryCount === maxRetries) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
        }
    }
    return null;
}

// Test Groq connection with error handling
async function testGroq() {
    try {
        console.log("Testing Groq connection...");
        const response = await makeGroqRequest([
            { role: "user", content: "Hello, what is 2+2?" }
        ]);
        console.log("Groq API Response:", response);
        if (response) {
            console.log("Groq connection successful!");
        }
    } catch (error) {
        console.error("Error connecting to Groq API:", error);
    }
}

// Run initial test
testGroq();

// Feature extraction function
function extractUrlFeatures(url) {
    const urlObj = new URL(url);
    return {
        domainLength: urlObj.hostname.length,
        numSpecialChars: (urlObj.hostname.match(/[^a-zA-Z0-9.-]/g) || []).length,
        numDigits: (urlObj.hostname.match(/\d/g) || []).length,
        hasIPAddress: /\d+\.\d+\.\d+\.\d+/.test(urlObj.hostname),
        numDots: (urlObj.hostname.match(/\./g) || []).length,
        pathLength: urlObj.pathname.length,
        queryLength: urlObj.search.length,
        hasHTTPS: urlObj.protocol === 'https:',
        hasMultiSubdomains: urlObj.hostname.split('.').length > 2
    };
}

// Site comparison functions
async function compareWithOriginalSite(suspectedUrl, originalUrl) {
    try {
        const [suspectedResponse, originalResponse] = await Promise.all([
            fetch(suspectedUrl),
            fetch(originalUrl)
        ]);

        const [suspectedHtml, originalHtml] = await Promise.all([
            suspectedResponse.text(),
            originalResponse.text()
        ]);

        const similarity = calculateSimilarity(suspectedHtml, originalHtml);
        return similarity > 0.9;
    } catch (error) {
        console.error('Site comparison error:', error);
        return false;
    }
}

function calculateSimilarity(str1, str2) {
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix = Array(len2 + 1).fill().map(() => Array(len1 + 1).fill(0));

    for (let i = 0; i <= len1; i++) matrix[0][i] = i;
    for (let j = 0; j <= len2; j++) matrix[j][0] = j;

    for (let j = 1; j <= len2; j++) {
        for (let i = 1; i <= len1; i++) {
            const substitutionCost = str1[i - 1] === str2[j - 1] ? 0 : 1;
            matrix[j][i] = Math.min(
                matrix[j][i - 1] + 1,
                matrix[j - 1][i] + 1,
                matrix[j - 1][i - 1] + substitutionCost
            );
        }
    }

    return 1 - (matrix[len2][len1] / Math.max(len1, len2));
}

let urlCache = new Map();

// Check URL with Groq LLM
async function checkWithLLM(url) {    
    if (urlCache.has(url)) {
        console.log("Using cached result for:", url);
        return urlCache.get(url);
    }

    try {
        const urlFeatures = extractUrlFeatures(url);
        const response = await makeGroqRequest([
            {
                role: "user",
                content: `Analyze this URL and its features for phishing characteristics:
                URL: ${url}
                
                Features:
                - Domain Length: ${urlFeatures.domainLength}
                - Special Characters: ${urlFeatures.numSpecialChars}
                - Number of Digits: ${urlFeatures.numDigits}
                - Contains IP Address: ${urlFeatures.hasIPAddress}
                - Number of Dots: ${urlFeatures.numDots}
                - Path Length: ${urlFeatures.pathLength}
                - Query Length: ${urlFeatures.queryLength}
                - Uses HTTPS: ${urlFeatures.hasHTTPS}
                - Multiple Subdomains: ${urlFeatures.hasMultiSubdomains}
                
                Return only "suspicious" or "safe"`
            }
        ]);

        const result = response?.toLowerCase().includes("suspicious");
        urlCache.set(url, result);
        return result;
        
    } catch (error) {
        console.error('Groq API error:', error);
        return false;
    }
}

// Check URL with VirusTotal API with rate limiting
async function checkWithVirusTotal(url) {
    try {
        await new Promise(resolve => setTimeout(resolve, 15000));
        
        const encodedUrl = encodeURIComponent(url);
        const submitResponse = await fetch(VIRUSTOTAL_API_URL, {
            method: 'POST',
            headers: {
                'x-apikey': VIRUSTOTAL_API_KEY,
                'accept': 'application/json',
                'content-type': 'application/x-www-form-urlencoded'
            },
            body: `url=${encodedUrl}`
        });

        if (submitResponse.status === 429) {
            console.log('VirusTotal API rate limit reached, skipping check');
            return false;
        }

        if (!submitResponse.ok) {
            throw new Error(`URL submission failed: ${submitResponse.status}`);
        }

        const submitData = await submitResponse.json();
        await new Promise(resolve => setTimeout(resolve, 2000));

        const analysisId = submitData.data.id;
        const analysisResponse = await fetch(`https://www.virustotal.com/api/v3/analyses/${analysisId}`, {
            headers: {
                'x-apikey': VIRUSTOTAL_API_KEY,
                'accept': 'application/json'
            }
        });

        if (!analysisResponse.ok) {
            throw new Error('Analysis retrieval failed');
        }

        const analysisData = await analysisResponse.json();
        return analysisData.data.attributes.stats.malicious > 0;
    } catch (error) {
        console.error('VirusTotal API error:', error);
        return false;
    }
}

// Handle port connections from popup
chrome.runtime.onConnect.addListener((port) => {
    if (port.name === 'popup') {
        ports.add(port);
        
        port.postMessage({
            type: 'scanningStatus',
            detectedUrls: Array.from(detectedUrls)
        });

        port.onMessage.addListener(async (msg) => {
            if (msg.action === 'getStatus') {
                port.postMessage({
                    type: 'scanningStatus',
                    detectedUrls: Array.from(detectedUrls)
                });
            }
            broadcastStatus();
        });

        port.onDisconnect.addListener(() => {
            ports.delete(port);
        });
    }
});

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'checkUrls') {
        checkUrls(request.urls, sender.tab.id).then(() => {
            broadcastStatus();
            sendResponse({ success: true });
        });
        return true;
    }
    
    if (request.action === 'openWarningPage') {
        chrome.tabs.create({
            url: `warning.html?url=${encodeURIComponent(request.url)}`
        });
        return true;
    }

    if (request.action === 'getStatus') {
        sendResponse({
            type: 'scanningStatus',
            detectedUrls: Array.from(detectedUrls)
        });
        return true;
    }

    if (request.action === 'unflagUrl') {
        handleUnflagUrl(request.url).then(success => {
            sendResponse({ success });
        });
        return true; // Required for async response
    }
    // ... your existing message handlers ...
});

// Modified checkUrls function to include database integration
async function checkUrls(urls, tabId) {
    let updatedUrls = false;
    
    for (const url of urls) {
        if (detectedUrls.has(url)) continue;

        const urlFeatures = extractUrlFeatures(url);
        
        if (urlFeatures.hasIPAddress || urlFeatures.numSpecialChars > 3) {
            detectedUrls.add(url);
            await addUrlToDatabase(url); // Add to database
            highlightUrl(url, tabId);
            updatedUrls = true;
            continue;
        }

        const isLLMPhishing = await checkWithLLM(url);
        if (isLLMPhishing) {
            detectedUrls.add(url);
            await addUrlToDatabase(url); // Add to database
            highlightUrl(url, tabId);
            updatedUrls = true;
            continue;
        }

        const isVirusTotalPhishing = await checkWithVirusTotal(url);
        if (isVirusTotalPhishing) {
            detectedUrls.add(url);
            await addUrlToDatabase(url); // Add to database
            highlightUrl(url, tabId);
            updatedUrls = true;
        }
        
        if (updatedUrls) {
            broadcastStatus();
        }
    }
}

// Store the current notification ID
let currentNotificationId = 'phishing-alert';

// Modified highlightUrl function
function highlightUrl(url, tabId) {
    chrome.tabs.sendMessage(tabId, {
        action: 'highlightPhishingUrl',
        url: url
    });

    chrome.action.openPopup();
    broadcastStatus();
}

// Handle extension install/update
chrome.runtime.onInstalled.addListener(() => {
    detectedUrls.clear();
});

// Add this new function to handle unflagging
async function handleUnflagUrl(url) {
    try {
        // Remove from Supabase database
        const response = await fetch(`${supabaseUrl}/rest/v1/SuspiciousURL?url=eq.${encodeURIComponent(url)}`, {
            method: 'DELETE',
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to delete URL from database: ${response.status}`);
        }

        // Remove from local Set
        detectedUrls.delete(url);

        // Remove highlighting from all tabs
        const tabs = await chrome.tabs.query({});
        for (const tab of tabs) {
            try {
                await chrome.tabs.sendMessage(tab.id, {
                    action: 'removeHighlight',
                    url: url
                });
            } catch (error) {
                console.log(`Could not send message to tab ${tab.id}`);
            }
        }

        // Broadcast updated status
        broadcastStatus();
        return true;

    } catch (error) {
        console.error('Error unflagging URL:', error);
        return false;
    }
}