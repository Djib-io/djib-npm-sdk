export function hexToUnit8Array(hex: string) {
    const hexString = hex.replace(/^0x/, "")
    const pairs = hexString.match(/[\dA-F]{2}/gi)
    if (!pairs) return
    return new Uint8Array(pairs.map((s) => parseInt(s, 16)))
}
