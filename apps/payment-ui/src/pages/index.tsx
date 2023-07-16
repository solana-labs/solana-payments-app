import DisplaySection from '@/components/DisplaySection';
import FooterSection from '@/components/FooterSection';
import MainSection from '@/components/MainSection';
import React from 'react';

export default function Home() {
    return (
        <React.Fragment>
            <div className="flex flex-col h-screen bg-black">
                <DisplaySection />
                <MainSection />
                <FooterSection />
            </div>
        </React.Fragment>
    );
}
