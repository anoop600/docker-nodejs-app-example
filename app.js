const express = require('express');
const os = require('os');
const moment = require('moment');
const axios = require('axios');
const process = require('process');

// Get environment variables
const port = process.env.PORT || 3000;
const bgColor = process.env.BG_COLOR || 'white';

// Initialize Express app
const app = express();

// Function to get IP address
const getIPAddress = () => {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const net of interfaces[name]) {
            if (net.family === 'IPv4' && !net.internal) {
                return net.address;
            }
        }
    }
    return 'Unknown';
};

// Function to get OS name based on platform
const getOSName = (platform) => ({
    'linux': 'Linux',
    'darwin': 'macOS',
    'win32': 'Windows'
}[platform] || 'Unknown');

// System Information
const systemInfo = {
    hostname: os.hostname(),
    ipAddress: getIPAddress(),
    platform: os.platform(),
    release: os.release(),
    architecture: os.arch(),
    totalMemory: `${(os.totalmem() / (1024 * 1024 * 1024)).toFixed(2)} GB`,
    freeMemory: `${(os.freemem() / (1024 * 1024 * 1024)).toFixed(2)} GB`,
    osName: getOSName(os.platform())
};

// Predefined list of fallback quotes
const fallbackQuotes = [
    "The only limit to our realization of tomorrow is our doubts of today. - Franklin D. Roosevelt",
    "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
    "Do not watch the clock. Do what it does. Keep going. - Sam Levenson",
    "Keep your face always toward the sunshine—and shadows will fall behind you. - Walt Whitman",
    "The best way to predict the future is to create it. - Peter Drucker"
];

// Serve the index page
app.get('/', (req, res) => {
    res.send(`
        <html>
            <head>
                <style>
                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }

                    @keyframes slideIn {
                        from { transform: translateY(-50px); opacity: 0; }
                        to { transform: translateY(0); opacity: 1; }
                    }

                    body {
                        background-color: ${bgColor};
                        color: #333333;
                        font-family: Arial, sans-serif;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        margin: 0;
                        animation: fadeIn 2s ease-in-out;
                    }

                    .container {
                        text-align: center;
                        padding: 20px;
                        border-radius: 8px;
                        background-color: rgba(255, 255, 255, 0.8);
                        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                        animation: slideIn 1s ease-out;
                    }

                    h1 {
                        font-size: 2.5em;
                        margin-bottom: 10px;
                        animation: slideIn 1s ease-out 0.3s;
                        animation-fill-mode: both;
                    }

                    h2 {
                        font-size: 1.5em;
                        margin-bottom: 20px;
                        animation: slideIn 1s ease-out 0.5s;
                        animation-fill-mode: both;
                    }

                    p {
                        font-size: 1.2em;
                        margin: 5px 0;
                        animation: fadeIn 2s ease-in-out 0.7s;
                        animation-fill-mode: both;
                    }

                    .container:hover {
                        transform: scale(1.05);
                        transition: transform 0.3s ease-in-out;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>System Information</h1>
                    <h2>Hostname: ${systemInfo.hostname}</h2>
                    <h2>IP Address: ${systemInfo.ipAddress}</h2>
                    <p>Platform: ${systemInfo.platform} (${systemInfo.osName})</p>
                    <p>Release: ${systemInfo.release}</p>
                    <p>Architecture: ${systemInfo.architecture}</p>
                    <p>Total Memory: ${systemInfo.totalMemory}</p>
                    <p>Free Memory: ${systemInfo.freeMemory}</p>
                    <p>This page is served from a simple Node.js application.</p>
                    <p>Background color is set based on an environment variable.</p>
                    <p>This app also includes four additional endpoints:</p>
                    <p><strong>/api/time:</strong> Returns the current server time.</p>
                    <p><strong>/api/random:</strong> Returns a random number.</p>
                    <p><strong>/api/quote:</strong> Returns a random quote from an online API.</p>
                    <p><strong>/api/secret:</strong> Returns the value of an environment variable if set.</p>
                    <p><strong>/api/envKeys:</strong> Lists all environment variable keys.</p>
                </div>
            </body>
        </html>
    `);
});

// API Endpoint 1: Current Server Time
app.get('/api/time', (req, res) => {
    res.json({ time: moment().format('YYYY-MM-DD HH:mm:ss') });
});

// API Endpoint 2: Random Number Generator
app.get('/api/random', (req, res) => {
    res.json({ randomNumber: Math.floor(Math.random() * 10000) + 1 });
});

// API Endpoint 3: Random Quote Generator
app.get('/api/quote', async (req, res) => {
    try {
        const response = await axios.get('https://api.quotable.io/random');
        res.json({ quote: `${response.data.content} - ${response.data.author}` });
    } catch (error) {
        console.error('Error fetching quote:', error);
        const randomQuote = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
        res.json({ quote: randomQuote });
    }
});
// API Endpoint 4: Respond with environment variable value
app.get('/api/secret', (req, res) => {
     const { varName } = req.query;
     if (!varName) {
         return res.status(400).json({ error: 'varName query parameter is required' });
     }
     const envValue = process.env[varName];
     if (envValue) {
         res.json({ [varName]: envValue });
     } else {
         res.json({ message: 'env not set' });
     }
 });

// API Endpoint: List All Environment Variable Keys
app.get('/api/envKeys', (req, res) => {
    const envKeys = Object.keys(process.env);
    res.json({ keys: envKeys });
});

// Start the server
const server = app.listen(port, () => {
    console.log(`Server is running on http://${systemInfo.hostname}:${port}`);
    console.log(`Background color is set to: ${bgColor}`);
});

// Signal handling for graceful shutdown
const gracefulShutdown = (signal) => {
    console.log(`Received ${signal}. Gracefully shutting down...`);
    server.close(() => {
        console.log('Closed out remaining connections.');
        process.exit(0);
    });

    // Force shutdown after 10 seconds if not complete
    setTimeout(() => {
        console.error('Forcefully shutting down.');
        process.exit(1);
    }, 10000);
};

// Listen for PM2 and other system signals
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGQUIT', () => gracefulShutdown('SIGQUIT'));
