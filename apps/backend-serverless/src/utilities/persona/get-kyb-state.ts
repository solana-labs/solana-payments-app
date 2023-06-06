import { KybState } from '@prisma/client';
import fetch from 'node-fetch';

export async function getKybState(inquiryId: string) {
    if (!process.env.PERSONA_API_KEY) {
        console.error('Missing Persona API key');
        return null;
    }

    const rawResp = await fetch(`https://withpersona.com/api/v1/inquiries/${inquiryId}`, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.PERSONA_API_KEY}`,
        },
    });

    const resp = await rawResp.json();
    const status = resp.data.attributes.status;

    if (status === 'completed') {
        return KybState.finished;
    }

    if (status === 'failed') {
        return KybState.failed;
    }

    if (
        status === 'created' ||
        status === 'pending' ||
        status === 'needs_review' ||
        status === 'approved' ||
        status === 'declined'
    ) {
        return KybState.pending;
    }

    return null;
}
