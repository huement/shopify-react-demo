export const getCollections = `#graphql
  query getCollections($first: Int!) {
    collections(first: $first) {
      nodes {
        id
        handle
        title
      }
    }
  }
` as const;

export const getShop = `#graphql
  query getShop {
    shop {
      name
      description
    }
  }
` as const;

export const getCollectionByHandle = `#graphql
  query getCollectionByHandle($handle: String!) {
    collectionByHandle(handle: $handle) {
      id
      title
      handle
      products(first: 24) {
        nodes {
          id
          handle
          title
          featuredImage {
            url
            altText
            width
            height
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          collections(first: 10) {
            nodes {
              id
              handle
              title
            }
          }
        }
      }
    }
  }
` as const;

export const getProductByHandle = `#graphql
  query getProductByHandle($handle: String!) {
    productByHandle(handle: $handle) {
      id
      title
      handle
      featuredImage {
        url
        altText
        width
        height
      }
      images(first: 10) {
        nodes {
          url
          altText
          width
          height
        }
      }
      collections(first: 10) {
        nodes {
          id
          handle
          title
        }
      }
      options {
        id
        name
        values
      }
      variants(first: 50) {
        nodes {
          id
          title
          availableForSale
          selectedOptions {
            name
            value
          }
          price {
            amount
            currencyCode
          }
          compareAtPrice {
            amount
            currencyCode
          }
          image {
            url
            altText
            width
            height
          }
        }
      }
    }
  }
` as const;
