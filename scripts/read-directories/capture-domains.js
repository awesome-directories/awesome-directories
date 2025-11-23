var fs = require("fs");
var path = require("path");
var parse = require("csv-parse/sync").parse;

// 1. read the ./directories.csv
function readCSVFile() {
  var csvPath = path.join(__dirname, "directories.csv");
  var content = fs.readFileSync(csvPath, "utf-8");
  return content;
}

// 2. get the url column (first row is header)
function parseCSV(content) {
  var records = parse(content, {
    columns: true,
    skip_empty_lines: true,
  });

  var urls = [];

  console.log("first row", Object.keys(records[0]));
  const urlIndex = Object.keys(records[0])
    .filter((key) => key == "url")
    .at(0);
  console.log("url index", urlIndex);
  const subbmissionUrl = urlIndex
    ? urlIndex
    : Object.keys(records[0])
        .filter((key) => key.toLowerCase() == "submission url")
        .at(0);

  for (var i = 0; i < records.length; i++) {
    const url = records[i][urlIndex];
    const submissionUrl = records[i][subbmissionUrl];

    const domain = extractDomain(url);
    if (domain && isValidDomain(domain)) {
      urls.push(domain.trim());
      continue;
    }

    const submission = extractDomain(submissionUrl);
    if (submission && isValidDomain(submission)) {
      urls.push(submission.trim());
    }
  }

  return urls;
}

// 3. get the domain from each url, excluding the protocol and port
function extractDomain(url) {
  try {
    var urlObj = new URL(url);
    return urlObj.hostname;
  } catch (error) {
    return null;
  }
}

// 4. validate if the domain is valid, if not, log an error with the url and skip
function isValidDomain(domain) {
  if (!domain) {
    return false;
  }

  var domainRegex =
    /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
  return domainRegex.test(domain);
}

// 5. output the results to directories.txt, one domain per line

function writeDomains(domains) {
  var outputPath = path.join(__dirname, "directories.txt");
  var content = domains.join("\n") + "\n";
  fs.writeFileSync(outputPath, content, "utf-8");
  console.log("Domains written to " + outputPath);
}

function main() {
  var csvContent = readCSVFile();
  var domains = parseCSV(csvContent);
  writeDomains(domains);
}

main();
