import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import axios from "axios";
import sendgrid from "@sendgrid/mail";
import Airtable from "airtable";

// Load Signup email data
const signupEmailPath = path.resolve(
  "public",
  "emails",
  "signup",
  "signup-email.html"
);
const signupEmailHtml = fs.readFileSync(signupEmailPath, "utf8");

// Setup SendGrid
sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

// Setup AirTable
Airtable.configure({
  apiKey: process.env.AIRTABLE_API_KEY,
});
const base = new Airtable.base(process.env.AIRTABLE_BASE_ID);

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const email = req.body.email;

    await createNewUser(email);
    const inviteLink = await generateInviteLink();
    await sendSignupSuccessEmail(email, inviteLink);

    res.statusCode = 200;
    res.json({ success: true });
  } catch (error) {
    res.statusCode = 400;
    res.json({ success: false, error: error.message });
  }
};

async function createNewUser(email: string): Promise<void> {
  const users = await base("users")
    .select({
      maxRecords: 1,
      filterByFormula: `{email} = '${email}'`,
    })
    .firstPage();

  if (users.length > 0) {
    throw new Error("EMAIL_ALREADY_EXISTS");
  }

  return base("users").create([
    {
      fields: {
        email,
      },
    },
  ]);
}

async function generateInviteLink(): Promise<string> {
  const inviteResponse = await axios.post(
    `https://discord.com/api/channels/${process.env.INVITE_CHANNEL_ID}/invites`,
    {
      max_uses: 1,
      unique: true,
    },
    {
      headers: {
        Authorization: `Bot ${process.env.INVITE_BOT_TOKEN}`,
      },
    }
  );
  return `https://discord.gg/${inviteResponse.data.code}`;
}

async function sendSignupSuccessEmail(
  email: string,
  inviteLink: string
): Promise<void> {
  await sendgrid.send({
    to: email,
    from: process.env.SENDGRID_SENDER_EMAIL,
    subject: "Welcome to Toptile !",
    text: `Welcome to Toptile !\n\nI'm thrilled to have you on board.\n\nMy goal is to make Toptile the reference community for top percentile people. The community you and me wish had existed for a long time.\n\nI have so many ideas about how to make this a reality. And at the same time no strong opinion about what, when, how, or where. I want you to shape the community and influence its direction.\n\nClick the following button to join our Discord channel and start the conversation:\n\n${inviteLink}\n\nAs an appetizer for the tons of content you will hear about in Toptile, two amazing pieces of related content:\n\n- 95%-ile isn't that good (https://danluu.com/p95-skill/), by Dan Luu\n3-2-1 Thursday newsletter (https://jamesclear.com/3-2-1), by James Clear\n\nI'm looking forward hearing from you,\n\nThis is only the beginning\n\n- Enzo Ferey`,
    html: signupEmailHtml.split("DISCORD_INVITE_LINK").join(inviteLink),
  });
}
