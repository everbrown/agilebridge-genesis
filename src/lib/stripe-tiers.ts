export const TIERS = {
  sprint_pass: {
    name: "Sprint Pass",
    price_id: "price_1TBSacBbQ4fRSkVmBcgybpf4",
    product_id: "prod_U9m8PXKeBfBZ3y",
    price: 19,
    mode: "payment" as const,
    description: "24-hour full access. Convert up to 3 large documents (PDF, DOCX, or CSV) into backlogs.",
  },
  professional: {
    name: "Professional",
    price_id: "price_1TBSY5BbQ4fRSkVmUKVUH2CT",
    product_id: "prod_U9m6FiYwVX6coc",
    price: 39,
    mode: "subscription" as const,
    description: 'Unlimited conversions, priority AI processing, and "Save for Later" project history.',
  },
  enterprise: {
    name: "Enterprise",
    price_id: "price_1TBSYwBbQ4fRSkVmdLKVevM5",
    product_id: "prod_U9m7ZX0CNPgStB",
    price: 149,
    mode: "subscription" as const,
    description: "5 User seats, custom brand voice for stories, and direct Jira API sync.",
  },
} as const;

export const FREE_STORY_LIMIT = 3;
