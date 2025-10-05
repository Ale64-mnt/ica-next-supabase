export async function uploadFile(file: File, path: string) {
  console.log('Upload function called', { file, path });
  return { success: true, path: `${path}/${file.name}` };
}

export async function deleteFile(path: string) {
  console.log('Delete function called', { path });
  return { success: true };
}
