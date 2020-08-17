import { NextApiRequest, NextApiResponse } from "next";
import Airtable from "airtable";

Airtable.configure({
  apiKey: process.env.AIRTABLE_API_KEY,
});

const base = new Airtable.base(process.env.AIRTABLE_BASE_ID);

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    await createNewUser(req.body.email);
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
