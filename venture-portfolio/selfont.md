---
name: Selfont
type: concept
doc_level: capsule
state: active
focus: false
try_it: true
map_it: true
todoist: false
created_date: 2026-06-16
modified_date: 2026-06-16
uses:
  - Photo → 2D vector engine
synergies:
  - Uncard
  - Pebble
  - Phase Next
  - EarlyRead
  - Patterntopia
  - Photo → 2D vector engine
  - ShapeSake
actions:
  - description: Test Calligraphr end to end
    type: research
    state: open
    position: 1
  - description: Design the guided letter capture flow for phone camera
    type: task
    state: open
    position: 2
  - description: Investigate Lob API for fulfillment integration
    type: research
    state: open
    position: 3
---
## Idea Capsule — 2026-06-16

**Name** — Selfont

**One Phrase** — *Preserve the Hand* *(uncertain)*

**Core Sentence** — Turn anyone's handwriting into a personal font in minutes — for preservation, for gifts, for physical mail that feels human, and for people who can no longer write but want to leave something that feels like them

**One Paragraph** — Capture it before you can't. Selfont turns anyone's handwriting into a personal font in about ten minutes from phone-camera photos — for preservation before dementia or ALS or aging takes it, for gifts, for physical mail that actually feels human, and for people who can no longer write but want to leave something that feels like them. Handwrytten proves the handwritten-mail market at over ten million in revenue; Selfont's edge is the genuinely personal font, with Lob handling fulfillment so there's no operation to build. The same capture even doubles as a quiet signal of cognitive or motor change over time.

**Key Insights**
- Preservation urgency is the emotional hook — capture a loved one's handwriting before decline takes it; dementia, ALS, stroke, aging all create a now-or-never moment
- Voice-to-handwritten-font output for people who can't physically write is genuinely underserved assistive technology with deep emotional resonance
- Gift angle works because effort signal is high even when technical barrier is low
- Existing market (Calligraphr, FontForge) is clunky and designer-facing — accessibility gap for regular people is wide
- Phone camera guided letter capture is the right interaction model — ten minutes start to finish; prototype validated photo capture and verification flow
- Direct mail opportunity is substantial — Handwrytten runs at $10M+ ARR with 20 employees and robots; the market for physical mail that feels handwritten is real and proven; Selfont's angle is the personal font, not a generic handwriting style; use Lob as fulfillment infrastructure to compete directly
- Lob as fulfillment partner — API-first direct mail platform; enables Selfont to offer physical letter and card delivery without building fulfillment operations; positions Selfont against Handwrytten with a superior personal authenticity angle
- Patterntopia for card designs — card design surface within Selfont uses Patterntopia's generative engine; Selfont provides the personal handwriting, Patterntopia provides the visual design; natural integration
- QR codes leading to custom landing pages — printed Selfont output can include QR codes that route to personalized digital experiences; the physical artifact triggers a digital moment; PageMutant or similar tool as the landing page engine
- Cognitive decline tracking angle — longitudinal handwriting capture as an observable signal; the same font capture infrastructure that produces a beautiful personal font also documents handwriting drift over time; clinically interesting, emotionally resonant, not the primary pitch
- Dyslexia tracking angle — letter formation inconsistency, reversals, and spacing patterns observable in captured handwriting samples; complement to EarlyRead; the font capture process produces diagnostic signal as a side effect
- Watermarking robo-generated fonts — fonts produced by Selfont's AI pipeline should be watermarkable to distinguish from human-captured fonts; authenticity and provenance matter in the personal font market
- Image-to-glyph engine is the core primitive — not classify (character identity is trivial); the hard part is isolating the exact stroke geometry, handling ink variation and paper texture, inferring the intended clean path, and producing a vector that looks like this person's specific letterform; this is the isolate + vectorize primitive applied to letterform geometry

**User** — Anyone who wants to preserve their own or a loved one's handwriting; people who've lost the physical ability to write; gift givers; direct mail senders wanting authentic personal touch; hospice organizations, occupational therapists, memory care facilities; potentially dyslexia researchers and cognitive decline clinicians as secondary institutional users

**Model**
- One-time font capture: simple purchase; freemium entry
- Physical mail subscription: monthly letter or card delivery using personal font via Lob; recurring revenue; competes with Handwrytten on authenticity angle
- Gift purchase: capture a loved one's font and deliver a set of physical letters or cards
- Institutional licensing: memory care facilities, hospice organizations, occupational therapy practices
- Patterntopia integration: card design surface; cross-product revenue
- Printer/fulfillment licensing: font licensed to printers for professional output

**Why It's Real**
- Prototype worked well — photo capture and font verification validated; core pipeline is buildable
- Handwrytten at $10M+ ARR with 20 people and robots proves the physical handwritten mail market; Selfont's personal font angle is a meaningfully different and superior product for personal use cases
- Lob provides fulfillment infrastructure without building operations
- Emotional use cases create strong word of mouth without marketing spend
- Dementia and aging population creates genuine urgency and institutional distribution pathway
- Uncard connection means it has a commerce surface immediately
- Cognitive decline and dyslexia tracking angles create institutional research pathways without requiring them for the consumer product

**Flags**
- Existing tools (Calligraphr) already solve this for technically capable users — differentiation lives in accessibility, emotional framing, and the physical mail subscription model
- Font quality from phone camera needs to be genuinely good; image-to-glyph pipeline quality is the core technical challenge
- One-time purchase model limits revenue ceiling — physical mail subscription is the recurring revenue answer
- Cognitive decline and dyslexia claims need to stay observational unless clinically validated — do not market as diagnostic
- Watermarking robo-generated fonts creates an authenticity signal but also surfaces the fact that AI generated the font — design the disclosure carefully

**Synergy**
- Uncard — most direct connection; cards written in a loved one's preserved handwriting font is a premium product; Selfont is Uncard's most emotionally resonant production surface
- Pebble — thank you notes to donors in your own font; Selfont as the donor stewardship closer
- Phase Next — handwriting preservation as a program component; 50-something demographic overlap
- EarlyRead — handwriting capture as additional dyslexia indicator layer; shared institutional channel
- Patterntopia — card design surface; Selfont provides the personal handwriting, Patterntopia provides the visual design; integration natural
- Photo → 2D vector engine — Selfont is a primary expression of the isolate + vectorize primitive applied to letterform geometry; image-to-glyph is the Selfont-specific variant of this engine
- ShapeSake — shared physical output fulfillment surface; shared passion community audience for premium personal objects

---

## Action Log

---

## Decision Log

**2026-06-16** — Migrated from triage aggregate. Verdict: Dig In (prototype validated; Handwrytten proves the market; personal font angle is genuinely superior to generic handwriting styles; Lob fulfillment removes the operational barrier; cognitive and dyslexia angles create institutional paths without requiring them).

---

## Open Questions Log

