module.exports = (options, callback) => {
    setTimeout(() => {
        callback(null, {msg: 'hello world'});
    }, 500);    
}