module.exports = {
  apps: [
    {
      name: 'bajram-server',
      script: './dist/main.js',
      args: 'start',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
