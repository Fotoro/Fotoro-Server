/**
 * The project owner publishes journal posts by reviewing and committing this
 * source file. No visitor, dashboard account or API route can create a post.
 */
export type BlogPost = {
  slug: string;
  title: string;
  summary: string;
  publishedAt: string;
  updatedAt: string;
  readingMinutes: number;
  sections: { heading: string; paragraphs: string[] }[];
};

export const posts: BlogPost[] = [];

export function getPost(slug: string): BlogPost | undefined {
  return posts.find((post) => post.slug === slug);
}
