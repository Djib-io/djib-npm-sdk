import { PEERS_DEV_ENDPOINT, PEERS_MAIN_ENDPOINT } from "./constants"
import { DjibConnection } from "./djib-connection"
import { DjibClientOptions, DjibNetwork, PeerType } from "./types"

export class DjibClient {
    public readonly ready
    constructor(walletAddress: string, { network = DjibNetwork.Mainnet }: DjibClientOptions) {
        this.ready = new Promise<DjibConnection>((resolve, reject) => {
            fetch(network === DjibNetwork.Mainnet ? PEERS_MAIN_ENDPOINT : PEERS_DEV_ENDPOINT)
                .then((res) => res.json())
                .then((peers) => {
                    const peer = peers[Math.floor(Math.random() * peers.length)] as PeerType
                    resolve(
                        new DjibConnection(walletAddress, {
                            network,
                            peer,
                        })
                    )
                })
                .catch(reject)
        })
    }
}
