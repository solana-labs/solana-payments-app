import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import * as RE from '@/lib/Result';
import { Product, updateLoyalty, useMerchantStore } from '@/stores/merchantStore';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Transaction } from '@solana/web3.js';
import Image from 'next/image';
import { useState } from 'react';
import { FaSpinner } from 'react-icons/fa';
import { Switch } from './ui/switch';

interface Props {
    className?: string;
}

export function ProductsCard(props: Props) {
    const { toast } = useToast();

    const merchantInfo = useMerchantStore(state => state.merchantInfo);
    const getMerchantInfo = useMerchantStore(state => state.getMerchantInfo);
    const { publicKey, sendTransaction } = useWallet();
    const wallet = useWallet();
    const { connection } = useConnection();

    const products =
        RE.isOk(merchantInfo) && merchantInfo.data.loyalty.products ? merchantInfo.data.loyalty.products : [];

    const [processingId, setProcessingId] = useState<string | null>(null);

    async function handleToggle(product: Product) {
        if (!wallet) return;

        setProcessingId(product.id);
        let response;

        if (!product.mint) {
            toast({
                title: `About to upload and mint your unique product nft`,
            });
        }

        response = await updateLoyalty({
            products: {
                id: product.id,
                active: !product.active,
            },
            payer: publicKey?.toBase58(),
        });

        if (response.status === 200) {
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
        } else {
            toast({
                title: `Error ${product.active ? 'deactivating' : 'activating'} NFTs`,
                variant: 'destructive',
            });
        }
        setProcessingId(null);
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
                    <TableRow key={product.id} className={`h-20 ${product.mint && 'hover:cursor-pointer'} `}>
                        <TableCell
                            className=""
                            onClick={() => product.mint && window.open(`https://solscan.io/token/${product.mint}`)}
                        >
                            {product.image && <Image src={product.image} alt={product.name} width={100} height={100} />}
                        </TableCell>
                        <TableCell className="">{product.name}</TableCell>
                        <TableCell className="justify-center items-stretch">
                            {processingId === product.id ? (
                                <FaSpinner className="animate-spin h-6 w-6" />
                            ) : (
                                <Switch
                                    checked={product.active}
                                    onCheckedChange={() => handleToggle(product)}
                                    disabled={processingId !== null}
                                />
                            )}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
