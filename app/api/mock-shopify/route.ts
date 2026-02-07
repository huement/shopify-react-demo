import { NextResponse } from "next/server";
// Reference the specific path you requested
import schemaData from "@/lib/shopify/graphql/.generated/storefront-2025-10.schema.json";

// Mock data
const mockProducts = [
  {
    id: "gid://shopify/Product/1",
    title: "Premium Wireless Headphones",
    handle: "premium-wireless-headphones",
    featuredImage: {
      url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop",
      altText: "Premium Wireless Headphones",
      width: 800,
      height: 800,
    },
    images: {
      nodes: [
        {
          url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop",
          altText: "Premium Wireless Headphones - Front View",
          width: 800,
          height: 800,
        },
        {
          url: "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&h=800&fit=crop",
          altText: "Premium Wireless Headphones - Side View",
          width: 800,
          height: 800,
        },
      ],
    },
    priceRange: {
      minVariantPrice: { amount: "299.99", currencyCode: "USD" },
    },
    collections: {
      nodes: [
        { id: "gid://shopify/Collection/1", handle: "electronics", title: "Electronics" },
        { id: "gid://shopify/Collection/2", handle: "featured", title: "Featured Products" },
      ],
    },
    options: [
      {
        id: "gid://shopify/ProductOption/1",
        name: "Color",
        values: ["Black", "White", "Silver"],
      },
    ],
    variants: {
      nodes: [
        {
          id: "gid://shopify/ProductVariant/1",
          title: "Black",
          availableForSale: true,
          selectedOptions: [{ name: "Color", value: "Black" }],
          price: { amount: "299.99", currencyCode: "USD" },
          compareAtPrice: { amount: "399.99", currencyCode: "USD" },
          image: {
            url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop",
            altText: "Premium Wireless Headphones - Black",
            width: 800,
            height: 800,
          },
        },
        {
          id: "gid://shopify/ProductVariant/2",
          title: "White",
          availableForSale: true,
          selectedOptions: [{ name: "Color", value: "White" }],
          price: { amount: "299.99", currencyCode: "USD" },
          compareAtPrice: { amount: "399.99", currencyCode: "USD" },
          image: {
            url: "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&h=800&fit=crop",
            altText: "Premium Wireless Headphones - White",
            width: 800,
            height: 800,
          },
        },
      ],
    },
  },
  {
    id: "gid://shopify/Product/2",
    title: "Smart Fitness Watch",
    handle: "smart-fitness-watch",
    featuredImage: {
      url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop",
      altText: "Smart Fitness Watch",
      width: 800,
      height: 800,
    },
    images: {
      nodes: [
        {
          url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop",
          altText: "Smart Fitness Watch - Main",
          width: 800,
          height: 800,
        },
      ],
    },
    priceRange: {
      minVariantPrice: { amount: "199.99", currencyCode: "USD" },
    },
    collections: {
      nodes: [
        { id: "gid://shopify/Collection/1", handle: "electronics", title: "Electronics" },
        { id: "gid://shopify/Collection/3", handle: "fitness", title: "Fitness" },
      ],
    },
    options: [
      {
        id: "gid://shopify/ProductOption/2",
        name: "Size",
        values: ["Small", "Medium", "Large"],
      },
    ],
    variants: {
      nodes: [
        {
          id: "gid://shopify/ProductVariant/3",
          title: "Small",
          availableForSale: true,
          selectedOptions: [{ name: "Size", value: "Small" }],
          price: { amount: "199.99", currencyCode: "USD" },
          compareAtPrice: null,
          image: {
            url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop",
            altText: "Smart Fitness Watch - Small",
            width: 800,
            height: 800,
          },
        },
      ],
    },
  },
  {
    id: "gid://shopify/Product/3",
    title: "Eco-Friendly Water Bottle",
    handle: "eco-friendly-water-bottle",
    featuredImage: {
      url: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&h=800&fit=crop",
      altText: "Eco-Friendly Water Bottle",
      width: 800,
      height: 800,
    },
    images: {
      nodes: [
        {
          url: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&h=800&fit=crop",
          altText: "Eco-Friendly Water Bottle",
          width: 800,
          height: 800,
        },
      ],
    },
    priceRange: {
      minVariantPrice: { amount: "24.99", currencyCode: "USD" },
    },
    collections: {
      nodes: [
        { id: "gid://shopify/Collection/3", handle: "fitness", title: "Fitness" },
        { id: "gid://shopify/Collection/4", handle: "eco-friendly", title: "Eco-Friendly" },
      ],
    },
    options: [
      {
        id: "gid://shopify/ProductOption/3",
        name: "Color",
        values: ["Blue", "Green", "Pink"],
      },
    ],
    variants: {
      nodes: [
        {
          id: "gid://shopify/ProductVariant/4",
          title: "Blue",
          availableForSale: true,
          selectedOptions: [{ name: "Color", value: "Blue" }],
          price: { amount: "24.99", currencyCode: "USD" },
          compareAtPrice: null,
          image: {
            url: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&h=800&fit=crop",
            altText: "Eco-Friendly Water Bottle - Blue",
            width: 800,
            height: 800,
          },
        },
      ],
    },
  },
];

