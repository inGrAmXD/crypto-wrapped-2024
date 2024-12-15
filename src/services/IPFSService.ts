import { NFTStorage } from 'nft.storage';

export class IPFSService {
    private client: NFTStorage;

    constructor() {
        this.client = new NFTStorage({ token: process.env.NFT_STORAGE_KEY || '' });
    }

    async uploadMetadata(metadata: any): Promise<string> {
        try {
            const stored = await this.client.store({
                name: metadata.name,
                description: metadata.description,
                image: new Blob([metadata.image]), // Aquí deberías pasar la imagen real
                attributes: metadata.attributes
            });

            return stored.url;
        } catch (error) {
            console.error('Error uploading to IPFS:', error);
            throw error;
        }
    }
} 