module.exports = (data) => {
    return new Promise((resolve, reject) => {
        let delay = Math.ceil(Math.random() * 10);
        setTimeout(() => {
            console.log(data);
            resolve();
        }, delay * 1000);
    });
};