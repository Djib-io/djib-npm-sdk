import { hexToUnit8Array } from "./hexToUnit8Array"
import { box } from "tweetnacl"
import { encodeUTF8 } from "tweetnacl-util"

export function decrypt<T>(data: string, key: Uint8Array) {
    const messgeWithNonce = hexToUnit8Array(data)
    if (!messgeWithNonce) return
    const nonce = messgeWithNonce.slice(0, box.nonceLength)
    const message = messgeWithNonce.slice(box.nonceLength, data.length)

    const decrypted = box.open.after(message, nonce, key)
    if (!decrypted) return

    const decryptedMessage = encodeUTF8(decrypted)

    try {
        return JSON.parse(decryptedMessage) as T
    } catch (error) {
        return decryptedMessage
    }
}
