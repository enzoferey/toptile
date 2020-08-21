import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import axios from "axios";
import sendgrid from "@sendgrid/mail";
import Airtable from "airtable";
import Cors from "cors";

// Initializing the cors middleware
const cors = Cors({
  origin: process.env.NODE_ENV === "production" ? "https://toptile.life" : "*",
  methods: ["POST", "HEAD"],
});

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
    // Run the middleware
    await runMiddleware(req, res, cors);

    const email = req.body.email;

    await createNewUser(email);
    await sendSignupSuccessEmail(email);

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
    `https://discord.com/api/channels/${process.env.DISCORD_INVITE_CHANNEL_ID}/invites`,
    {
      max_uses: 1,
      unique: true,
    },
    {
      headers: {
        Authorization: `Bot ${process.env.DISCORD_INVITE_BOT_TOKEN}`,
      },
    }
  );
  return `https://discord.gg/${inviteResponse.data.code}`;
}

async function sendSignupSuccessEmail(email: string): Promise<void> {
  await sendgrid.send({
    to: email,
    from: process.env.SENDGRID_SENDER_EMAIL,
    subject: "Welcome to Toptile !",
    text: `Welcome to Toptile !\n\nI'm thrilled to have you on board.\n\nMy goal is to make Toptile the reference network for top percentile people. The network you and me wish had existed for a long time.\n\nI have so many ideas about how to make this a reality. And at the same time no strong opinion about what, when, how, or where.\n\nReach to me at hello@enzoferey.com if you want to be part of the initial members that will shape this network.\n\nIn the mean time, as an appetizer for the tons of content you will hear about in Toptile, two amazing pieces of related content:\n\n- 95%-ile isn't that good (https://danluu.com/p95-skill/), by Dan Luu\n3-2-1 Thursday newsletter (https://jamesclear.com/3-2-1), by James Clear\n\nI'm looking forward hearing from you,\n\nThis is only the beginning\n\n- Enzo Ferey`,
    html: signupEmailHtml,
  });
}

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }

      return resolve(result);
    });
  });
}
