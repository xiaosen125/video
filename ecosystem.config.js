module.exports = {
  apps: [
    {
      name: 'video',
      script: './app.js',
      watch: false,
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
};
