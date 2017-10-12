var constants = require('./util/constants');
var common = require('./util/common');

var arg = process.argv[2];
var name = constants.testContainerName;
var msg, cmd, cb, errorCb;

switch(arg) {
    case 'pull':
        msg = 'Pulling latest docker image';
        cmd = 'docker pull ' + constants.testContainerImage;
        break;

    case 'run':
        msg = 'Booting up ' + name + ' docker container';

        cmd = [
            'docker run -di',
            '--name', name,
            '--volume', constants.pathToRoot + ':' + constants.testContainerHome,
            // save files as local owner
            '--user `id --user`',
            // override container entry point
            '--entrypoint /bin/bash',
            constants.testContainerImage
        ].join(' ');

        // if docker-run fails, try docker-start.
        errorCb = function(err) {
            if(err) {
                common.execCmd('docker start ' + name);
            }
        };
        break;

    case 'stop':
        msg = 'Stopping ' + name + ' docker container';
        cmd = 'docker stop ' + name;
        break;

    case 'remove':
        msg = 'Removing ' + name + ' docker container';
        cmd = 'docker rm ' + name;
        break;

    default:
        console.log('Usage: pull, run, stop, remove');
        process.exit(0);
        break;
}

console.log(msg);
common.execCmd(cmd, cb, errorCb);
