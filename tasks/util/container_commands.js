var constants = require('./constants');

exports.dockerRun = [
    'docker run -di',
    '--name', constants.testContainerName,
    '--volume', constants.pathToRoot + ':' + constants.testContainerHome,
    // save files as local owner
    '--user `id --user`',
    // override container entry point
    '--entrypoint /bin/bash',
    constants.testContainerImage
].join(' ');

exports.getExecCmd = function(isCI, commands) {
    var _commands = Array.isArray(commands) ? commands.slice() : [commands];
    var name = constants.testContainerName;

    if(isCI) {
        _commands = ['export CIRCLECI=1'].concat(_commands);
    }

//         var id = '$(docker inspect --format \'{{.Id}}\' ' + name + ')';
// 
//         return [
//             'sudo', 'lxc-attach',
//             '-n', id,
//             '-f', '/var/lib/docker/containers/' + id + '/config.lxc',
//             '-- bash -c', quoteJoin(_commands)
//         ].join(' ');
//     }
//     else {
        return [
            'docker exec -i', name,
            '/bin/bash -c', quoteJoin(_commands)
        ].join(' ');
//     }
};

function quoteJoin(arr) {
    return '"' + arr.join(' && ') + '"';
}
