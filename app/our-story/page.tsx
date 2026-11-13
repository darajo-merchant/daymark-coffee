import type { Metadata } from "next";
import { ArrowIcon } from "../components/arrow-icon";
import { BeanMark } from "../components/bean-mark";
import { LineIcon } from "../components/line-icons";
import { PageHero } from "../components/page-hero";
import { ScrollMotion } from "../components/scroll-motion";
import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";
import { StoryChapters, type StoryChapter } from "../components/story-chapters";

export const metadata: Metadata = {
  title: "Our Story | Daymark Coffee",
  description:
    "The story behind Daymark: a name borrowed from the landmarks sailors steer by, coffee as a welcome, and care in every cup.",
  alternates: { canonical: "/our-story" },
};

// The footer shows the live address/hours, so this page renders per request like the others.
export const dynamic = "force-dynamic";

// Written to be true of any day at Daymark: no invented dates, founders or sourcing claims.
// The owner can add their own founding details here when they want to.
const chapters: StoryChapter[] = [
  {
    id: "the-name",
    name: "The name",
    title: <>A mark to find {" "}<br />your <em>way.</em></>,
    paragraphs: [
      "Long before maps lived in our pockets, sailors watched the coast for daymarks: towers, beacons and painted landmarks they could see in daylight and steer by.",
      "A daymark tells you where you are, and which way to go next. We liked the idea of a café being that for someone's day: a place you can count on, one good moment to set your course by.",
    ],
    image: "/media/hero-espresso-poster.webp",
    alt: "A fresh espresso in warm, low light",
  },
  {
    id: "the-welcome",
    name: "The welcome",
    title: <>Coffee has always {" "}<br />meant <em>welcome.</em></>,
    paragraphs: [
      "Across the Horn of Africa, coffee has long been part of how guests are received: a fresh pot set down, a cup poured before anything else is said. It means you are welcome, so stay a while.",
      "That is the feeling we want to carry: a warm greeting, an unhurried table, and a cup offered with care, whoever you are.",
    ],
    image: "/images/pages/visit-hero.webp",
    alt: "A cup of coffee on a small table by a café window",
  },
  {
    id: "the-craft",
    name: "The craft",
    title: <>Care in every {" "}<br />small <em>step.</em></>,
    paragraphs: [
      "A good cup is many small decisions: how the bean is roasted, how finely it is ground, how slowly the water meets it.",
      "None of it needs to be complicated. It just needs attention, every time, so the cup in your hands tastes the way it should.",
    ],
    image: "/media/pour-poster.webp",
    alt: "Espresso pouring into a cup",
  },
  {
    id: "the-promise",
    name: "The promise",
    title: <>A good moment, {" "}<br />kept for <em>you.</em></>,
    paragraphs: [
      "Whether you stop for a quick espresso on the way to work or settle in for an afternoon with family and friends, the promise is the same.",
      "A cup made with care, a welcome that feels like home, and room to make the moment yours.",
    ],
    image: "/media/latte-poster.webp",
    alt: "Latte art taking shape in a cup",
  },
];

// Who we are, as values a guest can feel on any visit (no invented names, dates or numbers).
const values = [
  { icon: "heart" as const, title: "Hospitality first", copy: "Every guest is welcomed like family: warmly, respectfully, and without hurry." },
  { icon: "cup" as const, title: "Quality without fuss", copy: "Carefully made coffee, served simply. No show, just a cup that tastes the way it should." },
  { icon: "pin" as const, title: "Part of the neighbourhood", copy: "A place people return to: for a morning cup, a meeting, or time with family and friends." },
];

