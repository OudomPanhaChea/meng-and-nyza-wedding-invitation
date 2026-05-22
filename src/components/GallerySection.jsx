import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import SectionTitle from './SectionTitle';

gsap.registerPlugin(ScrollTrigger);

// Bundle every image in src/assets/galleries at build time, resolved to
// final asset URLs. Vite's glob import returns `{ path: url }`.
const photoModules = import.meta.glob(
  '../assets/galleries/*.{jpg,jpeg,png,webp}',
  { eager: true, query: '?url', import: 'default' },
);

// Parse filenames of the form `photo<group>.<sub>.<ext>` into structured
// entries. Group/sub control adjacency: photos with the same group stay
// next to each other in the grid; sub controls in-group order.
const PHOTO_ENTRIES = Object.entries(photoModules)
  .map(([path, src]) => {
    const m = path.match(/photo(\d+)\.(\d+)\./i);
    return {
      src,
      group: m ? Number(m[1]) : Number.POSITIVE_INFINITY,
      sub: m ? Number(m[2]) : Number.POSITIVE_INFINITY,
    };
  })
  .sort((a, b) => a.group - b.group || a.sub - b.sub);

// Probe the natural dimensions of an image URL → resolve with its
// orientation flag. Used to decide layout (landscape vs portrait).
function loadAspect(entry) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () =>
      resolve({ ...entry, portrait: img.naturalHeight > img.naturalWidth });
    img.onerror = () => resolve({ ...entry, portrait: false });
    img.src = entry.src;
  });
}

// Build the grid layout from grouped photos. Layout rules:
//   • Photos stay grouped — items from group N never sit next to items
//     from a different group.
//   • Landscapes inside a group → `landscape-single` (full row).
//   • Portraits inside a group → paired in order into `pair` rows
//     (two portraits side-by-side). The pair must be from the same
//     group; leftover odd portraits become `portrait-single`.
//   • Group 1 exception: the very first image (photo1.1) is always
//     emitted as a `portrait-single` (full-row feature shot), then the
//     standard rules apply to the rest of the group.
// Block types:
//   - pair             → two portraits side-by-side
//   - portrait-single  → one portrait spanning the full row
//   - landscape-single → one landscape spanning the full row
function buildBlocks(photos) {
  const blocks = [];

  // Bucket photos by group, preserving sub order (input is already sorted).
  const buckets = new Map();
  for (const p of photos) {
    if (!buckets.has(p.group)) buckets.set(p.group, []);
    buckets.get(p.group).push(p);
  }

  const sortedGroups = [...buckets.keys()].sort((a, b) => a - b);

  for (const g of sortedGroups) {
    const items = buckets.get(g);
    let startIdx = 0;

    // Group-1 exception: lead with photo1.1 as a full-row portrait.
    if (g === 1 && items.length > 0) {
      blocks.push({ type: 'portrait-single', item: items[0] });
      startIdx = 1;
    }

    // Walk the rest of the group in order. Portraits collect into a
    // queue so consecutive pairs land side-by-side; landscapes flush
    // the queue (emitting a solo for a stranded single) before placing
    // themselves as a full-row.
    const queue = [];
    const drainPair = () => {
      while (queue.length >= 2) {
        blocks.push({
          type: 'pair',
          items: [queue.shift(), queue.shift()],
        });
      }
    };
    const drainSolo = () => {
      while (queue.length > 0) {
        blocks.push({ type: 'portrait-single', item: queue.shift() });
      }
    };

    for (let i = startIdx; i < items.length; i++) {
      const p = items[i];
      if (p.portrait) {
        queue.push(p);
        if (queue.length === 2) drainPair();
      } else {
        // Landscape — emit any complete pairs first, promote any
        // stranded single portrait to a full-row, then place landscape.
        drainPair();
        drainSolo();
        blocks.push({ type: 'landscape-single', item: p });
      }
    }

    // End of group — emit any remaining portraits (last one solo if odd).
    drainPair();
    drainSolo();
  }

  return blocks;
}

// Flatten blocks into a linear photo list (for lightbox navigation order).
function flattenPhotos(blocks) {
  const out = [];
  for (const b of blocks) {
    if (b.type === 'pair') out.push(...b.items);
    else out.push(b.item);
  }
  return out;
}

