// PM2 process manager config — used in production on the server
// Start with: pm2 start ecosystem.config.cjs
// Reload with: pm2 reload amd-learning-platform

module.exports = {
  apps: [
    {
      name: "amd-learning-platform",
      script: "dist/index.js",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      // Auto-restart on crash
      restart_delay: 3000,
      max_restarts: 10,
      // Log files
      out_file: "logs/out.log",
      error_file: "logs/error.log",
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss",
    },
  ],
};
