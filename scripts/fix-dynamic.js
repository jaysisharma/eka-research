const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    if (!fs.existsSync(dir)) return results;
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if (file.endsWith('route.ts') || file.endsWith('route.tsx') || file.endsWith('page.tsx') || file.endsWith('page.ts')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk(path.join(__dirname, '../app/api'));
let count = 0;
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    // If it's an API route without dynamic config that might be evaluated statically (has GET() without req)
    if (content.includes('export async function GET()') && !content.includes('export const dynamic')) {
        content = 'export const dynamic = "force-dynamic";\n' + content;
        fs.writeFileSync(file, content);
        console.log("Fixed default static GET route:", file);
        count++;
    }
});
console.log("Fixed", count, "files.");
