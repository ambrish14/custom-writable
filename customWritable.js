const { Writable } = require("stream");
const fs = require("node:fs");

class FileWriteStream extends Writable {
  constructor({ highWaterMark, fileName }) {
    super({ highWaterMark });

    this.fileName = fileName;
    this.fd = null;
  }

  //this will run after the constructor method and it will  put of the all the other
  //method until we call the callback function
  _construct(callback) {
    fs.open(this.fileName, "w", (err, fd) => {
      if (err) {
        callback(err);
      } else {
        this.fd = fd;
        callback();
      }
    });
  }
  _write(chunk, encoding, callback) {}

  _final() {}
  _destroy() {}
}

const stream = new FileWriteStream({ highWaterMark: 1800 });

stream.write(Buffer.from("this is some stream"));

stream.end(Buffer.from("this is last stream "));

stream.on("drain", () => {});
