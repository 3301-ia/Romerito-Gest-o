const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { startEmailListener } = require('./emailListener');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const DB_FILE = path.join(__dirname, 'database.json');

// Helper to read DB
function readDB() {
    try {
        if (!fs.existsSync(DB_FILE)) {
            return {};
        }
        const data = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (e) {
        console.error("Error reading database.json:", e);
        return {};
    }
}

// Helper to write DB
function writeDB(data) {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 4));
        return true;
    } catch (e) {
        console.error("Error writing database.json:", e);
        return false;
    }
}

// GET /data
app.get('/data', (req, res) => {
    const data = readDB();
    res.json(data);
});

// POST /sync
app.post('/sync', (req, res) => {
    const newState = req.body;
    if (newState && typeof newState === 'object') {
        const success = writeDB(newState);
        if (success) {
            res.json({ status: 'ok', message: 'Database synced successfully' });
        } else {
            res.status(500).json({ status: 'error', message: 'Failed to write to database' });
        }
    } else {
        res.status(400).json({ status: 'error', message: 'Invalid payload' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`[Romerito Backend] Server running on http://localhost:${PORT}`);
    
    // Iniciar a escuta de e-mails em segundo plano
    startEmailListener();
});
