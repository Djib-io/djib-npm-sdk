import { RPCQuery } from "./rpc-query"
import { box, BoxKeyPair } from "tweetnacl"
import {
    AttributeType,
    DjibConnectionOptions,
    DjibNetwork,
    FamilyType,
    FileType,
    HandshakeResponse,
    NFTType,
    PaymentType,
    ProfileType,
    ShareObjectType,
    StatusType,
    UnitType,
} from "./types"
import { encodeBase64, decodeBase64 } from "tweetnacl-util"
import { KMS_DEV_ENDPOINT, KMS_MAIN_ENDPOINT } from "./constants"
import { encrypt } from "./encrypt"
import { decrypt } from "./decrypt"

export class DjibConnection {
    private readonly rpc
    private readonly kms
    private readonly network
    private readonly peer
    private pkbob?: Uint8Array
    private readonly kp: BoxKeyPair = box.keyPair()

    constructor(readonly walletAddress: string, { network, peer }: DjibConnectionOptions) {
        this.network = network
        this.peer = peer
        this.rpc = new RPCQuery(peer.dn)
        this.kms = new RPCQuery(network === DjibNetwork.Mainnet ? KMS_MAIN_ENDPOINT : KMS_DEV_ENDPOINT)
    }

    async djib<T>(method: string, ...params: any[]) {
        const { encryptedData, key } = encrypt(params, { pkbob: this.pkbob!, secretKey: this.kp.secretKey })
        const { result } = await this.rpc.query<string>(method, this.walletAddress, encryptedData)
        return decrypt<T>(result, key)
    }

    async handshake(wallet: string) {
        const {
            result: { message_to_sign, pkbob },
        } = await this.kms.query<HandshakeResponse>("handshake", [wallet])
        this.pkbob = decodeBase64(pkbob)
        return message_to_sign
    }

    async auth(wallet: string, signedMessage: string) {
        return await this.kms.query<string>("auth", [wallet, signedMessage, encodeBase64(this.kp.publicKey)])
    }

    async estimate(wallet: string, value: number, unit: UnitType = "GB") {
        return Number(await this.djib("estimate", wallet, value, unit))
    }

    async status() {
        return (await this.djib("status", "status")) as StatusType
    }

    async lsDrive(path: string) {
        return (await this.djib("lsDrive", path)) as FileType[]
    }

    async lsTrash() {
        return (await this.djib("lsTrash", "lsTrash")) as FileType[]
    }

    async lsFavourite() {
        return (await this.djib("lsFavorite", "lsFavorite")) as FileType[]
    }

    async ls_recent() {
        return (await this.djib("recentFiles", "recentFiles")) as FileType[]
    }

    async unsetFavorite(path: string) {
        return (await this.djib("unsetFavorite", path)) as FileType[]
    }

    async createPayment(value: number, unit: UnitType = "GB") {
        return (await this.djib("createPayment", value, unit)) as {
            payment_url: string
            tracking_code: string
        }
    }

    async confirmPayment(trackingCode: string) {
        return (await this.djib("confirmPayment", trackingCode)) as {
            finalized: boolean
            signature: string
        }
    }

    async buyStorage(
        params:
            | {
                  tracking_code: string
              }
            | {
                  size: number
                  unit: string
              }
    ) {
        return (await this.djib("buyStorage", params)) as string
    }

    async createFolder(path: string, name: string) {
        return (await this.djib("createFolder", path, name)) as string
    }

    async claimPrize() {
        return (await this.djib("claimPrize", "claimPrize")) as StatusType
    }

    async search(value: string, path?: string, extension?: string) {
        const option: any = {}
        if (path) option.path = path
        if (extension) option.extension = extension
        return (await this.djib("search", value, option)) as FileType[]
    }

    async moveTrash(path: string) {
        return (await this.djib("moveTrash", [path])) as string[]
    }

    async restoreFromTrash(path: string, deleteAt: string) {
        return (await this.djib("restoreFromTrash", path, deleteAt)) as string
    }

    async setFavorite(path: string) {
        return (await this.djib("setFavorite", path)) as string
    }

    async rename(path: string, newName: string) {
        return (await this.djib("rename", path, newName)) as string
    }

    async move(from: string, to: string) {
        return (await this.djib("move", from, to)) as string
    }

