import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface Props {
    className?: string;
}

const tiers = [
    {
        tier: 1,
        threshold: 100,
        back: 1,
    },
    {
        tier: 2,
        threshold: 200,
        back: 2,
    },
];

export function TiersCard() {
    // const [tiers, setTiers] = useState([]); // fetch tiers from API
    const [editing, setEditing] = useState<number | null>(null);
    const [originalTier, setOriginalTier] = useState<any | null>(null);

    const { toast } = useToast();

    async function handleSave(tierId: number) {
        const tier = tiers.find(t => t.tier === tierId);

        // If no changes have been made, just return
        if (
            tier &&
            originalTier &&
            tier.tier === originalTier.tier &&
            tier.threshold === originalTier.threshold &&
            tier.back === originalTier.back
        ) {
            setEditing(null);
            return;
        }

        // Save changes here

        toast({
            title: 'Successfully Edited tiers',
            variant: 'constructive',
        });

        setEditing(null);
    }

    async function handleAdd() {
        if (editing != null) {
            alert('Please finish editing before adding a new tier.');
            return;
        }

        // Add a new tier here
        toast({
            title: 'Successfully Added a new Tier',
            variant: 'constructive',
        });
    }

    async function handleDelete(tierId: number) {
        if (editing != null) {
            alert('Please finish editing before deleting a tier.');
            return;
        }

        // Delete the tier here
        toast({
            title: 'Successfully Removed a Tier',
            variant: 'constructive',
        });
    }

    return (
        <div>
            <Table className="w-full">
                <TableHeader>
                    <TableRow>
                        <TableHead>Tier</TableHead>
                        <TableHead>$ Threshold</TableHead>
                        <TableHead>% Back</TableHead>
                        <TableHead></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tiers.map(tier => (
                        <TableRow key={tier.tier}>
                            <TableCell>{editing === tier.tier ? <Input value={tier.tier} /> : tier.tier}</TableCell>
                            <TableCell>
                                {editing === tier.tier ? <Input value={tier.threshold} /> : tier.threshold}
                            </TableCell>
                            <TableCell>{editing === tier.tier ? <Input value={tier.back} /> : tier.back}</TableCell>
                            <TableCell className="flex flex-row space-x-1">
                                {editing === tier.tier ? (
                                    <Button variant="outline" onClick={() => handleSave(tier.tier)}>
                                        Save
                                    </Button>
                                ) : (
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setEditing(tier.tier);
                                            setOriginalTier({ ...tier });
                                        }}
                                    >
                                        Edit
                                    </Button>
                                )}
                                {tier.tier === tiers[tiers.length - 1].tier && (
                                    <Button variant="outline" onClick={() => handleDelete(tier.tier)}>
                                        Delete
                                    </Button>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <Button onClick={handleAdd} disabled={editing !== null} className="w-full">
                Add Tier
            </Button>
        </div>
    );
}
