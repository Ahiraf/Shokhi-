# Sources, attribution & licences

Shokhi's Retrieval-Augmented Generation (RAG) corpus (`lib/server/rag/sources/`) is built
**only from reliable, public, appropriately-licensed health sources**. The text in the
corpus is **summarised/adapted** into plain, low-literacy Bangla-first language; every RAG
answer in the app also shows the source of the passages it used. This is **general health
information, not a diagnosis**.

Shokhi is a **free, non-commercial** educational/hackathon project. No organisation's logo
is used, and no source endorses Shokhi.

---

## World Health Organization (WHO)

**Licence:** © WHO. Reused under **Creative Commons Attribution-NonCommercial-ShareAlike
3.0 IGO (CC BY-NC-SA 3.0 IGO)** — https://creativecommons.org/licenses/by-nc-sa/3.0/igo/

**Required adaptation disclaimer (applies to all WHO-derived text below):**
> This is an adaptation of an original work by the World Health Organization (WHO). This
> adaptation was not created by WHO. WHO is not responsible for the content or accuracy of
> this adaptation. The original English edition shall be the binding and authentic edition.

Adaptations of WHO material are licensed under the same **CC BY-NC-SA 3.0 IGO** terms.

Documents used:
- **Menstrual health** (fact sheet). Geneva: World Health Organization. https://www.who.int/news-room/fact-sheets/detail/menstrual-health
- **Polycystic ovary syndrome** (fact sheet). Geneva: World Health Organization. https://www.who.int/news-room/fact-sheets/detail/polycystic-ovary-syndrome
- **Endometriosis** (fact sheet). Geneva: World Health Organization. https://www.who.int/news-room/fact-sheets/detail/endometriosis
- **Medical eligibility criteria for contraceptive use, sixth edition**. Geneva: World Health Organization; 2025. Licence: CC BY-NC-SA 3.0 IGO. https://www.who.int/publications/b/81082
- **Scaling up postpregnancy family planning: practical guide**. Geneva: World Health Organization; 2025. Licence: CC BY-NC-SA 3.0 IGO. https://www.who.int/publications/i/item/9789240111073
- **Consolidated HIV guidelines: service delivery**. Geneva: World Health Organization; 2026. Licence: CC BY-NC-SA 3.0 IGO. https://www.who.int/publications/i/item/9789240124233

---

## NHS (England)

**Licence:** © Crown copyright. Reused under the **Open Government Licence v3.0 (OGL)** —
http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/ (excludes logos,
photographs and third-party material, which are not used here).

**Required attribution:**
> Contains information from NHS England, licensed under the current version of the Open
> Government Licence.

Documents used:
- **Menopause and perimenopause** (and its *Symptoms* page). NHS. https://www.nhs.uk/conditions/menopause/

---

## Government of Bangladesh — DGHS / DGFP (Directorate General of Health Services / Family Planning)

**Use:** Public government health information, **summarised with attribution** for
educational, non-commercial use. Please verify the latest official guidance on the
directorate websites.

Documents / sources:
- **Antenatal care national schedule & maternal-health services** — Directorate General of Health Services (DGHS) / Directorate General of Family Planning (DGFP). https://old.dghs.gov.bd/index.php/en/publications
- **National family-planning services & methods** — Directorate General of Family Planning (DGFP). https://dgfp.gov.bd
- **Menstrual regulation & post-abortion care** — DGFP (menstrual regulation) / DGHS (post-abortion care). https://dgfp.gov.bd

---

## icddr,b

**Use:** Factual research findings from **icddr,b** (International Centre for Diarrhoeal
Disease Research, Bangladesh), **summarised with attribution** for educational,
non-commercial use. © icddr,b.

Documents / sources:
- **Maternal and neonatal health research (impact)** — icddr,b. https://www.icddrb.org/research/research-themes/maternal-and-neonatal-health/impact

---

## How to reuse / extend

Add a new source only if it is **reliable** (official health authority or peer-reviewed) and
its **licence permits reuse with attribution**. Put the `title`, `source`, `url` and
`license` in the `.md` frontmatter under `lib/server/rag/sources/`, then run
`npm run ingest`. Keep this file and the README references table up to date.
