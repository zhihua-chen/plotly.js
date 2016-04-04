/*eslint-env node*/

// Karma configuration

/*
 * The browser on which the tests are run can be specified with an argument.
 *
 * Example:
 *
 *  $ npm run citest-jasmine -- ie
 *
 * will only run the tests on Internet Explorer.
 *
 */

var lowerCase2BrowserName = {
    firefox: 'Firefox',
    chrome: 'Chrome',
    ie: 'IE'
};

var arg = process.argv[4] || 'firefox';
var browser = lowerCase2BrowserName[arg.toLowerCase()];

func.defaultConfig = require('./karma.conf').defaultConfig;

function func(config) {

    // level of logging
    // possible values:
    //  - config.LOG_DISABLE
    //  - config.LOG_ERROR
    //  - config.LOG_WARN
    //  - config.LOG_INFO
    //  - config.LOG_DEBUG
    func.defaultConfig.logLevel = config.LOG_INFO;

    // Continuous Integration mode

    func.defaultConfig.files = [
        'assets/jquery-1.8.3.min.js',
        'tests/*_test.js'
    ];

    func.defaultConfig.preprocessors = {
        'tests/*_test.js': ['browserify']
    };

    /*
     * WebGL interaction test cases fail on the CircleCI
     * most likely due to a WebGL/driver issue;
     * exclude them from the CircleCI test bundle.
     *
     */
    func.defaultConfig.exclude = ['tests/gl_plot_interact_test.js'];

    // if true, Karma captures browsers, runs the tests and exits
    func.defaultConfig.singleRun = true;

    func.defaultConfig.browserNoActivityTimeout = 30000; // 30 seconds

    func.defaultConfig.autoWatch = false;

    func.defaultConfig.browsers = [browser];

    config.set(func.defaultConfig);
}

module.exports = func;
