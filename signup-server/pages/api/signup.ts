import { NextApiRequest, NextApiResponse } from "next";
import Airtable from "airtable";
import axios from "axios";

Airtable.configure({
  apiKey: process.env.AIRTABLE_API_KEY,
});

const base = new Airtable.base(process.env.AIRTABLE_BASE_ID);

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    await createNewUser(req.body.email);
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
    const inviteLink = `https://discord.gg/${inviteResponse.data.code}`;
    res.statusCode = 200;
    res.json({ success: true });
  } catch (error) {
    res.statusCode = 400;
    res.json({ success: false, error: error.message });
  }
};

function createNewUser(email: string): Promise<void> {
  return base("users").create([
    {
      fields: {
        email,
      },
    },
  ]);
}