const mockCollections = [
  {
    id: "gid://shopify/Collection/1",
    handle: "electronics",
    title: "Electronics",
    products: {
      nodes: mockProducts.filter(p => 
        p.collections.nodes.some(c => c.handle === "electronics")
      ),
    },
  },
  {
    id: "gid://shopify/Collection/2",
    handle: "featured",
    title: "Featured Products",
    products: {
      nodes: mockProducts.filter(p => 
        p.collections.nodes.some(c => c.handle === "featured")
      ),
    },
  },
  {
    id: "gid://shopify/Collection/3",
    handle: "fitness",
    title: "Fitness",
    products: {
      nodes: mockProducts.filter(p => 
        p.collections.nodes.some(c => c.handle === "fitness")
      ),
    },
  },
  {
    id: "gid://shopify/Collection/4",
    handle: "frontpage",
    title: "Frontpage",
    products: {
      nodes: mockProducts,
    },
  },
];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { query, variables = {} } = body;

    // 1. Handle Introspection Queries
    if (query.includes("__schema") || query.includes("__type")) {
      return NextResponse.json(schemaData);
    }

    // 2. Handle getShop query
    if (query.includes("getShop")) {
      return NextResponse.json({
        data: {
          shop: {
            name: "Mock Store",
            description: "A beautiful mock store for development and testing",
          },
        },
      });
    }

    // 3. Handle getCollections query
    if (query.includes("getCollections")) {
      return NextResponse.json({
        data: {
          collections: {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            nodes: mockCollections.map(({ products, ...collection }) => collection),
          },
        },
      });
    }

    // 4. Handle getCollectionByHandle query
    if (query.includes("getCollectionByHandle")) {
      const handle = variables.handle || "frontpage";
      const collection = mockCollections.find(c => c.handle === handle);
      
      return NextResponse.json({
        data: {
          collectionByHandle: collection || mockCollections.find(c => c.handle === "frontpage"),
        },
      });
    }

    // 5. Handle getProductByHandle query
    if (query.includes("getProductByHandle")) {
      const handle = variables.handle;
      const product = mockProducts.find(p => p.handle === handle);
      
      return NextResponse.json({
        data: {
          productByHandle: product || null,
        },
      });
    }

    // 6. Handle generic products query
    if (query.includes("products")) {
      return NextResponse.json({
        data: {
          products: {
            nodes: mockProducts,
          },
        },
      });
    }

    // 7. Handle Cart mutations
    if (query.includes("cartCreate")) {
      return NextResponse.json({
        data: {
          cartCreate: {
            cart: {
              id: "gid://shopify/Cart/mock-123",
              checkoutUrl: "https://checkout.local/mock",
              totalQuantity: 0,
              lines: { edges: [] },
              cost: { totalAmount: { amount: "0.0", currencyCode: "USD" } },
            },
            userErrors: [],
          },
        },
      });
    }

    // Default Fallback
    return NextResponse.json({
      data: {
        shop: {
          name: "Mock Store",
          description: "Local Mocking Enabled",
          moneyFormat: "$",
        },
      },
    });
  } catch (error) {
    console.error("Mock Shopify API Error:", error);
    return NextResponse.json(
      { errors: [{ message: "Invalid Request" }] },
      { status: 400 }
    );
  }
}
