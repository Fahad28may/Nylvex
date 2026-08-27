export type Product = {
  slug: string;
  name: string;
  tagline: string;
  summary: string;
  capabilitiesNow: string[];
  capabilitiesNext: string[];
  builtWith: string[];
};

export const products: Product[] = [
  {
    slug: "nerve",
    name: "Nerve",
    tagline: "AI Business Operator",
    summary:
      "Nerve gives a business an AI operator that talks to customers on WhatsApp — grounded in that business's own knowledge, remembering the conversation, and built to take on more of the operational load over time.",
    capabilitiesNow: [
      "Conversations over WhatsApp Cloud API",
      "Responses grounded in business-specific configuration",
      "Conversation memory across messages",
      "Persistent customer and conversation records",
    ],
    capabilitiesNext: [
      "Appointment booking",
      "Calendar integration",
      "Payments",
      "Additional channels beyond WhatsApp",
    ],
    builtWith: ["WhatsApp Cloud API", "OpenRouter", "PostgreSQL"],
  },
];

export function getAllProducts(): Product[] {
  return products;
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}
