export const TIERS = {
  sprint_pass: {
    name: "Sprint Pass",
    price_id: "price_1TFSG4BbQ4fRSkVmHGsSANSD",
    product_id: "prod_UDu4lYH6EoJTKX",
    price: 19,
    mode: "payment" as const,
    description: "24-hour full access. Convert up to 3 large documents (.mpp, .csv, or PDF) into backlogs.",
  },
  professional: {
    name: "Professional",
    price_id: "price_1TFSGbBbQ4fRSkVmjLGbPskD",
    product_id: "prod_UDu4ystmMoR2CK",
    price: 39,
    mode: "subscription" as const,
    description: 'Unlimited conversions, priority AI processing, and "Save for Later" project history.',
  },
  enterprise: {
    name: "Enterprise",
    price_id: "price_1TFSGzBbQ4fRSkVmdoPIhawp",
    product_id: "prod_UDu5W2RImR6rAw",
    price: 149,
    mode: "subscription" as const,
    description: "5 User seats, custom brand voice for stories, and direct Jira API sync.",
  },
} as const;

export const FREE_STORY_LIMIT = 3;
