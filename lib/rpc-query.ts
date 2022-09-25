import { JsonRPCErrorType, JsonRPCResponse } from "./types"

export class RPCQuery {
    currentId: number = 0
    constructor(readonly url: string) {}

    async query<T = any>(method: string, ...params: any[]) {
        const response = await fetch(this.url, {
            method: "POST",
            body: JSON.stringify({
                jsonrpc: "2.0",
                id: this.currentId++,
                method,
                params: params.length === 0 ? null : params,
            }),
        })
        const data = await response.json()
        if (data.error) throw data.error as JsonRPCErrorType
        else return data as JsonRPCResponse<T>
    }
}
