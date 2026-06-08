const { Writable } = require("stream");
const fs = require("node:fs");
// const fsPromises = require("node:fs/promises");

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

  _final(callback) {
    fs.write(this.fd, Buffer.concat(this.chunks), (err) => {
      if (err) {
        return callback(err);
      }
      this.chunks = [];
      callback();
    });
  }
  _destroy(error, callback) {
    console.log("Number of writes: ", this.writeCount);
    if (this.fd) {
      fs.close(this.fd, (err) => {
        callback(err | error);
      });
    } else {
      callback(error);
    }
  }
}

//1st run 197.54ms
(async () => {
  console.time("writeMany");

  // const fileHandle = await fsPromises.open("text.txt", "w");
  const stream = new FileWriteStream({
    fileName: "text.txt",
  });
  let i = 0;
  const numberOfWrites = 1000000;
  const writeMany = () => {
    while (i < numberOfWrites) {
      const buff = Buffer.from(` ${i} `, "utf-8");
      if (i === numberOfWrites - 1) {
        return stream.end(buff);
      }

      // if stream.write returns false, stop the loop
      // here we are checking is true or false if true still loop or else break and drain it
      if (!stream.write(buff)) {
        break;
      }
      i++;
    }
  };

  writeMany();

  //resume our loop  once our stream's internal  buffer is emptied
  stream.on("drain", () => {
    writeMany();
  });

  stream.on("finish", () => {
    console.timeEnd("writeMany");
  });
})();

// stream.write(Buffer.from("this is some stream "));
// stream.end(Buffer.from("this is last stream "));
// stream.on("finish", () => {
//   console.log("stream is finished");
// });

// stream.on("drain", () => {});
