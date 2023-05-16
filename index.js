const puppeteer = require('puppeteer');
const { readFile, writeFile, existsSync, mkdirSync } = require('fs');
const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const PDFMerger = require('pdf-merger-js');

var merger = new PDFMerger();

const jsonParser = bodyParser.json()
app.use("/public", express.static(path.join(__dirname, 'public')));
app.use(function (req, res, next) {

    express.json()
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

app.post("/postDocument", jsonParser, function(req, res){
  //console.dir(req.body.document);
  console.log(req.body.filename);
  const template = req.body.document;
  const filename = req.body.filename;
  (async () => {

  // Create a browser instance
  const browser = await puppeteer.launch({headless: 'new'})

  // Create a new page
  const page = await browser.newPage();
  console.log(await page.evaluate(() => navigator.userAgent));
  await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8'
  });
  //await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36');
  //Get HTML content from HTML file
  //const document = fs.readFileSync('index.html', 'utf-8');
  readFile('./template/template.html', 'utf8', async function ( error, contents) {
    //data = data.replace('{document}', template)
    contents = contents.replace('{ document }', template);
    //contents = contents.replace('/public/', './');
    await page.setContent(contents, { waitUntil: 'domcontentloaded' });
    await page.emulateMediaType('screen');
    writeFile('./result.html', contents, 'utf-8', function (err) {
      console.log(err);
    });
    const dir = `/public/documents/saved/${filename}`
    if (!existsSync(path.join(__dirname, dir))){
        mkdirSync(path.join(__dirname, dir));
    }
  // Downlaod the PDF
    let height = await page.evaluate(() => document.documentElement.offsetHeight);
    await page.pdf({path: `.${dir}/${filename}.pdf`, height: height + 'px', printBackground: true,});
    res.send({
      path: `https://roky.rocks/doc-editor/api/${dir}/${filename}.pdf`,
      filename: `${filename}.pdf`,
    })
    //await page.pdf({
    //  path: 'result.pdf',
    //  height: '100000px',
    //  margin: { top: '100px', right: '50px', bottom: '100px', left: '50px' },
    //  printBackground: true,
    //  format: 'A3'
    //});


  // Close the browser instance
    //await browser.close();
});



})();
});

app.get("/getDocument", function(req, res){
  console.log(req)
  res.send('ok')
});

//(async () => {

//  // Create a browser instance
//  const browser = await puppeteer.launch();

//  // Create a new page
//  const page = await browser.newPage();

//  //Get HTML content from HTML file
//  const document = fs.readFileSync('index.html', 'utf-8');

//  fs.readFile('./template/template.html', 'utf8', async function ( error, data) {
//    console.log(data)
//    data = data.replace('{document}', document)
//    //response.end(data);
//    await page.setContent(document, { waitUntil: 'domcontentloaded' });
//    await page.emulateMediaType('screen');

//  // Downlaod the PDF
//  const pdf = await page.pdf({
//    path: 'result.pdf',
//    margin: { top: '100px', right: '50px', bottom: '100px', left: '50px' },
//    printBackground: true,
//    format: 'A3',
//  });

//  console.log(pdf)

//  // Close the browser instance
//  await browser.close();
//});



//})();

app.listen(5501, function(){
  console.log("Сервер ожидает подключения..."+ 5501);
});