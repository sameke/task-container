module.exports = (options, callback) => {
    setTimeout(() => {
        process.send({isLog: true, data: 'this is an ignored message from the task'});
        callback(null, options);
        //callback(new Error('test error'));
    }, 1000);    
}