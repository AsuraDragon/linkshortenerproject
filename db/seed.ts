import "dotenv/config";
import { db } from "./index";
import { links, type NewLink } from "./schema";

const USER_ID = "user_3JPKLv66wGtWmRIBZhz260BCL9R";

export const sampleLinks: NewLink[] = [
  {
    userId: USER_ID,
    url: "https://github.com/AsuraDragon/linkshortenerproject",
    code: "gh-repo",
  },
  {
    userId: USER_ID,
    url: "https://neon.tech/docs/introduction",
    code: "neon-docs",
  },
  {
    userId: USER_ID,
    url: "https://nextjs.org/docs/app",
    code: "next-app",
  },
  {
    userId: USER_ID,
    url: "https://clerk.com/docs",
    code: "clerk-auth",
  },
  {
    userId: USER_ID,
    url: "https://orm.drizzle.team/docs/overview",
    code: "drizzle-orm",
  },
  {
    userId: USER_ID,
    url: "https://ui.shadcn.com/docs",
    code: "shadcn-ui",
  },
  {
    userId: USER_ID,
    url: "https://tailwindcss.com/docs",
    code: "tw-v4",
  },
  {
    userId: USER_ID,
    url: "https://react.dev/reference/react",
    code: "react19",
  },
  {
    userId: USER_ID,
    url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
    code: "mdn-js",
  },
  {
    userId: USER_ID,
    url: "https://news.ycombinator.com",
    code: "hackernews",
  },
];

async function seed() {
  console.log(`Seeding 10 example links for user: ${USER_ID}`);
  const inserted = await db.insert(links).values(sampleLinks).returning();
  console.log(`Successfully inserted ${inserted.length} links into Neon PostgreSQL.`);
  console.table(inserted.map((l) => ({ code: l.code, url: l.url, id: l.id })));
  return inserted;
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Error seeding links:", err);
    process.exit(1);
  });
