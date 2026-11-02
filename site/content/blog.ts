/** Editorial content is part of the source tree. There is no public write API. */
export type BlogPost = {
  slug: string;
  title: string;
  summary: string;
  publishedAt: string;
  updatedAt: string;
  readingMinutes: number;
  sections: { heading: string; paragraphs: string[] }[];
};

export const posts: BlogPost[] = [
  {
    slug: "where-fotoro-keeps-your-photos",
    title: "Where Fotoro keeps your photos",
    summary: "A plain description of the original file, the catalogue, the backup target and the account service.",
    publishedAt: "2026-11-02",
    updatedAt: "2026-11-02",
    readingMinutes: 4,
    sections: [
      {
        heading: "Where is the original stored?",
        paragraphs: [
          "Fotoro stores the original file on the Linux host you choose. The server names stored media by its SHA-256 content hash and keeps a local SQLite catalogue of paths, capture dates, sizes and copy status. The web dashboard requests media from that host; it is not the place where originals live.",
          "The Android app can send photos and videos from the phone, and the website can upload selected files. The server verifies the bytes before it commits an upload. A repeated file can be linked to the existing original instead of being stored again.",
        ],
      },
      {
        heading: "What does a second copy mean?",
        paragraphs: [
          "A second copy is a file on a separately configured backup target. Fotoro tracks the primary and backup copies independently and reports whether each has been verified. A second directory on the same disk does not protect against that disk failing; use another physical drive when you want that protection.",
          "The app does not remove media from your phone after upload. Its two-copy status is a signal you can use when you decide what to keep on the phone.",
        ],
      },
      {
        heading: "What lives in the account service?",
        paragraphs: [
          "Account sign-in and the link to your server endpoint use Supabase. The linked endpoint tells the website which Fotoro host belongs to the signed-in account. Original media and the local media catalogue stay on your host.",
          "Remote access uses your configured Tailscale route. The server still checks the owner or paired-device credential on protected media requests.",
        ],
      },
    ],
  },
  {
    slug: "how-fotoro-resumes-phone-backups",
    title: "How a phone backup resumes",
    summary: "What happens when a transfer stops, how capture dates travel and why the phone copy remains in place.",
    publishedAt: "2026-11-02",
    updatedAt: "2026-11-02",
    readingMinutes: 3,
    sections: [
      {
        heading: "What happens when I stop a transfer?",
        paragraphs: [
          "Stop transfers cancels active and queued uploads and pauses automatic backup across app restarts. It does not delete the phone original or a completed server copy. When you resume, the app checks the saved upload offset and continues an interrupted original from that point when the server still has the session.",
          "Background checks use Android WorkManager, so the phone can choose when a scheduled run actually starts. Automatic backup can be limited to unmetered Wi-Fi and waits when the battery is low.",
        ],
      },
      {
        heading: "How does an image get its timeline date?",
        paragraphs: [
          "The Android client sends the media capture timestamp with its upload. The server stores that timestamp separately from the time the file arrived. The web timeline sorts by capture time and falls back to import time when no capture date is available.",
          "Existing libraries can run Fotoro's date repair command. It reads embedded metadata first and uses a preserved older file timestamp when metadata is missing. A file timestamp is an approximation, so the source media's embedded date is preferable.",
        ],
      },
      {
        heading: "When is it safe to clear space on my phone?",
        paragraphs: [
          "Fotoro reports a primary server copy and a verified second server copy separately. The app never deletes phone media automatically. Keep the phone copy until you have checked the server copy and any backup target you rely on.",
        ],
      },
    ],
  },
];

export function getPost(slug: string): BlogPost | undefined {
  return posts.find((post) => post.slug === slug);
}
