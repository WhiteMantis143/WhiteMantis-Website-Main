  // import Listing from "./_components/Listing/Listing";
  // import NavigationStrip from "./_components/NavigationStrip/NavigationStrip";
  // import Landing from "./_components/Landing/Landing";

  // export default function ShopCoffeeCapsules() {
  //   return (
  //     <>
  //       <Landing />
  //       <NavigationStrip />
  //       <Listing />
        

  //     </>
  //   );
  // }
  import { redirect } from "next/navigation";

  export default function ShopCoffeeCapsules() {
    redirect("/");
  }