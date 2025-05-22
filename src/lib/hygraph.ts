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
      `mutation createAsset($fileName: String!) {
        createAsset(data: { fileName: $fileName }) {
          id
          url
          fileName
          handle
        }
      }`,
      {
        fileName: file.name
      }
    );

    // Prepare form data for upload
    const formData = new FormData();
    formData.append('fileUpload', file);

    // Get the upload URL from the API response
    const uploadUrl = `${import.meta.env.VITE_HYGRAPH_API_URL}/upload`;

    // Upload the file
    const uploadResponse = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_HYGRAPH_AUTH_TOKEN}`,
      },
      body: formData,
    });

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload file');
    }

    const uploadData = await uploadResponse.json();

    // Return the asset URL
    return uploadData.url;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};