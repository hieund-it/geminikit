const fs = require('fs');

function updateStatus(filePath, taskDescription, newStatusChar) {
    if (!fs.existsSync(filePath)) {
        console.error(`Error: File not found: ${filePath}`);
        process.exit(1);
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split(/\r?\n/);
    
    let updated = false;
    const escapedDesc = taskDescription.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const taskRegex = new RegExp(`^(\\s*-\\s*\\[)([xX ]?)(\\]\\s+)(${escapedDesc})(\\s*.*)$`, 'i');

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const match = line.match(taskRegex);
        
        if (match) {
            lines[i] = `${match[1]}${newStatusChar}${match[3]}${match[4]}${match[5]}`;
            updated = true;
            break;
        }
    }

    if (updated) {
        fs.writeFileSync(filePath, lines.join('\n'), 'utf-8');
        console.log(`Successfully updated task: "${taskDescription}" to [${newStatusChar}]`);
    } else {
        console.error(`Error: Task not found: "${taskDescription}"`);
        process.exit(1);
    }
}

const planFilePath = process.argv[2];
const taskDescription = process.argv[3];
const newStatusChar = process.argv[4] || 'x';

if (!planFilePath || !taskDescription) {
    console.error('Usage: node update_status.js <path_to_plan_file> <task_description> [status_char]');
    process.exit(1);
}

updateStatus(planFilePath, taskDescription, newStatusChar);
