module.exports = {
  apps: [{
    name: 'carecompany-backend',
    script: 'server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env_file: '.env.production',
    env: {
      NODE_ENV: 'production'
    }
  }]
};