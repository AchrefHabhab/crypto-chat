import { Server as SocketServer } from 'socket.io';
import type { Server as HttpServer } from 'http';

let io: SocketServer | null = null;

export function getSocketServer(httpServer?: HttpServer): SocketServer {
  if (io) return io;

  if (!httpServer) {
    throw new Error('HTTP server required for initial Socket.io setup');
  }

  io = new SocketServer(httpServer, {
    path: '/api/socketio',
    cors: {
      origin: process.env.AUTH_URL ?? 'http://localhost:3001',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    socket.on('join-room', (roomId: string) => {
      socket.join(roomId);
    });

    socket.on('leave-room', (roomId: string) => {
      socket.leave(roomId);
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
      socket.rooms.forEach((room) => {
        socket.to(room).emit('user-left', { socketId: socket.id });
      });
    });
  });

  return io;
}
