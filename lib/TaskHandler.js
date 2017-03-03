const childProcess = require('child_process');
const EventEmitter = require('events');

/**
 * task handler. this class manages the underlying spawned process
 */
module.exports = class TaskHandler extends EventEmitter {
    /**
     * constructor
     * @param {Object} options the options for this handler
     * @param {Number} options.maxCallsPerHandlers then number of times to call a handler before recycling the underlying process
     * @param {boolean} options.debug will cause child processes to have the --debug-brk=[port] option added when spawned
     * 
     * @param {Object} taskOptions testing and development use, gives access to the process options passed to the Node child process
     */
    constructor(options, taskOptions) {
        super();
        this._options = options;
        this._taskArgs = taskOptions.args || [];
        this._revive = true;
        //if we are in debug mode add the debug break port
        if (this._options.debug == true) {
            this._taskArgs.push(`--debug-brk=${options.debugPort}`);
        }
        this._taskOptions = Object.assign({}, taskOptions);
        delete this._taskOptions.args;

        this.isBusy = false;
        this.calls = 0;

        this._setup();
    }

    /**
     * sets up handler to start receiving tasks
     */
    _setup() {
        this._process = childProcess.fork(require.resolve('./Task.js'), this._taskArgs, this._taskOptions);
        //stream child process console data to our parent console
        this._process.stdout.on('data', data => console.log(data.toString()));
        this._process.on('message', (msg, sendHandle) => {            
            if (msg != null) {
                //if the child message has an ignore property or an isLog property we will ignore it and not trigger the callback
                if (msg.ignore != true && msg.isLog != true) {
                    if (this._currentCallback == null) {
                        throw new Error('callback not set, or callback called more than once');
                    }

                    if (msg.error != null) {
                        this._currentCallback(msg.error);
                    } else {
                        this._currentCallback(null, msg.result);
                    }
                    //NOTE: we are going to null out current callback so it is not mistakenly called again
                    this._currentCallback = null;
                    this.isBusy = false;
                    this.emit('free'); //emit the free event letting container know we are ready for another task
                } else {
                    //we need to forward this message on
                    msg.$id = this._currentTaskId;
                    this.emit('message', msg);
                }
            }
        });

        this._process.on('error', (err) => {
            if (this._currentCallback != null) {
                this._currentCallback(err);
                this._currentCallback = null;
            } else {
                //we should not be able to get here
                throw new Error('client code has errored and is in a bad state.');
            }

            this.isBusy = false;
            this.emit('free');
        });

        this._process.on('exit', (code, signal) => {
            //clean up listeners            
            this._process.removeAllListeners();

            if (this._killing != true) {
                //something happened in the users code to kill the process
                //send user an error and create new process and reset calls
                if (this._currentCallback != null) this._currentCallback(new Error('user code crashed the handler process'));
                this._setup();
                this.emit('free');
            } else if (this._revive === true) {
                this._setup();
                this.emit('free');
            }
            
        });

        this._killing = false;
        this.calls = 0;
        this.isBusy = false;
    }

    /**
     * runs the task specified by options
     * @param {Object} options the options for the task to be run
     */
    run(options) {
        if (this.calls >= this._options.maxCallsPerHandler) {
            this.kill();
        } else {
            this.isBusy = true;
            this.calls++;
            this._currentCallback = options.callback;
            this._currentTaskId = options.$id;
            delete options.callback;
            this._process.send(options);
        }
    }

    /**
     * kills the underlying child process
     * NOTE: this will cause a new child process to be spawned
     */
    kill(revive = true) {
        this._killing = true;
        this._process.kill();
        this._revive = revive;
    }
};