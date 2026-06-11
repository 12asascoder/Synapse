require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const express = require('express');
const cors = require('cors');
const db = require('./models');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/progress', require('./routes/progress'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/curriculum', require('./routes/curriculum'));
app.use('/api/bootcamps', require('./routes/bootcamps'));
app.use('/api/assessments', require('./routes/assessments'));
app.use('/api/achievements', require('./routes/achievements'));
app.use('/api/community', require('./routes/community'));
app.use('/api/users', require('./routes/users'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/passport', require('./routes/passport'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/interview', require('./routes/interview'));

app.get('/health', (req, res) => {
  res.json({ status: 'Synapse Backend Online' });
});

db.sequelize.sync({ alter: true }).then(() => {
  const dialect = process.env.DB_DIALECT || 'sqlite';
  console.log(`[DB] ${dialect.toUpperCase()} database synced successfully.`);
  const http = require('http');
  const { Server } = require('socket.io');
  const server = http.createServer(app);
  const io = new Server(server, { cors: { origin: '*' } });
  app.set('io', io);
  io.on('connection', (socket) => {
    console.log(`[WS] Client connected: ${socket.id}`);
    socket.on('disconnect', () => console.log(`[WS] Client disconnected: ${socket.id}`));
  });
  server.listen(PORT, () => {
    console.log(`[SERVER] Synapse API running on http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error('[DB] Failed to sync database:', err);
});
