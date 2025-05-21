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
    // Get upload URL from Hygraph using the correct mutation
    const { uploadUrl } = await hygraphClient.request(
      `mutation GetUploadUrl {
        uploadUrl: createAssetUploadUrl
      }`
    );

    // Upload file to the URL
    const form = new FormData();
    form.append('fileUpload', file);

    const upload = await fetch(uploadUrl.url, {
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
      { id: uploadUrl.id }
    );

    return publishAsset.url;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};