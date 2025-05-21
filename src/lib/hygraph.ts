import { GraphQLClient } from 'graphql-request';

const hygraphClient = new GraphQLClient(
  import.meta.env.VITE_HYGRAPH_API_URL as string,
  {
    headers: {
      Authorization: `Bearer ${import.meta.env.VITE_HYGRAPH_AUTH_TOKEN}`,
    },
  }
);

export const uploadImage = async (file: File) => {
  try {
    // Get upload URL from Hygraph
    const { uploadUrl, assetId } = await hygraphClient.request(
      `mutation GetUploadUrl {
        uploadUrl: createUploadUrl
      }`
    );

    // Upload file to the URL
    const form = new FormData();
    form.append('fileUpload', file);

    const upload = await fetch(uploadUrl, {
      method: 'POST',
      body: form,
    });

    if (!upload.ok) throw new Error('Upload failed');

    // Publish the asset
    const { publishAsset } = await hygraphClient.request(
      `mutation PublishAsset($id: ID!) {
        publishAsset(where: { id: $id }) {
          id
          url
        }
      }`,
      { id: assetId }
    );

    return publishAsset.url;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};