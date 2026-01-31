import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { defineEventHandler, readMultipartFormData, createError } from 'h3'

export default defineEventHandler(async (event) => {
  console.log('API /api/upload-r2 hit')

  try {
    // 1. Method Check
    if (event.method !== 'POST') {
      throw createError({
        statusCode: 405,
        statusMessage: 'Method Not Allowed',
      })
    }

    // 2. Config Check
    const config = useRuntimeConfig()
    
    // Fallback to process.env if runtimeConfig is empty (common in dev if not set in nuxt.config.ts)
    const R2_ACCOUNT_ID = config.R2_ACCOUNT_ID || process.env.R2_ACCOUNT_ID
    const R2_ACCESS_KEY_ID = config.R2_ACCESS_KEY_ID || process.env.R2_ACCESS_KEY_ID
    const R2_SECRET_ACCESS_KEY = config.R2_SECRET_ACCESS_KEY || process.env.R2_SECRET_ACCESS_KEY
    const R2_BUCKET_NAME = config.R2_BUCKET_NAME || process.env.R2_BUCKET_NAME || 'manu-carico-foto'
    const R2_PUBLIC_DOMAIN = config.R2_PUBLIC_DOMAIN || process.env.R2_PUBLIC_DOMAIN

    console.log('Using R2 Bucket:', R2_BUCKET_NAME)

    if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME) {
      console.error('R2 configuration missing in .env')
      throw createError({
        statusCode: 500,
        statusMessage: 'Server configuration error: R2 credentials missing',
      })
    }

    // 3. Parse Files
    const files = await readMultipartFormData(event)
    
    if (!files || files.length === 0) {
      throw createError({ statusCode: 400, statusMessage: 'No files uploaded' })
    }

    console.log(`Processing ${files.length} files...`)
    
    // 4. Initialize S3 Client
    console.log('Initializing S3 Client...')

    const S3 = new S3Client({
      region: 'auto',
      endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: String(R2_ACCESS_KEY_ID),
        secretAccessKey: String(R2_SECRET_ACCESS_KEY),
      },
    })

    // 5. Upload Files in Parallel
    const validFiles = files.filter(file => {
      const isValid = file.filename && file.type?.startsWith('image/')
      console.log(`File: ${file.filename}, Type: ${file.type}, Valid: ${isValid}`)
      return isValid
    })
    console.log(`Found ${validFiles.length} valid images to upload`)

    if (validFiles.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No valid image files found. Please upload images only.',
      })
    }

    const uploadPromises = validFiles
      .map(async (file) => {
        const ext = file.filename!.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${ext}` // Using a simpler random string
        
        console.log(`Uploading ${fileName} (${file.data.length} bytes)...`)
        
        try {
          await S3.send(new PutObjectCommand({ Bucket: String(R2_BUCKET_NAME), Key: fileName, Body: file.data, ContentType: file.type }))
          console.log(`Upload success: ${fileName}`)
        } catch (err) {
          console.error(`Upload failed for ${fileName}:`, err)
          throw err
        }

        const publicUrl = R2_PUBLIC_DOMAIN ? `${R2_PUBLIC_DOMAIN}/${fileName}` : `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_BUCKET_NAME}/${fileName}`
        return publicUrl
      })

    const urls = await Promise.all(uploadPromises)
    console.log('Upload successful:', urls)
    return { urls }

  } catch (error: any) {
    console.error('R2 Upload Error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Internal Server Error',
    })
  }
})
