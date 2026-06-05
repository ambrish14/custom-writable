const { Writable } = require("stream");
const fs = require("node:fs");

class FileWriteStream extends Writable {
  constructor({ highWaterMark, fileName }) {
    super({ highWaterMark });

    this.fileName = fileName;
    this.fd = null;
    this.chunks = [];
    this.chunksSize = 0;
    this.writeCount = 0;
  }

  //this will run after the constructor method and it will  put of the all the other
  //method until we call the callback function
  _construct(callback) {
    fs.open(this.fileName, "w", (err, fd) => {
      if (err) {
        //so    if we call  the callback with an arguments, it means that we have an error
        // we should not proceed
        callback(err);
      } else {
        this.fd = fd;
        // no arguments means it was successful
        callback();
      }
    });
  }
  _write(chunk, encoding, callback) {
    this.chunks.push(chunk);
    this.chunksSize += chunk.length;

    if (this.chunksSize > this.writableHighWaterMark) {
      fs.write(this.fd, Buffer.concat(this.chunks), (err) => {
        if (err) {
          return callback(err);
        }
        this.chunks = [];
        this.chunksSize = 0;
        ++this.writeCount;
        callback();
      });
    } else {
      //When we are done, we should call the callback function
      callback();
    }
  }

  //   _final(callback) {
  //     fs.write(this.fd, Buffer.concat(this.chunks), (err) => {
  //       if (err) {
  //         return callback(err);
  //       }
  //       this.chunks = [];
  //       callback();
  //     });
  //   }
  //   _destroy(error, callback) {
  //     console.log("Number of writes: ", this.writeCount);
  //     if (this.fd) {
  //       fs.close(this.fd, (err) => {
  //         callback(err | error);
  //       });
  //     } else {
  //       callback(error);
  //     }
  //   }
}

const stream = new FileWriteStream({
  highWaterMark: 1800,
  fileName: "text.txt",
});

stream.write(Buffer.from("this is some stream "));

stream.end(Buffer.from("this is last stream "));

stream.on("finish", () => {
  console.log("stream is finished");
});

// stream.on("drain", () => {});
