/**
 * Configuración de PM2 para gestión de procesos en producción
 * PM2 es un gestor de procesos para aplicaciones Node.js
 */
module.exports = {
    apps: [
      {
        name: 'tatoodenda-api',
        script: 'dist/server.js',
        instances: 'max',
        exec_mode: 'cluster',
        autorestart: true,
        watch: false,
        max_memory_restart: '1G',
        env: {
          NODE_ENV: 'development'
        },
        env_production: {
          NODE_ENV: 'production'
        },
        env_test: {
          NODE_ENV: 'test'
        },
        // Logs
        log_date_format: 'YYYY-MM-DD HH:mm:ss',
        error_file: './logs/pm2-error.log',
        out_file: './logs/pm2-out.log',
        merge_logs: true,
        // Monitoreo
        max_restarts: 10,
        restart_delay: 3000,
        // Opciones de despliegue
        deploy: {
          production: {
            user: 'node',
            host: ['your-production-server'],
            ref: 'origin/main',
            repo: 'git@github.com:usuario/tatoodenda-backend.git',
            path: '/var/www/tatoodenda',
            'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production'
          }
        }
      }
    ]
  };