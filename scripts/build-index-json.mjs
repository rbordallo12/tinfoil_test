import fetch from "node-fetch";
import HTMLParser from "node-html-parser";
import fs from "fs";

const FILES_URL = "https://dbi.ultranx.ru/files";

const extractFiles = (agr, node) => {
  if (!node) return;
  if (node.tagName === "A") {
    const fileName = node.text || "NO-NAME";
    agr.push({
      name: fileName.trim(),
      url: node.rawAttributes.href,
    });
  } else {
    if (!node.children) return;
    for (const child of node.children) {
      extractFiles(agr, child);
    }
  }
};

try {
  // Retrieve data
  const response = await fetch(FILES_URL);
  const html = await response.text();
  const data = HTMLParser.parse(html);

  // Generate
  const files = [];
  extractFiles(files, data);

  // Format
  const output = {
    files: files.map((f) => ({
      url: `${f.url}#${f.name}`,
      size: 0,
    })),
    success: `Generated on ${new Date().toString()}. ${
      files.length + 1
    } Files.`,
  };

  // Write
  fs.writeFileSync("./index.json", JSON.stringify(output, null, 4), "utf-8");
} catch (e) {
  console.log(e.message);
  process.exit(-1);
}
