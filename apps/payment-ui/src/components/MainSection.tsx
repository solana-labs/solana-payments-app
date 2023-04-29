import React from "react";
import DisplaySection from "./DisplaySection";
import CheckoutSection from "./CheckoutSection";

const MainSection = () => {
  return (
    <div className="flex flex-col h-[100vh] w-full max-w-2xl mx-auto">
      <DisplaySection />
      <CheckoutSection />
    </div>
  );
};

export default MainSection;
