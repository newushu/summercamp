import { supabase, supabaseEnabled } from './supabase'

const DEFAULT_BUCKET = 'camp-media'

function sanitizeFileName(fileName) {
  return fileName.toLowerCase().replace(/[^a-z0-9.-]/g, '-')
}

export function getMediaBucketName() {
  return process.env.NEXT_PUBLIC_MEDIA_BUCKET || DEFAULT_BUCKET
}

export function getMediaPublicUrl(path) {
  if (!supabaseEnabled || !supabase) {
    return ''
  }

  const bucket = getMediaBucketName()
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

export async function listMediaLibrary() {
  if (!supabaseEnabled || !supabase) {
    return { items: [], error: new Error('Supabase is not configured.') }
  }

  const bucket = getMediaBucketName()
  const { data, error } = await supabase.storage.from(bucket).list('uploads', {
    limit: 200,
    offset: 0,
    sortBy: { column: 'created_at', order: 'desc' },
  })

  if (error) {
    return { items: [], error }
  }

  const items = (data || [])
    .filter((item) => item.name)
    .map((item) => {
      const path = `uploads/${item.name}`
      return {
        path,
        name: item.name,
        publicUrl: getMediaPublicUrl(path),
        createdAt: item.created_at || '',
      }
    })

  return { items, error: null }
}

export async function uploadFilesToMediaBucket(fileList) {
  if (!supabaseEnabled || !supabase) {
    return { uploaded: [], error: new Error('Supabase is not configured.') }
  }

  const files = Array.from(fileList || [])
  if (files.length === 0) {
    return { uploaded: [], error: null }
  }

  const bucket = getMediaBucketName()
  const uploaded = []

  for (const file of files) {
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}-${sanitizeFileName(file.name)}`
    const path = `uploads/${fileName}`

    const { error } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || undefined,
    })

    if (error) {
      return { uploaded, error }
    }

    uploaded.push({
      path,
      name: file.name,
      publicUrl: getMediaPublicUrl(path),
    })
  }

  return { uploaded, error: null }
}
