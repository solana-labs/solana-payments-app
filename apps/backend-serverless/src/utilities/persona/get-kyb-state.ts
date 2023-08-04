import { KybState } from '@prisma/client';
import fetch from 'node-fetch';
import { DependencyError } from '../../errors/dependency.error.js';
import { MissingEnvError } from '../../errors/missing-env.error.js';

export const getKybState = async (inquiryId: string): Promise<KybState> => {
    const personaApiKey = process.env.PERSONA_API_KEY;

    if (personaApiKey == null) {
        throw new MissingEnvError('persona api key');
    }

    const rawResp = await fetch(`https://withpersona.com/api/v1/inquiries/${inquiryId}`, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.PERSONA_API_KEY}`,
        },
    });

    const resp = (await rawResp.json()) as any;

    let status: string;

    try {
        status = resp.data.attributes.status;
    } catch (error) {
        throw new DependencyError('persona couldnt find status');
    }

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

    // console.log('status', status);
    throw new DependencyError('persona unknown state, reached end of options');
};