export default function OurStoryPage() {
  return (
    <ScrollMotion>
      <div className="site-shell" id="top">
        <SiteHeader />

        <main id="main-content" tabIndex={-1} className="xp-inner">
          <PageHero
            id="story-title"
            chapter="story"
            kicker="Our story"
            title={<>Every day needs {" "}<br />a good <em>mark.</em></>}
            intro={<p>Some days need a landmark: one good moment to steer by. This is the story behind our name, our cup, and the welcome that comes with it.</p>}
            actions={
              <>
                <a className="button button-dark" href="#about-us">Read our story <ArrowIcon direction="down-right" /></a>
                <a className="xp-link" href="/menu">See the menu <ArrowIcon direction="up-right" /></a>
              </>
            }
            media={{ kind: "image", src: "/images/pages/about-hero.webp", alt: "A barista's hands holding a cup under an espresso machine", position: "45% 50%" }}
            card={
              <div className="xp-card-steps xp-card-steps--wide">
                <p className="xp-label">The story in four chapters</p>
                <ol>
                  <li><LineIcon name="pin" /><strong>Name</strong><span>A mark to steer by.</span></li>
                  <li><LineIcon name="heart" /><strong>Welcome</strong><span>Coffee as hospitality.</span></li>
                  <li><LineIcon name="flame" /><strong>Craft</strong><span>Care in every step.</span></li>
                  <li><LineIcon name="cup" /><strong>Promise</strong><span>A moment kept for you.</span></li>
                </ol>
              </div>
            }
          />

          <section className="os-about" id="about-us" aria-labelledby="about-us-title">
            <div className="os-about-copy">
              <p className="xp-label" data-reveal>About us</p>
              <h2 id="about-us-title" data-split>The people {" "}<br />behind the <em>cup.</em></h2>
              <div data-reveal>
                <p className="os-about-lead">
                  We are Daymark, a coffee house built on one simple belief: a good cup, made with care and offered
                  warmly, can make someone&rsquo;s whole day better.
                </p>
                <p className="os-about-text">
                  Behind the counter is a team that takes coffee seriously and people even more so. We learn our
                  regulars&rsquo; usual, keep the room calm and welcoming, and greet every guest like someone we were
                  expecting. Whoever you are, wherever your day is taking you, there is a seat and a cup here for you.
                </p>
              </div>
              <p className="os-about-sign" data-reveal>The Daymark team</p>
            </div>

            <ul className="os-about-values" data-reveal-group>
              {values.map((value) => (
                <li key={value.title} data-reveal-item>
                  <span className="os-about-icon"><LineIcon name={value.icon} /></span>
                  <h3>{value.title}</h3>
                  <p>{value.copy}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="os-section" aria-label="Our story, in four chapters">
            <StoryChapters chapters={chapters} />
          </section>

          <section className="os-manifesto" aria-labelledby="manifesto-title">
            <BeanMark className="os-manifesto-mark" />
            <p className="xp-label" data-reveal>What we hold on to</p>
            {/* One sentence per block, each balanced on its own: two lines on wide screens, even
                pairs on phones. (SplitText treats any <br> as a hard break, even a hidden one.) */}
            <h2 id="manifesto-title" data-split>
              <span className="os-line">Good coffee is never rushed.</span>{" "}
              <span className="os-line"><em>Neither are the people</em> who come for&nbsp;it.</span>
            </h2>
            <p className="os-manifesto-sign" data-reveal>The Daymark promise</p>
          </section>

          <section className="invitation xp-invitation" data-rise aria-labelledby="story-invitation-title" data-chapter="welcome">
            <div className="invitation-topline">
              <span className="section-number">Your chapter</span>
            </div>
            <div className="invitation-copy" data-reveal>
              <h2 id="story-invitation-title" data-split>Come and be part of the <em>story.</em></h2>
              <p className="body-copy">Find us, take a seat, and let the day begin with a good cup.</p>
              <div className="invitation-actions">
                <a className="button button-light" href="/visit">Plan a visit <ArrowIcon direction="up-right" /></a>
                <a className="invitation-link" href="/menu">See the menu <ArrowIcon direction="up-right" /></a>
              </div>
            </div>
          </section>
        </main>

        <SiteFooter />
      </div>
    </ScrollMotion>
  );
}
