require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./models');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/progress', require('./routes/progress'));
app.use('/api/chat', require('./routes/chat'));

// Basic Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'Synapse Backend Online', version: '1.0.0' });
});

// Sync Database and Start Server
db.sequelize.sync({ alter: true }).then(() => {
  console.log('[DB] SQLite Database synced successfully.');
  const http = require('http');
  const server = http.createServer(app);
  server.listen(PORT, () => {
    console.log(`[SERVER] Synapse API running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('[DB] Failed to sync database:', err);
});
