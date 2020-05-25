module.exports = (data) => {
    console.log('child argv:');
    console.log(process.argv);
    console.log('child execArgv:');
    console.log(process.execArgv);
    return Promise.resolve();
}