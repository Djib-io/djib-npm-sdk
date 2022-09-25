export type DjibClientOptions = {
    network?: DjibNetwork
}

export type DjibConnectionOptions = {
    network: DjibNetwork
    peer: PeerType
}

export type JsonRPCErrorType = {
    code: number
    message: string
    data: string
}

export type JsonRPCResponse<T> = {
    jsonrpc: string
    id: number
    result: T
}

export type HandshakeResponse = {
    message_to_sign: string
    pkbob: string
}

export enum DjibNetwork {
    Mainnet = "mainnet",
    Devnet = "devnet",
}

export type PeerType = {
    dn: string
    region: {
        iso2: string
        name: string
    }
}

export type UnitType = "GB" | "KB" | "MG" | "TB"

export type StatusType = {
    cloud: {
        used_size_kb: number
        total_size_kb: number
        created_at: string
        updated_at: string
    }
    credit: number
    prizes: any[]
}

export type FileType = {
    file_name: string
    extension: string | null
    size_byte: number
    is_folder: boolean
    locked?: boolean
    parent: string
    path: string
    owner?: string
    content_type?: string
    cid?: string
    public_link: string | null
    created_at: string
    updated_at: string
    deleted_at?: string
}

export type ProfileType = {
    name: string
    avatar: string
    email: string
    confirmation: any
}

export type AttributeType = { trait_type: string; value: string }

export type NFTType = {
    cid: string
    token: string
    signature: string
    status: string
    message: string
    created_at: string
    updated_at: string
    metadata: MetadataType
}

export type PropertiesType = {
    creators: { address: string; share: number }[]
    files: { uri: string; type: string }[]
}

export type MetadataType = {
    name: string
    symbol: string
    description: string
    image: string
    external_url: string
    properties: PropertiesType
    collection: {
        name: string
        family: string
    }
    seller_fee_basis_points: number
    attributes: AttributeType
}

export type FamilyType = {
    collections: string[]
    family: string
}

export type PaymentType = {
    message: string
    method: "CREDIT" | "PAYMENT"
    unit: string
    price: number
    amount: number
    status: "finalized" | "sold" | "pending" | "failed"
    signature: string
    payed_at: string
    created_at: string
    updated_at: string
}

export type ShareObjectType = {
    link: string
    has_pass: boolean
    is_public: boolean
    share_email: string
    created_at: string
}
