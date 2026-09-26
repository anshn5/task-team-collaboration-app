const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { Server } = require('socket.io');

const connectDB = require('./config/db');

// Routes
const authRoutes = require('./routes/authRoutes');
const teamRoutes = require('./routes/teamRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const commentRoutes = require('./routes/commentRoutes');

// Socket.IO helper
const { setIO } = require('./socket');

dotenv.config();

connectDB();

const app = express();


// =====================================================
// SECURITY
// =====================================================

app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL,
  })
);

app.use(
  express.json({
    limit: '10kb',
  })
);


// =====================================================
// RATE LIMITING
// =====================================================

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use('/api', limiter);


// =====================================================
// API ROUTES
// =====================================================

app.use('/api/auth', authRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/comments', commentRoutes);


// =====================================================
// HEALTH CHECK
// =====================================================

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Task Collaboration API is running',
  });
});


// =====================================================
// HTTP SERVER
// =====================================================

const PORT = process.env.PORT || 5000;

const httpServer = http.createServer(app);


// =====================================================
// SOCKET.IO
// =====================================================

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// Make the Socket.IO instance available
// to controllers through socket.js
setIO(io);


// =====================================================
// SOCKET CONNECTION
// =====================================================

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);


  // ---------------------------------------------------
  // JOIN PROJECT ROOM
  // ---------------------------------------------------

  socket.on('join_project', (projectId) => {
    if (!projectId) {
      return;
    }

    const roomName = `project_${projectId}`;

    socket.join(roomName);

    console.log(
      `${socket.id} joined ${roomName}`
    );
  });


  // ---------------------------------------------------
  // LEAVE PROJECT ROOM
  // ---------------------------------------------------

  socket.on('leave_project', (projectId) => {
    if (!projectId) {
      return;
    }

    const roomName = `project_${projectId}`;

    socket.leave(roomName);

    console.log(
      `${socket.id} left ${roomName}`
    );
  });


  // ---------------------------------------------------
  // JOIN TASK ROOM
  // ---------------------------------------------------

  socket.on('join_task', (taskId) => {
    if (!taskId) {
      return;
    }

    const roomName = `task_${taskId}`;

    socket.join(roomName);

    console.log(
      `${socket.id} joined ${roomName}`
    );
  });


  // ---------------------------------------------------
  // LEAVE TASK ROOM
  // ---------------------------------------------------

  socket.on('leave_task', (taskId) => {
    if (!taskId) {
      return;
    }

    const roomName = `task_${taskId}`;

    socket.leave(roomName);

    console.log(
      `${socket.id} left ${roomName}`
    );
  });


  // ---------------------------------------------------
  // DISCONNECT
  // ---------------------------------------------------

  socket.on('disconnect', () => {
    console.log(
      `Socket disconnected: ${socket.id}`
    );
  });
});


// =====================================================
// START SERVER
// =====================================================

httpServer.listen(PORT, () => {
  console.log(
    `Server running on http://localhost:${PORT}`
  );

  console.log(
    `Socket.IO running on http://localhost:${PORT}`
  );
});


// =====================================================
// EXPORT
// =====================================================

module.exports = {
  io,
};