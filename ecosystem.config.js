// ecosystem.config.cjs
module.exports = {
  apps: [
    {
      name: "portifolio-back",
      cwd: __dirname,
      script: "yarn",
      args: "start",
      exec_mode: "fork",
      instances: 1,
      autorestart: true,
      watch: false,
      env: { NODE_ENV: "production" },
    },
  ],
};
