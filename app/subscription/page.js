import Landing from "./_components/Landing/Landing";
import Subscribe from "./_components/Subscribe/Subscribe";

import FaqSection from "./_components/FaqSection/FaqSection";

import StepsRender from "./_components/Steps/StepsRender";
import SubToday from "./_components/SubToday/SubToday";

export default function Subscription() {
  return (
    <>
     {/* <div className="TopPaddingForMobile"></div>
      <Landing />
      <div className="sectionPadding"></div>
      <Subscribe />
      <div className="sectionPadding"></div>
      <StepsRender /> */}
      <div className="sectionPadding"></div>
      <SubToday />
      <div className="sectionPadding"></div>
      {/* <FaqSection />
      <div className="sectionPadding"></div> */}
    </>
  );
}
