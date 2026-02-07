// Simple test script to verify mock API is working
const testQueries = [
  {
    name: "getShop",
    query: `query getShop {
      shop {
        name
        description
      }
    }`
  },
  {
    name: "getCollections", 
    query: `query getCollections($first: Int!) {
      collections(first: $first) {
        nodes {
          id
          handle
          title
        }
      }
    }`,
    variables: { first: 10 }
  },
  {
    name: "getProductByHandle",
    query: `query getProductByHandle($handle: String!) {
      productByHandle(handle: $handle) {
        id
        title
        handle
        featuredImage {
          url
          altText
        }
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
      }
    }`,
    variables: { handle: "premium-wireless-headphones" }
  }
];

async function testMockAPI() {
  console.log("Testing Mock Shopify API...\n");
  
  for (const test of testQueries) {
    try {
      console.log(`Testing ${test.name}:`);
      const response = await fetch('http://localhost:3000/api/mock-shopify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: test.query,
          variables: test.variables || {}
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log(JSON.stringify(result, null, 2));
      console.log("✅ Success\n");
    } catch (error) {
      console.log(`❌ Error: ${error.message}\n`);
    }
  }
}

testMockAPI();