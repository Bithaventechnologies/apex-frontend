// Swap these for licensed photos (Unsplash / Pexels / your own shoot).
// Drop files in /public/images and use paths like "/images/hero-1.jpg".
// pravatar.cc is only a stand-in so the layout has real faces from day one.
const p = (id: number, size = 400) => `https://i.pravatar.cc/${size}?img=${id}`;

export const images = {
  heroMain: p(47, 700),
  heroSecondary: p(12, 500),
  about: p(33, 800),
   auth: p(32, 900),
  testimonials: {
    adaeze: p(5, 200),
    tunde: p(15, 200),
    grace: p(45, 200),
  },
};