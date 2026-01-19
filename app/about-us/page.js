import styles from "./About.module.css";
import Landing from "./_components/Landing/Landing";
import OurPhilosophy from "./_components/OurPhilosophy/OurPhilosophy";
import Recognitions from "./_components/Recognitions/Recognitions";
import Partnerships from "./_components/Partnerships/Partnerships";
import WhyUs from "./_components/WhyUs/WhyUs";
import OurValues from "./_components/OurValues/OurValues";

export default function AboutUs() {
  return (
    <>
      <div className="TopPaddingForMobile"></div>
      <Landing />
      <div className="sectionPadding"></div>
      <OurPhilosophy />
      <div className="sectionPadding"></div>
      <OurValues />
      <div className="sectionPadding"></div>
      <WhyUs />
      <div className="sectionPadding"></div>
      <Partnerships />
      <div className="sectionPadding"></div>
      {/* <Recognitions /> */}
    </>
  );
}
