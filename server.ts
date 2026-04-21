import { createServer } from 'http';
import { Server } from 'socket.io';

const PORT = Number(process.env.SOCKET_PORT ?? 3002);

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: process.env.AUTH_URL ?? 'http://localhost:3001',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log(`[socket] connected: ${socket.id}`);

  socket.on('join-room', (roomId: string) => {
    socket.join(roomId);
    console.log(`[socket] ${socket.id} joined room ${roomId}`);
  });

  socket.on('leave-room', (roomId: string) => {
    socket.leave(roomId);
    console.log(`[socket] ${socket.id} left room ${roomId}`);
  });

  socket.on('message', (data: { roomId: string; message: unknown }) => {
    socket.to(data.roomId).emit('message', data.message);
  });

  socket.on('typing-start', (data: { roomId: string; userName: string }) => {
    socket.to(data.roomId).emit('typing-start', { userName: data.userName });
  });

  socket.on('typing-stop', (data: { roomId: string }) => {
    socket.to(data.roomId).emit('typing-stop');
  });

  socket.on('disconnect', () => {
    console.log(`[socket] disconnected: ${socket.id}`);
  });
});

httpServer.listen(PORT, () => {
  console.log(`[socket] server running on port ${PORT}`);
});
