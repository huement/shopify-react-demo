import "server-only";
import { createStorefrontApiClient } from "@shopify/storefront-api-client";
import { env } from "@/env";

// Create the real Shopify client
const realClient = createStorefrontApiClient({
  privateAccessToken: env.SHOPIFY_STOREFRONT_PRIVATE_ACCESS_TOKEN,
  storeDomain: env.SHOPIFY_STORE_DOMAIN,
  apiVersion: env.SHOPIFY_STOREFRONT_API_VERSION,
});

// Mock client that uses your local API route
const mockClient = {
  request: async (query: string, options?: { variables?: Record<string, unknown> }) => {
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/mock-shopify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: query,
        variables: options?.variables || {},
      }),
    });

    if (!response.ok) {
      throw new Error(`Mock API request failed: ${response.statusText}`);
    }

    return await response.json();
  },
};

// Export the appropriate client based on environment
export const client = env.USE_MOCK_SHOPIFY ? mockClient : realClient;
