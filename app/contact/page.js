import Image from "next/image";
import Landing from "./_components/Landing/Landing";
import MightFit from "./_components/MightFit/MightFit";
import Career from "./_components/Career/Career";
import Location from "./_components/Location/Location";
import ContactForm from "./_components/ContactForm/ContactForm";

export default function contact() {
  return (
    <>
      <Landing />

      <ContactForm />
      <Location />
      {/* <Career />*/}
      {/* <MightFit /> */}
    </>
  );
}
