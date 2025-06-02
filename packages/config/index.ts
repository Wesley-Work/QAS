export * from '@qas/client/src/router/routerMaps';

export const config = {
  socket: {
    url: 'ws://localhost:3000',
    reConnectLimit: 5,
    reConnectInterval: 5000,
    heartbeatInterval: 30000,
  },
};

export default config;

export const socketUrl = config.socket.url;
export const socketReConnectLimit = config.socket.reConnectLimit;
export const socketReConnectInterval = config.socket.reConnectInterval;
export const socketHeartbeatInterval = config.socket.heartbeatInterval;
