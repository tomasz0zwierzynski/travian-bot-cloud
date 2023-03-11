const { exec } = require("child_process");

const env = require('./env.json');

let count = 0;

console.log('Running in loop');
task();
setInterval(() => {
    task();
}, env.intervalInSeconds * 1000);

function task() {
    console.log(`[${new Date()}] running command count #${count++}`);
    exec("node run.js >> logs.txt", (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);     
    });
}