
class Observer {
    constructor() {
        this.listener = null;
    }
    listener;

    setListener(callback, interval) {
        console.log("Will set interval...");
        this.listener = setInterval(callback, interval);
    }


    clearListener() {
        if (this.listener) clearInterval(this.listener);
    }
}

module.exports = Observer;

