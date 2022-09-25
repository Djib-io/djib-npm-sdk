import { box, randomBytes } from "tweetnacl"
import { decodeUTF8 } from "tweetnacl-util"

export function encrypt<T extends object>(
    data: T,
    {
        pkbob,
        secretKey,
    }: {
        pkbob: Uint8Array
        secretKey: Uint8Array
    }
) {
    const nonce = randomBytes(box.nonceLength)
    const messageUint8 = decodeUTF8(JSON.stringify(data))

    const key = box.before(pkbob, secretKey)
    const encrypted = box.after(messageUint8, nonce, key)

    const fullMessage = new Uint8Array(nonce.length + encrypted.length)
    fullMessage.set(nonce)
    fullMessage.set(encrypted, nonce.length)

    return { encryptedData: Buffer.from(fullMessage).toString("hex"), key }
}
