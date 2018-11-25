import * as fs from 'fs';

function getFiles(dir: string, outFiles: string[] = []) {
    const files = fs.readdirSync(dir);
    for (let index in fs.readdirSync(dir)) {
        const file = `${dir}/${files[index]}`;
        if (fs.statSync(file).isDirectory())
            getFiles(file, outFiles);
        else
            outFiles.push(file);
    }

    return outFiles;
}

const dist = process.argv.indexOf("-dist") >= 0;
const files = getFiles("../..").map(f => f.substr(6)).filter(f => {
    if (f.startsWith("ServiceWorker"))
        return false;

    if (f.indexOf("demo") >= 0 || f.endsWith(".min.css") || f.indexOf("Test") >= 0)
        return false;

    if (f === "websites.html")
        return false;

    if (f.indexOf(".html") > 0) {
        console.log(f);
        return true;
    }

    if (f.endsWith(".js") && (!dist || !f.startsWith("WebComponents"))) {
        console.log(f);
        return true;
    }

    if (f.endsWith(".css") && !f.startsWith("WebComponents")) {
        console.log(f);
        return true;
    }

    return false;
}).map(f => `"${f}"`);

const content = `namespace Vidyano {
    export const vidyanoFiles = [
        ${files.join(",\n        ")}
    ];
}`;

fs.writeFileSync("../service-worker-files.ts", content);