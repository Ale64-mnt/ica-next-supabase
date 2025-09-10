import { supabase } from './supabaseClient'

export async function uploadImage(file: File) {
  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `news/${crypto.randomUUID()}.${ext}`
  const { error } = await supabase.storage.from('images').upload(path, file, { upsert: false })
  if (error) throw error
  const { data } = supabase.storage.from('images').getPublicUrl(path)
  return data.publicUrl
}
