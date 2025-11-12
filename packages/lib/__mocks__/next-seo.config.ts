vi.mock("@calcom/lib/next-seo.config", () => ({
  default: {
    headSeo: {
      siteName: "jeroenandpaws.com",
    },
    defaultNextSeo: {
      title: "jeroenandpaws.com",
      description: "Scheduling infrastructure for everyone.",
    },
  },
  seoConfig: {
    headSeo: {
      siteName: "jeroenandpaws.com",
    },
  },
  buildSeoMeta: vi.fn().mockReturnValue({}),
}));
