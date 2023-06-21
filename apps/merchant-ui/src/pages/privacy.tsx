import { DefaultLayout } from '@/components/DefaultLayout';
import { DefaultLayoutContent } from '@/components/DefaultLayoutContent';
import { DefaultLayoutScreenTitle } from '@/components/DefaultLayoutScreenTitle';
import { privacyPolicySections } from '@/lib/policies';
import Head from 'next/head';
import React from 'react';

const title = 'Privacy Policy';

export default function Privacy() {
    return (
        <>
            <Head>
                <title>Solana Pay - {title}</title>
                <meta name="description" content={title} />
            </Head>
            <div className="h-screen w-screen">
                <DefaultLayout className="h-full w-full">
                    <DefaultLayoutContent>
                        <DefaultLayoutScreenTitle>{title}</DefaultLayoutScreenTitle>
                        <div className="text-justify bg-white rounded-lg text-sm leading-6 mt-16">
                            {privacyPolicySections.map((section, index) => (
                                <React.Fragment key={index}>
                                    <h3 className="font-semibold text-2xl">{section.title}</h3>
                                    {section.paragraphs.map((paragraph, i) => (
                                        <p className={i === 0 ? '' : 'mt-4'} key={i}>
                                            {paragraph}
                                        </p>
                                    ))}
                                </React.Fragment>
                            ))}
                        </div>
                    </DefaultLayoutContent>
                </DefaultLayout>
            </div>
        </>
    );
}
