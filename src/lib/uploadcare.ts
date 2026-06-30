import { uploadFile } from '@uploadcare/upload-client'

const UPLOADCARE_PUBKEY = 'fa9cfa5735e579dbea9b'

export async function uploadProfileImage(file: File): Promise<string> {
  const result = await uploadFile(file, {
    publicKey: UPLOADCARE_PUBKEY,
    store: 'auto',
  })
  return result.cdnUrl || ''
}
