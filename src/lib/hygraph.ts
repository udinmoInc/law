import { GraphQLClient } from 'graphql-request';

const hygraphClient = new GraphQLClient(
  'https://management-ap-south-1.hygraph.com/graphql',
  {
    headers: {
      Authorization: `Bearer ${import.meta.env.VITE_HYGRAPH_AUTH_TOKEN}`,
      'Content-Type': 'multipart/form-data',
    },
  }
);

export const uploadImage = async (file: File) => {
  try {
    // Create the asset using the correct mutation
    const { createAsset } = await hygraphClient.request(
      `mutation CreateAsset($file: Upload!) {
        createAsset(data: { file: $file }) {
          id
          url
        }
      }`,
      { file }
    );

    // Publish the asset with the correct arguments
    const { publishAsset } = await hygraphClient.request(
      `mutation PublishAsset($id: ID!) {
        publishAsset(
          where: { id: $id }
          to: PUBLISHED
        ) {
          id
          url
        }
      }`,
      { id: createAsset.id }
    );

    return publishAsset.url;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};