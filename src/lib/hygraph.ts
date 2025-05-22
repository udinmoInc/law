import { GraphQLClient } from 'graphql-request';

const hygraphClient = new GraphQLClient(
  import.meta.env.VITE_HYGRAPH_API_URL,
  {
    headers: {
      Authorization: `Bearer ${import.meta.env.VITE_HYGRAPH_AUTH_TOKEN}`,
    },
  }
);

export const uploadImage = async (file: File) => {
  try {
    // First get the upload URL and credentials
    const { createAsset } = await hygraphClient.request(
      `mutation createAsset {
        createAsset(data: {}) {
          id
          url
          upload {
            status
          }
        }
      }`
    );

    // Prepare form data for upload
    const formData = new FormData();
    formData.append('fileUpload', file);
    formData.append('id', createAsset.id);

    // Upload the file
    const uploadResponse = await fetch(createAsset.upload.url, {
      method: 'POST',
      body: formData,
    });

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload file');
    }

    // Return the asset URL
    return createAsset.url;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};