const args = process.argv.slice(2);

let localDirectory, remoteDirectory, tempDirectory, projectDirectory, host, username, privateKey;

// Start Configuration
switch (args[0]) {
    case 'dev':
        localDirectory = "dist/it-mgmt-dev";
        remoteDirectory = "/var/lib/docker/volumes/app-claims-dev"
        tempDirectory = "temp";
        projectDirectory = "_data";
        host = "10.2.1.105"
        port = 22;
        username = "root"
        privateKey = 'C:/Users/bat-eha/.ssh/dockerserver'
        break;
    case 'prod':
        localDirectory = "dist/it-mgmt-prod";
        remoteDirectory = "/var/www"
        tempDirectory = "temp";
        projectDirectory = "claims2";
        host = "10.2.1.88"
        port = 22;
        username = "root"
        privateKey = 'C:/Users/bat-eha/.ssh/sih_prod'
        break;
    default:
}
// End Configuration

let path, NodeSSH, ssh, fs

fs = require('fs')
path = require('path')
NodeSSH = require('node-ssh').NodeSSH
moment = require('moment');
ssh = new NodeSSH()
zipAFolder = require('zip-a-folder');

async function connect() {

    // count files to zip
    let filesCount = 0;
    const countFilesRecursively = (directory) => {
        const filesInDirectory = fs.readdirSync(directory);
        for (const file of filesInDirectory) {
            const absolute = path.join(directory, file);
            if (fs.statSync(absolute).isDirectory()) {
                countFilesRecursively(absolute);
            } else {
                filesCount++;
            }
        }
    };
    countFilesRecursively(localDirectory);
    console.log('Zipping ' + filesCount + " files");

    // create zip file
    await zipAFolder.zip(localDirectory, 'archive.zip');

    let stats = fs.statSync("archive.zip")
    let fileSizeInMegabytes = stats.size / (1024 * 1024);
    console.log('Build zipped to ' + fileSizeInMegabytes.toFixed(2) + ' MB');

    // connect to server
    await ssh.connect({
        host: host,
        port: port,
        username: username,
        privateKeyPath: privateKey,
    });

    const start = new Date();

    // copy zip file
    await ssh.putFile('archive.zip', remoteDirectory + '/archive.zip', null, {
        step: (total_transferred, chunk, total) => {
            process.stdout.write('\rUploaded ' + (total_transferred / (1024 * 1024)).toFixed(2) + ' MB (' + (total_transferred / (1024 * 1024) / fileSizeInMegabytes * 100).toFixed() + "%)")
        }
    });
    process.stdout.write('\n');

    // extract zip and delete
    const extractZip = await ssh.execCommand('sudo unzip archive.zip -d ' + tempDirectory + " && rm archive.zip", {cwd: remoteDirectory});
    if (extractZip.stderr) console.log('STDERR: ' + extractZip.stderr)
    console.log('Extracted zip to', tempDirectory);

    const date = moment().format("YYYYMMDD_HH:mm");
    const backupDirectory = projectDirectory + '_' + date;

    // create backup of old project directory
    const renameOld = await ssh.execCommand('sudo mv ' + projectDirectory + ' ' + backupDirectory, {cwd: remoteDirectory});
    if (renameOld.stderr) console.log('STDERR: ' + renameOld.stderr)
    console.log('Renamed', projectDirectory, 'to', backupDirectory);

    // rename temp directory to project directory name
    const renameNew = await ssh.execCommand('sudo mv ' + tempDirectory + ' ' + projectDirectory, {cwd: remoteDirectory});
    if (renameNew.stderr) console.log('STDERR: ' + renameNew.stderr)
    console.log('Renamed temp to', projectDirectory);

    // move data from backup directory to project directory
    const moveData = await ssh.execCommand('sudo mv ' + backupDirectory + '/data ' + projectDirectory, {cwd: remoteDirectory});
    if (moveData.stderr) console.log('STDERR: ' + moveData.stderr)
    console.log('Moved data directory');

    // delete local zip file
    fs.unlinkSync('archive.zip');

    // log duration
    const end = new Date();
    const diff = (end - start) / 1000;
    console.log('Duration', diff, 'sec');

    process.exit()
}

connect();
