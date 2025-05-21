import { GraphQLClient } from 'graphql-request';

const hygraphClient = new GraphQLClient(
  'https://ap-south-1.cdn.hygraph.com/content/cmawuzy2007rc07w6t03e0nld/master',
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
      `mutation CreateAsset {
        createAsset(data: {}) {
          id
          url
          upload {
            status
            expiresAt
            requestPostData {
              url
              date
              key
              signature
              algorithm
              policy
              credential
              securityToken
            }
          }
        }
      }`
    );

    // Prepare form data for upload
    const formData = new FormData();
    const { requestPostData } = createAsset.upload;
    
    formData.append('Content-Type', file.type);
    formData.append('key', requestPostData.key);
    formData.append('policy', requestPostData.policy);
    formData.append('x-amz-credential', requestPostData.credential);
    formData.append('x-amz-algorithm', requestPostData.algorithm);
    formData.append('x-amz-date', requestPostData.date);
    formData.append('x-amz-signature', requestPostData.signature);
    formData.append('x-amz-security-token', requestPostData.securityToken);
    formData.append('file', file);

    // Upload the file to the provided URL
    await fetch(requestPostData.url, {
      method: 'POST',
      body: formData,
    });

    // Publish the asset
    const { publishAsset } = await hygraphClient.request(
      `mutation PublishAsset($id: ID!) {
        publishAsset(where: { id: $id }, to: PUBLISHED) {
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