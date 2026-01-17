"use client";

import React, { useCallback } from "react";
import styles from "./Coffees.module.css";
import Image from "next/image";
import coffeImg from "./1.png";
import useEmblaCarousel from "embla-carousel-react";
import { useRouter } from "next/navigation";

const coffeeData = [
  {
    id: 1330,
    title: "Indonesia ALAMIN Co-Fermented Jasmine",
    desc: "Jasmine tea, honey, floral",
    slug: "indonesia-alamin-co-fermented-jasmine",
    img:
      "https://wordpressbackend.whitemantis.ae/wp-content/uploads/2026/01/Indonesia-jasmine-250g.png" ||
      coffeImg,
  },
  {
    id: 1301,
    title: "Indonesia Meriah Classic Natural",
    desc: "Floral, berry, honey",
    slug: "indonesia-meriah-classic-natural",
    img:
      "https://wordpressbackend.whitemantis.ae/wp-content/uploads/2026/01/Classic-Natural-250g-1.png" ||
      coffeImg,
  },
  {
    id: 1290,
    title: "Indonesia Bener Meriah Triple Wet Hull",
    desc: "Brown sugar, chocolate, black tea",
    slug: "indonesia-bener-meriah-triple-wet-hull",
    img:
      "https://wordpressbackend.whitemantis.ae/wp-content/uploads/2026/01/Wet-hulled-250g.png" ||
      coffeImg,
  },
  {
    id: 1280,
    title: "El Salvador Santa Leticia",
    desc: "Red apple, plum, caramel",
    slug: "el-salvador-santa-leticia",
    img:
      "https://wordpressbackend.whitemantis.ae/wp-content/uploads/2026/01/El-Salvador-SL.png" ||
      coffeImg,
  },
  {
    id: 1262,
    title: "Colombia Huila 720",
    desc: "Cinnamon, chocolate, tropical fruit",
    slug: "colombia-huila-720",
    img:
      "https://wordpressbackend.whitemantis.ae/wp-content/uploads/2026/01/Colombia-Huila-720-250g.png" ||
      coffeImg,
  },
];

const Coffees = () => {
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);
  const router = useRouter();

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
  });

  React.useEffect(() => {
    if (!emblaApi) return;

    const updateButtons = () => {
      setCanScrollPrev(emblaApi.canScrollPrev());
      setCanScrollNext(emblaApi.canScrollNext());
    };

    updateButtons();

    emblaApi.on("select", updateButtons);
    emblaApi.on("reInit", updateButtons);

    return () => {
      emblaApi.off("select", updateButtons);
      emblaApi.off("reInit", updateButtons);
    };
  }, [emblaApi]);

  const scrollPrev = useCallback(() => {
    if (!emblaApi || !canScrollPrev) return;
    emblaApi.scrollPrev();
  }, [emblaApi, canScrollPrev]);

  const scrollNext = useCallback(() => {
    if (!emblaApi || !canScrollNext) return;
    emblaApi.scrollNext();
  }, [emblaApi, canScrollNext]);

  return (
    <div className={styles.Main}>
      <div className={styles.MainContainer}>
        <div className={styles.Left}>
          <div className={styles.LeftTop}>
            <h3>Selected coffees</h3>
            <p>
              The White Mantis coffee experience, delivered seamlessly to your
              door. Subscribe for a never-ending supply of excellence.
            </p>
          </div>

          <div className={styles.LeftBottom}>
            <svg
              onClick={scrollPrev}
              style={{
                opacity: canScrollPrev ? 1 : 0.4,
                cursor: canScrollPrev ? "pointer" : "not-allowed",
              }}
              width="47"
              height="47"
              viewBox="0 0 47 47"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="23.0469" cy="23.0469" r="23.0469" fill="#6C7A5F" />
              <path
                d="M27.9023 32.7578L18.1914 23.0469L27.9023 13.3359"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            <svg
              onClick={scrollNext}
              style={{
                opacity: canScrollNext ? 1 : 0.4,
                cursor: canScrollNext ? "pointer" : "not-allowed",
              }}
              width="47"
              height="47"
              viewBox="0 0 47 47"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="23.0469" cy="23.0469" r="23.0469" fill="#6C7A5F" />
              <path
                d="M18.1914 13.3359L27.9023 23.0469L18.1914 32.7578"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        <div className={styles.Right}>
          <div className={styles.Embla} ref={emblaRef}>
            <div className={styles.EmblaContainer} style={{ cursor: "pointer" }}>
              {coffeeData.map((item, index) => (
                <div
                  onClick={() => router.push(`/products/${item.slug}-${item.id}`)}
                  className={styles.EmblaSlide}
                  key={`coffee-${item.title.replace(/\s+/g, "-").toLowerCase()}`}
                >
                  <div className={styles.Card}>
                    <div className={styles.CardTop}>
                      <div className={styles.LinkSvg}>
                        <svg
                          width="30"
                          height="30"
                          viewBox="0 0 30 30"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <rect
                            x="0.5"
                            y="-0.5"
                            width="29"
                            height="29"
                            transform="matrix(1 0 0 -1 0 29)"
                            stroke="#6C7A5F"
                          />
                          <path
                            d="M21.0029 20.2479H19.0039V11.5562L9.41838 21.2598L8.00904 19.8331L17.5945 10.1295H9.00857V8.10583H21.0029V20.2479Z"
                            fill="#6C7A5F"
                          />
                        </svg>
                      </div>

                      <div className={styles.ProductImage}>
                        <Image
                          src={item.img}
                          alt={item.title}
                          width={300}
                          height={300}
                        />
                      </div>
                    </div>

                    <div className={styles.CardBottom}>
                      <h3>{item.title}</h3>
                      <p>{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.MobileArrows}>
          <svg
            onClick={scrollPrev}
            style={{
              opacity: canScrollPrev ? 1 : 0.4,
              cursor: canScrollPrev ? "pointer" : "not-allowed",
            }}
            width="47"
            height="47"
            viewBox="0 0 47 47"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="23.0469" cy="23.0469" r="23.0469" fill="#6C7A5F" />
            <path
              d="M27.9023 32.7578L18.1914 23.0469L27.9023 13.3359"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <svg
            onClick={scrollNext}
            style={{
              opacity: canScrollNext ? 1 : 0.4,
              cursor: canScrollNext ? "pointer" : "not-allowed",
            }}
            width="47"
            height="47"
            viewBox="0 0 47 47"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="23.0469" cy="23.0469" r="23.0469" fill="#6C7A5F" />
            <path
              d="M18.1914 13.3359L27.9023 23.0469L18.1914 32.7578"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default Coffees;

