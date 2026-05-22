import { useState, useEffect, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import OpeningScreen from "./components/OpeningScreen";
import HeroSection from "./components/HeroSection";
import ScheduleSection from "./components/ScheduleSection";
import VenueSection from "./components/VenueSection";
import GallerySection from "./components/GallerySection";
import BlessingSection from "./components/BlessingSection";
import Footer from "./components/Footer";
import FallingPetals from "./components/FallingPetals";
import HomePage from "./components/HomePage";
import { useImagePreload } from "./hooks/useImagePreload";
import { decodeGuestSlug } from "./lib/guestSlug";
import backgroundImg from "./assets/background.png";
import roofFlowersImg from "./assets/roof-flowers.png";
import bottomFlowersImg from "./assets/bottom-flowers.png";
import coupleNameImg from "./assets/seumeng_and_nisa.png";
import textFrameImg from "./assets/text-frame.png";
import themeSong from "./assets/audios/theme-song.mp3";

/* Critical decoration the opening sequence needs before it can play
   convincingly — the cinematic flash → reveal looks broken if any of
   these are still downloading when the animation kicks off. */
const PRELOAD_IMAGES = [
  backgroundImg,
  roofFlowersImg,
  bottomFlowersImg,
  coupleNameImg,
  textFrameImg,
];

/* ── Always-mounted photo background + animated decoration ──────────────
   Renders regardless of `opened` so the background is never absent.
   While OpeningScreen (z-50) is up, this entire layer is hidden beneath
   it; the elements start in their pre-entrance state so when `opened`
   flips to true they play the same cinematic zoom-out reveal as the
   intro — bridged by OpenedContent's opaque white flash.                 */
function FixedDecoration({ opened }) {
  const bgRef = useRef(null);
  const roofRef = useRef(null);
  const bottomRef = useRef(null);

  // Pre-entrance state set immediately on mount — invisible behind
  // OpeningScreen until the cinematic entrance plays.
  useEffect(() => {
    gsap.set(bgRef.current, {
      filter: "blur(18px) brightness(2.6)",
      scale: 1.28,
      y: 12,
    });
    gsap.set(roofRef.current, {
      opacity: 0,
      y: -14,
      scale: 1.12,
      transformOrigin: "50% 0%",
    });
    gsap.set(bottomRef.current, {
      opacity: 0,
      y: 14,
      scale: 1.12,
      transformOrigin: "50% 100%",
    });
  }, []);

  // Cinematic entrance + ambient loops — fire when opened flips to true.
  useEffect(() => {
    if (!opened) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      // ① BG lens-pullback — heavy zoom + blur resolves to the final frame.
      tl.to(bgRef.current, {
        filter: "blur(0px) brightness(1)",
        scale: 1.04,
        y: 0,
        duration: 2.6,
        ease: "power3.out",
      })
        // ② Roof + bottom flowers settle in from top and bottom edges.
        .to(
          roofRef.current,
          { opacity: 1, y: 0, scale: 1, duration: 2.0, ease: "power3.out" },
          "<+0.10",
        )
        .to(
          bottomRef.current,
          { opacity: 1, y: 0, scale: 1, duration: 2.0, ease: "power3.out" },
          "<",
        );

      // Ambient loops — delayed so they don't fight the entrance.
      gsap.to(roofRef.current, {
        y: 4,
        duration: 4.8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        transformOrigin: "50% 0%",
        delay: 2.4,
      });
      gsap.to(bottomRef.current, {
        y: -4,
        duration: 5.2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        transformOrigin: "50% 100%",
        delay: 2.4,
      });
      // Slow breathing zoom takes over after the entrance settles.
      gsap.to(bgRef.current, {
        scale: 1.08,
        duration: 24,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 3.0,
      });
    });
    return () => ctx.revert();
  }, [opened]);

  return (
    <>
      {/* Fixed photo background — z:1, always behind everything.
          overflow-hidden on the parent so the scaled bg never shows edges. */}
      <div
        className="fixed inset-0 mx-auto w-full app-col overflow-hidden"
        style={{ zIndex: 1 }}
      >
        <div ref={bgRef} className="absolute inset-0">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${backgroundImg})` }}
          />
          {/* White overlay — sits on the photo background, beneath all content */}
          <div className="absolute inset-0 bg-white/30 pointer-events-none" />
        </div>
      </div>

      {/* Fixed roof + bottom flowers — z:30, anchored to top and bottom edges */}
      <div
        className="fixed inset-0 mx-auto w-full app-col pointer-events-none overflow-hidden"
        style={{ zIndex: 30 }}
      >
        <div
          ref={roofRef}
          className="absolute select-none left-1/2 -translate-x-1/2"
          style={{ top: "-120px", width: "112%" }}
        >
          <img
            src={roofFlowersImg}
            alt=""
            draggable={false}
            className="w-full block"
          />
        </div>
        {/* Soft pink fog overlay — subtle haze around the roof flowers */}
        {/* <div
          className="absolute top-0 left-0 w-full"
          style={{
            height: "180px",
            background:
              "linear-gradient(to bottom, rgba(255,200,215,0.55) 0%, rgba(255,210,222,0.20) 10%, rgba(255,220,230,0) 20%)",
          }}
        /> */}
        {/* <div
          ref={bottomRef}
          className="absolute bottom-flowers-anchor select-none left-1/2 -translate-x-1/2 blur-[0.5px]"
          style={{ width: "100%" }}
        >
          <img
            src={bottomFlowersImg}
            alt=""
            draggable={false}
            className="w-full block"
          />
        </div> */}
      </div>
    </>
  );
}

/* ── Content shown after the envelope opens ────────────────────────────
   Mirrors the intro: opaque white flash on mount (handing off from the
   OpeningScreen exit flash so the swap is invisible), then a blurry-
   bright dissolve with a layered zoom-out — content starts slightly
   larger and shrinks to its final size, matching the FixedDecoration
   cinematic entrance running in parallel.                                */
function OpenedContent() {
  const wrapRef = useRef(null);
  const flashRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Clean opacity + scale only — no blur/brightness filter on the wrap.
      // The earlier filter smeared the content over the dark backdrop, which
      // read as a "black flash" during the flash hand-off.
      gsap.set(wrapRef.current, {
        opacity: 0,
        scale: 1.06,
        transformOrigin: "50% 50%",
      });

      const tl = gsap.timeline();
      tl
        // ① Hold the flash fully opaque briefly so FixedDecoration's entrance
        //    and the HeroSection text reveal get a head start underneath,
        //    then fade. Eliminates the "dark gap" between flash and content.
        .set(flashRef.current, { opacity: 1 })
        .to(flashRef.current, {
          opacity: 0,
          duration: 1.3,
          ease: "power2.inOut",
          delay: 0.25,
        })
        // ② Content fades + zooms in (big → current) under the flash so
        //    it's already partly visible by the time the flash is gone.
        .to(
          wrapRef.current,
          {
            opacity: 1,
            scale: 1,
            duration: 1.6,
            ease: "power3.out",
          },
          "<",
        );
    });
    return () => ctx.revert();
  }, []);

  return (
    <>
      {/* Content wrapper — starts invisible + slightly zoomed in, dissolves in */}
      <div
        ref={wrapRef}
        style={{ position: "relative", zIndex: 2, opacity: 0 }}
      >
        <main>
          <HeroSection />
          {/* <CoupleSection /> */}
          <ScheduleSection />
          <VenueSection />
          <GallerySection />
          <BlessingSection />
        </main>
        <Footer />
      </div>

      {/* White flash — z:55, above branches (z:30), full-screen cover */}
      <div
        ref={flashRef}
        className="fixed inset-0 mx-auto w-full app-col pointer-events-none"
        style={{ background: "white", zIndex: 55 }}
      />
    </>
  );
}

function Invitation({ guestName }) {
  const [opened, setOpened] = useState(false);
  const audioRef = useRef(null);
  const assetsReady = useImagePreload(PRELOAD_IMAGES);

  // Theme-song playback. Browsers block autoplay-with-sound until a user
  // gesture lands, so we (1) try to start immediately on mount in case
  // the browser allows it (e.g. user has interacted with this origin
  // recently), and (2) register one-shot listeners for the first
  // pointer/touch/key event — whichever lands first (typically the tap
  // on the "open" button) starts playback synchronously inside that
  // gesture, satisfying the autoplay policy.
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.volume = 0.7;
    a.play().catch(() => {});

    const start = () => {
      a.play().catch(() => {});
      window.removeEventListener("pointerdown", start);
      window.removeEventListener("touchstart", start);
      window.removeEventListener("keydown", start);
    };
    window.addEventListener("pointerdown", start);
    window.addEventListener("touchstart", start);
    window.addEventListener("keydown", start);

    return () => {
      window.removeEventListener("pointerdown", start);
      window.removeEventListener("touchstart", start);
      window.removeEventListener("keydown", start);
    };
  }, []);

  // Lock scrolling DURING THE INTRO only. Once the user opens the
  // invitation, the lock is released so the content sections (Hero,
  // Couple, Schedule, Venue, Gallery, Blessing, Footer) can scroll.
  useLayoutEffect(() => {
    if (opened) return; // intro is gone — let the page scroll normally
    const html = document.documentElement;
    const body = document.body;
    const root = document.getElementById("root");
    const prev = {
      htmlOverflow: html.style.overflow,
      bodyOverflow: body.style.overflow,
      bodyOverscroll: body.style.overscrollBehavior,
      bodyTouchAction: body.style.touchAction,
      rootOverflow: root ? root.style.overflow : "",
      rootHeight: root ? root.style.height : "",
    };
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.overscrollBehavior = "none";
    body.style.touchAction = "none";
    if (root) {
      root.style.overflow = "hidden";
      root.style.height = "100dvh";
    }
    return () => {
      html.style.overflow = prev.htmlOverflow;
      body.style.overflow = prev.bodyOverflow;
      body.style.overscrollBehavior = prev.bodyOverscroll;
      body.style.touchAction = prev.bodyTouchAction;
      if (root) {
        root.style.overflow = prev.rootOverflow;
        root.style.height = prev.rootHeight;
      }
    };
  }, [opened]);

  return (
    <>
      {/* Always rendered — ensures photo background is never absent.
          Holds pre-entrance state while OpeningScreen covers it, then
          plays the cinematic zoom-out when `opened` flips to true.    */}
      <FixedDecoration opened={opened} />

      {/* Ambient falling petals — z:25, between content (z:2) and the
          decorative roof/bottom flowers (z:30). Hidden under the
          OpeningScreen (z:50) during the intro.                        */}
      <FallingPetals zIndex={25} />

      {/* Theme song — looped from the moment the user opens the invitation.
          Browsers block autoplay until a user gesture, so we kick playback
          off inside the open-button handler (a synchronous click). */}
      <audio
        ref={audioRef}
        src={themeSong}
        loop
        preload="auto"
        playsInline
      />

      {/* Opening screen sits on top (z-50); unmounts after the button click.
          `assetsReady` gates the entrance animation so the cinematic flash
          → reveal never plays while the photo background is still loading
          (the white flash overlay stays opaque, acting as the loader). */}
      {!opened && (
        <OpeningScreen
          onOpen={() => setOpened(true)}
          guestName={guestName}
          assetsReady={assetsReady}
        />
      )}

      {/* Main content mounts and plays its own entry transition */}
      {opened && <OpenedContent />}
    </>
  );
}

/* ── Tiny no-library router ─────────────────────────────────────────────
   "/"               → HomePage (guest-link generator)
   "/i" | "/i/<n>"   → Invitation flow with optional guest name in the path
   Legacy:
     "/invitation"   → Invitation, with ?g= / ?guest= read from query
   anything else     → HomePage as a safe default                       */
export default function App() {
  const pathname = window.location.pathname.replace(/\/+$/, "") || "/";

  // New short path: /i or /i/<slug>. The slug is base64url-encoded
  // (decodeGuestSlug also handles legacy percent-encoded paths).
  if (pathname === "/i" || pathname.startsWith("/i/")) {
    const guestName = decodeGuestSlug(pathname.slice(3));
    return <Invitation guestName={guestName} />;
  }

  // Legacy path: /invitation?g=<name>  or  ?guest=<name>
  if (pathname === "/invitation") {
    const params = new URLSearchParams(window.location.search);
    const guestName = params.get("g") || params.get("guest") || "";
    return <Invitation guestName={guestName} />;
  }

  return <HomePage />;
}
