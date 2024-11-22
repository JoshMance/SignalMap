const http = require("http");
const fs = require("fs");
const path = require("path");

const cors=require("cors");
const corsOptions = {
   origin:"*", 
   credentials:true,            //access-control-allow-credentials:true
   optionSuccessStatus:200,
}

// Path to the 10 MB text file
const filePath = path.join(__dirname, 'largeFile.txt');

// Function to generate the 10 MB text file
function generateLargeFile() {
  const data = 'This is a sample line of text.\n'; // A simple line of text
  const fileSize = 1 * 1024 * 1024; // 1 MB
  let fileStream = fs.createWriteStream(filePath);

  let writeData = () => {
    while (fileStream.bytesWritten < fileSize) {
      if (!fileStream.write(data)) {
        fileStream.once('drain', writeData);
        return;
      }
    }
    fileStream.end();
  };

  writeData();
}

generateLargeFile();

// Create the HTTP server
http.createServer((req, res) => {
  if (req.url === '/download') {
    // Set the appropriate headers for file download
    res.writeHead(200, {
      'Content-Type': 'text/plain',
      'Content-Disposition': 'attachment; filename="largeFile.txt"',
      'Content-Length': fs.statSync(filePath).size
    });

    // Create a stream and pipe the file content to the response
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } else {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<h1>Download the file <a href="/download">here</a></h1>');
  }
}).listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
