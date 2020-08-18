import * as fs from "fs";
import * as path from "path";
import cheerio from "cheerio";

const signupEmailFilePath = path.join(
  __dirname,
  "..",
  "public",
  "emails",
  "signup",
  "signup-email.html"
);

const rawEmailContent = fs.readFileSync(signupEmailFilePath, "utf8");

const $ = cheerio.load(rawEmailContent);
$("head").append('<meta name="color-scheme" content="only"/>');
$("style").first().append("* { color-scheme: light only; }");

fs.writeFileSync(signupEmailFilePath, $.html());

process.exit();
