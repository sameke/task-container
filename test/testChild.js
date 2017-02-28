module.exports = (options, callback) => {
    setTimeout(() => {
        callback(null, options);
    }, 500);    
}