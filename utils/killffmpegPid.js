const { spawn } = require('child_process');

function killProcessByPid(pid) {
  if (pid) {
    const os = require('os');

    if (os.platform() === 'win32') {
      const wmic = spawn('wmic', ['process', 'get', 'ProcessId']);

      let processExists = false;

      wmic.stdout.on('data', (data) => {
        const lines = data.toString().split('\n');
        lines.forEach((line) => {
          if (line.trim() === pid.toString()) {
            processExists = true;
          }
        });
      });

      wmic.on('close', (code) => {
        if (processExists) {
          // 终止进程
          const taskkill = spawn('taskkill', ['/F', '/PID', pid.toString()]);

          taskkill.on('close', (code) => {
            if (code === 0) {
              console.log(`进程${pid}已终止`);
            } else {
              console.error(`进程${pid}终止失败`);
            }
          });
        } else {
          // console.log(`进程${pid}不存在`);
        }
      });
    } else if (os.platform() === 'linux') {
      // 使用ps命令检查进程是否存在
      const ps = spawn('ps', ['-p', pid.toString(), '-o', 'pid=']);

      let processExists = false;

      ps.stdout.on('data', (data) => {
        const lines = data.toString().split('\n');
        lines.forEach((line) => {
          if (line.trim() === pid.toString()) {
            processExists = true;
          }
        });
      });

      ps.on('close', (code) => {
        if (processExists) {
          // 终止进程
          const kill = spawn('kill', ['-9', pid.toString()]);

          kill.on('close', (code) => {
            if (code === 0) {
              console.log(`进程${pid}已终止`);
            } else {
              console.error(`进程${pid}终止失败`);
            }
          });
        } else {
          // console.log(`进程${pid}不存在`);
        }
      });
    }
  }
}

module.exports = { killProcessByPid };
