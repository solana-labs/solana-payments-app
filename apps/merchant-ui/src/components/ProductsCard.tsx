import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import * as RE from '@/lib/Result';
import { Product, updateLoyalty, useMerchantStore } from '@/stores/merchantStore';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Transaction } from '@solana/web3.js';
import { Switch } from './ui/switch';

interface Props {
    className?: string;
}

export function ProductsCard(props: Props) {
    const { toast } = useToast();

    const merchantInfo = useMerchantStore(state => state.merchantInfo);
    const getMerchantInfo = useMerchantStore(state => state.getMerchantInfo);
    const { publicKey, sendTransaction, wallet, connect, disconnect, connected, wallets, select } = useWallet();
    const { connection } = useConnection();

    const products =
        RE.isOk(merchantInfo) && merchantInfo.data.loyalty.products ? merchantInfo.data.loyalty.products : [];

    async function handleToggle(product: Product) {
        const response = await updateLoyalty({
            products: {
                id: product.id,
                active: !product.active,
            },
            payer: publicKey?.toBase58(),
        });

        if (response.status != 200) {
            toast({
                title: `Error ${product.active ? 'deactivating' : 'activating'} NFTs`,
                variant: 'destructive',
            });
        } else {
            const data = await response.json();
            if (data.transaction) {
                const transaction = Transaction.from(Buffer.from(data.transaction, 'base64'));

                await sendTransaction(transaction, connection);
            }
            await getMerchantInfo();
            toast({
                title: `Successfully ${product.active ? 'deactivated' : 'activated'} NFTs`,
                variant: 'constructive',
            });
        }
    }

    return (
        <Table>
            <TableHeader>
                <TableRow className="w-full">
                    <TableHead></TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>NFT Enabled</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {products.map((product: Product) => (
                    <TableRow key={product.id}>
                        <TableCell>{product.image}</TableCell>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>
                            <Switch checked={product.active} onCheckedChange={() => handleToggle(product)} />
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
