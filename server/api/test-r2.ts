import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  
  // Fallback to process.env if runtimeConfig is empty
  const R2_ACCOUNT_ID = config.R2_ACCOUNT_ID || process.env.R2_ACCOUNT_ID
  const R2_ACCESS_KEY_ID = config.R2_ACCESS_KEY_ID || process.env.R2_ACCESS_KEY_ID
  const R2_SECRET_ACCESS_KEY = config.R2_SECRET_ACCESS_KEY || process.env.R2_SECRET_ACCESS_KEY
  const R2_BUCKET_NAME = config.R2_BUCKET_NAME || process.env.R2_BUCKET_NAME || 'manu-carico-foto'

  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME) {
    return { 
      status: 'error', 
      message: 'Missing R2 environment variables. Check your .env file.' 
    }
  }

  try {
    const S3 = new S3Client({
      region: 'auto',
      endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: String(R2_ACCESS_KEY_ID),
        secretAccessKey: String(R2_SECRET_ACCESS_KEY),
      },
    })

    // Attempt to list objects in the specific bucket to verify permissions
    const data = await S3.send(new ListObjectsV2Command({ Bucket: String(R2_BUCKET_NAME), MaxKeys: 5 }))
    
    return {
      status: 'success',
      message: `Connected to R2 bucket '${R2_BUCKET_NAME}' successfully!`,
      files: data.Contents?.map(o => o.Key) || []
    }
  } catch (error: any) {
    return {
      status: 'error',
      message: 'Failed to connect to R2',
      details: error.message,
      bucket_used: R2_BUCKET_NAME,
      code: error.code
    }
  }
})