module.exports = (data) => {
    let wait = Math.floor(Math.random() * 5001);
    console.log(`waiting: ${wait}`);
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(data);
        }, wait);
    });
};