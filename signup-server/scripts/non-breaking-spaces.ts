import * as fs from "fs";
import * as path from "path";
import cheerio from "cheerio";

// These are the characters that should have a leading non break space
const POST_CHARACTERS = ["!", "?"];

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
const rawEmailContentText = $("html *")
  .contents()
  .map(function () {
    const isCSSText = this.parent.name === "style";
    return this.type === "text" && !isCSSText ? $(this).text() : "";
  })
  .get();

let updatedEmailContent = rawEmailContent;
rawEmailContentText.forEach((text) => {
  let updatedText = text;
  POST_CHARACTERS.forEach((postCharacter) => {
    updatedText = updatedText
      .split(` ${postCharacter}`)
      .join(`&nbsp;${postCharacter}`);
  });
  updatedEmailContent = updatedEmailContent.split(text).join(updatedText);
});

fs.writeFileSync(signupEmailFilePath, updatedEmailContent);

process.exit();