export default function GallerySection() {
  const ref = useRef(null);
  const gridRef = useRef(null);
  const [photos, setPhotos] = useState(null);
  const [selectedIdx, setSelectedIdx] = useState(null);

  // Detect each image's orientation once on mount.
  useEffect(() => {
    let alive = true;
    Promise.all(PHOTO_ENTRIES.map(loadAspect)).then((list) => {
      if (alive) setPhotos(list);
    });
    return () => {
      alive = false;
    };
  }, []);

  // Block layout is computed once (shuffled) when photos arrive so the
  // grid doesn't reshuffle on every render.
  const blocks = useMemo(
    () => (photos ? buildBlocks(photos) : []),
    [photos],
  );
  const orderedPhotos = useMemo(() => flattenPhotos(blocks), [blocks]);
  const selected =
    selectedIdx !== null ? orderedPhotos[selectedIdx] : null;

  // Per-tile scroll-triggered entrance: full-width tiles float up,
  // paired tiles slide in from their respective sides.
  useEffect(() => {
    const section = ref.current;
    const el = gridRef.current;
    if (!el || blocks.length === 0) return;

    const ctx = gsap.context(() => {
      // Title + divider rise into view only once they themselves enter
      // the viewport — the section element is tall, so triggering off
      // the section's top would fire these long before they're on screen.
      gsap.fromTo(
        '.gallery-title',
        { opacity: 0, y: 28, filter: 'blur(6px)' },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 1.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.gallery-title',
            start: 'top 85%',
            once: true,
          },
        },
      );
      gsap.fromTo(
        '.gallery-divider',
        { opacity: 0, y: 18, filter: 'blur(5px)' },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 1.6,
          ease: 'power2.out',
          delay: 0.35,
          scrollTrigger: {
            trigger: '.gallery-divider',
            start: 'top 88%',
            once: true,
          },
        },
      );

      const tween = (selector, fromVars) => {
        el.querySelectorAll(selector).forEach((node) => {
          gsap.from(node, {
            ...fromVars,
            opacity: 0,
            duration: 1.6,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: node,
              start: 'top 90%',
              once: true,
            },
          });
        });
      };

      tween('.gallery-tile-full', { y: 80 });
      tween('.gallery-tile-pair-left', { x: -100 });
      tween('.gallery-tile-pair-right', { x: 100 });
    }, section);

    return () => ctx.revert();
  }, [blocks]);

  const openLightbox = useCallback(
    (photo) => {
      const idx = orderedPhotos.indexOf(photo);
      if (idx === -1) return;
      setSelectedIdx(idx);
      gsap.from('.lightbox-card', {
        scale: 0.92,
        opacity: 0,
        duration: 0.3,
        ease: 'power2.out',
      });
    },
    [orderedPhotos],
  );

  const closeLightbox = useCallback(() => {
    gsap.to('.lightbox-card', {
      scale: 0.92,
      opacity: 0,
      duration: 0.2,
      onComplete: () => setSelectedIdx(null),
    });
  }, []);

  const goPrev = useCallback(() => {
    setSelectedIdx((i) =>
      i === null ? null : (i - 1 + orderedPhotos.length) % orderedPhotos.length,
    );
    gsap.fromTo(
      '.lightbox-card',
      { x: -24, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.25, ease: 'power2.out' },
    );
  }, [orderedPhotos.length]);

  const goNext = useCallback(() => {
    setSelectedIdx((i) =>
      i === null ? null : (i + 1) % orderedPhotos.length,
    );
    gsap.fromTo(
      '.lightbox-card',
      { x: 24, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.25, ease: 'power2.out' },
    );
  }, [orderedPhotos.length]);

  // Keyboard navigation while lightbox is open.
  useEffect(() => {
    if (selectedIdx === null) return;
    const onKey = (e) => {
      if (e.key === 'Escape') closeLightbox();
      else if (e.key === 'ArrowRight') goNext();
      else if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedIdx, closeLightbox, goNext, goPrev]);

  // Lock background scroll while lightbox is open.
  useEffect(() => {
    if (selectedIdx === null) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [selectedIdx]);

  return (
    <section id="gallery" ref={ref} className="px-5 py-7">
      <div className="max-w-xl mx-auto space-y-5">
        <SectionTitle className="gallery">វិចិត្រសាល</SectionTitle>

        {/* Photo grid */}
        <div ref={gridRef} className="grid grid-cols-2 gap-3">
          {blocks.map((block, i) => {
            if (block.type === 'pair') {
              return block.items.map((p, j) => (
                <Tile
                  key={`p-${i}-${j}`}
                  src={p.src}
                  className={`col-span-1 aspect-[3/4] ${
                    j === 0 ? 'gallery-tile-pair-left' : 'gallery-tile-pair-right'
                  }`}
                  onClick={() => openLightbox(p)}
                />
              ));
            }
            if (block.type === 'portrait-single') {
              return (
                <Tile
                  key={`ps-${i}`}
                  src={block.item.src}
                  className="col-span-2 aspect-[3/4] gallery-tile-full"
                  onClick={() => openLightbox(block.item)}
                />
              );
            }
            return (
              <Tile
                key={`ls-${i}`}
                src={block.item.src}
                className="col-span-2 aspect-[3/2] gallery-tile-full"
                onClick={() => openLightbox(block.item)}
              />
            );
          })}
        </div>
      </div>

      {/* Lightbox — rendered via portal to document.body to escape any
          transformed ancestor (which would otherwise re-anchor `fixed`
          positioning and pull the modal off-center). */}
      {selected &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md"
            onClick={closeLightbox}
          >
          {/* Close (top-right) */}
          <button
            type="button"
            aria-label="Close"
            className="absolute top-5 right-5 z-10 flex items-center justify-center w-11 h-11 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              closeLightbox();
            }}
          >
            <X size={22} strokeWidth={2.25} />
          </button>

          {/* Counter (top-left) */}
          <div className="absolute top-5 left-5 z-10 font-hanuman text-gold-600 font-semibold tracking-wider">
            {selectedIdx + 1} / {orderedPhotos.length}
          </div>

          {/* Prev */}
          <button
            type="button"
            aria-label="Previous"
            className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-11 h-11 rounded-full bg-white/10 text-gold-600 hover:bg-white/20 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
          >
            <ChevronLeft size={26} strokeWidth={2.25} />
          </button>

          {/* Next */}
          <button
            type="button"
            aria-label="Next"
            className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-11 h-11 rounded-full bg-white/10 text-gold-600 hover:bg-white/20 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
          >
            <ChevronRight size={26} strokeWidth={2.25} />
          </button>

          {/* Image */}
          <div
            className="lightbox-card relative max-w-[92vw] max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selected.src}
              alt=""
              className="block max-w-[92vw] max-h-[85vh] object-contain"
            />
          </div>
          </div>,
          document.body,
        )}
    </section>
  );
}

function Tile({ src, className, onClick }) {
  return (
    <div
      className={`${className} overflow-hidden rounded-lg cursor-pointer group border border-gold-600 relative`}
      onClick={onClick}
    >
      <img
        src={src}
        alt=""
        loading="lazy"
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-101"
      />
    </div>
  );
}
