import { Suspense } from "react";
import Coffees from "./_components/Home/Coffees/Coffees";
import Community from "./_components/Home/Community/Community";
import Landing from "./_components/Home/Landing/Landing";
import Shop from "./_components/Home/Shop/Shop";
import Subscribe from "./_components/Home/Subscribe/Subscribe";
import TheRoster from "./_components/Home/TheRoster/TheRoster";
import ErrorHandler from "./_components/ErrorHandler";


export default function Home() {
    return (
        <>
            <Suspense fallback={null}>
                <ErrorHandler />
            </Suspense>
            <Landing />
            <Coffees />
            <Shop />
            {/* <Subscribe /> */}
            <Community />
            <TheRoster />
        </>
    );
}
