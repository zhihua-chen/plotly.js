var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;

var constants = require('./constants');
var containerCommands = require('./container_commands');

exports.execCmd = function(cmd, cb, errorCb) {
    cb = cb ? cb : function() {};
    errorCb = errorCb ? errorCb : function(err) { if(err) throw err; };

    exec(cmd, function(err) {
        errorCb(err);
        cb();
    })
    .stdout.pipe(process.stdout);
};

exports.writeFile = function(filePath, content, cb) {
    fs.writeFile(filePath, content, function(err) {
        if(err) throw err;
        if(cb) cb();
    });
};

exports.doesDirExist = function(dirPath) {
    try {
        if(fs.statSync(dirPath).isDirectory()) return true;
    }
    catch(e) {
        return false;
    }

    return false;
};

exports.doesFileExist = function(filePath) {
    try {
        if(fs.statSync(filePath).isFile()) return true;
    }
    catch(e) {
        return false;
    }

    return false;
};

exports.formatTime = function(date) {
    return [
        date.toLocaleDateString(),
        date.toLocaleTimeString(),
        date.toString().match(/\(([A-Za-z\s\u4E00-\u9FCC].*)\)/)[1]  // fix Chinese datetime string error. #1630
    ].join(' ');
};

exports.getTimeLastModified = function(filePath) {
    if(!exports.doesFileExist(filePath)) {
        throw new Error(filePath + ' does not exist');
    }

    var stats = fs.statSync(filePath);
    var formattedTime = exports.formatTime(stats.mtime);

    return formattedTime;
};

exports.touch = function(filePath) {
    fs.closeSync(fs.openSync(filePath, 'w'));
};

exports.throwOnError = function(err) {
    if(err) throw err;
};

exports.testImageWrapper = function(opts) {
    var isCI = Boolean(process.env.CIRCLECI);
    var useLocalElectron = Boolean(process.env.LOCAL_ELECTRON);

    var msg = [
        'Running ' + opts.msg + ' using build/plotly.js from',
        exports.getTimeLastModified(constants.pathToPlotlyBuild),
        '\n'
    ].join(' ');

    var args = opts.args.join(' ');
    var pathToElectron;
    var pathToScript;
    var cmd;
    var errorCb;

    if(useLocalElectron) {
        try {
            pathToElectron = require('electron');
        } catch(e) {
            throw new Error('electron not installed');
        }

        pathToScript = path.join(constants.pathToImageTest, opts.script);
        cmd = [pathToElectron, pathToScript, args].join(' ');
        errorCb = function(err) {
            if(err) process.exit(err.code);
        };
    }
    else {
        pathToElectron = [
            'xvfb-run',
            '--server-args \'-screen 0, 1024x768x24\'',
            constants.testContainerHome + '/../node_modules/.bin/electron'
        ].join(' ');

        pathToScript = path.join('plotly.js', 'test', 'image', opts.script);

        cmd = containerCommands.getExecCmd(
            isCI,
            [pathToElectron, pathToScript, args].join(' ')
        );

        errorCb = function(err) {
            if(/Xvfb failed to start/.test(err)) {
                // in case Xvfb port was not closed, kill Xvfb and run cmd again
                var pKill = containerCommands.getExecCmd(isCI, 'pkill Xvfb');
                exports.execCmd(pKill, function() { exports.execCmd(cmd); });
            } else if(err) {
                process.exit(err.code);
            }
        };
    }

    console.log(msg);
    exports.execCmd(cmd, null, errorCb);
};