    async copy(from: string, to: string) {
        return (await this.djib("copy", from, to)) as string
    }

    async duplicate(path: string) {
        return (await this.djib("duplicate", path)) as string
    }

    async setProfile(params: { email?: string; avatar?: string; name?: string }) {
        return (await this.djib("setProfile", params)) as string
    }

    async getProfile() {
        return (await this.djib("getProfile", "getProfile")) as ProfileType
    }

    async resendVerificationEmail() {
        return (await this.djib("resendVerificationEmail", "resendVerificationEmail")) as string
    }

    async createNftPayment(n: number = 1) {
        return (await this.djib("createNftPayment", n)) as {
            payment_url: string
            tracking_code: string
        }
    }

    async saveAsNft(
        path: string,
        attrs: {
            thumbnail?: string
            name: string
            symbol: string
            description: string
            seller_fee_basis_points: number
            external_url: string
            attributes: AttributeType[]
            collection: string
            family: string
        }
    ) {
        return (await this.djib("saveAsNft", path, {
            ...attrs,
            thumbnail: attrs.thumbnail || null,
        })) as {
            cid: string
            created_at: string
        }
    }

    async uploadAsset(cid: string, created_at: string, tracking_code?: string) {
        return (await this.djib("uploadAsset", cid, created_at, tracking_code)) as string
    }

    async lsNfts(count: number = 10, skip: number = 0, family?: string) {
        return (await this.djib("lsNfts", {
            family,
            count,
            skip,
        })) as {
            nfts: NFTType[]
            options: {
                family: string
                total: number
                skip: number
                count: number
            }
        }
    }

    async lsNftFamilies() {
        return (await this.djib("lsNftFamilies", "lsNftFamilies")) as FamilyType[]
    }

    async lsPayments(count: number = 10, skip: number = 0) {
        return (await this.djib("lsPayments", skip, count)) as {
            payments: PaymentType[]
            options: {
                skip: number
                total: number
                count: number
            }
        }
    }

    async shareObject(path: string, email?: string, password?: string) {
        return (await this.djib("shareObject", path, {
            email,
            password,
        })) as string
    }

    async shareFromDrive(path: string) {
        return (await this.djib("shareFromDrive", path)) as string
    }

    async lsFileShares(path: string) {
        return (await this.djib("lsFileShares", path)) as {
            has_pass: boolean
            shares: ShareObjectType[]
        }
    }

    async revokeShares(path: string, links: string[]) {
        return (await this.djib("revokeShares", path, links)) as ShareObjectType[]
    }

    async lsShareWithMe({ path, owner, password }: { path?: string | undefined; owner?: string; password?: string }) {
        return (await this.djib(
            "lsShareWithMe",
            "lsShareWithMe",
            path && {
                path: path.startsWith("/Shared") ? path : `/Shared${path}`,
                owner,
                password,
            }
        )) as FileType[]
    }

    async lsShareByMe() {
        return (await this.djib("lsShareByMe", "lsShareByMe")) as FileType[]
    }

    async rmSharedWithMe(path: string, owner: string) {
        return (await this.djib("rmSharedWithMe", path, owner)) as FileType[]
    }

    async lsPublic(justPublic: boolean = false) {
        return (await this.djib("lsPublic", "lsPublic", justPublic)) as FileType[]
    }

    async emptyTrash() {
        return (await this.djib("emptyTrash", "emptyTrash")) as string
    }

    async deleteTrash(path: string, deleteAt?: string) {
        return (await this.djib("deleteTrash", path, deleteAt)) as string
    }

    async getSharedByLink(link: string, password?: string) {
        return (await this.djib(
            "getSharedByLink",
            link,
            password && {
                password,
            }
        )) as FileType[]
    }

    async savePublic(cids: string[], path: string) {
        return (await this.djib("savePublic", cids, path)) as string
    }

    async createTopUpPayment(amount: number) {
        return (await this.djib("createTopUpPayment", amount)) as {
            payment_url: string
            tracking_code: string
        }
    }

    async confirmTopUpPayment(tracking_code: string) {
        return (await this.djib("confirmTopUpPayment", tracking_code)) as {
            finalized: true
            signature: string
        }
    }

    async lsDailyBalance(option: number = 7) {
        return (await this.djib("lsDailyBalance", option)) as {
            time: string
            balance: number
        }[]
    }
}
