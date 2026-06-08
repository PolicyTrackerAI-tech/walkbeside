# Faith content — AI verification findings (2026-05-21)

Independent adversarial verification of every factual claim in
`lib/faith-traditions.ts`, checked against authoritative sources by 9
parallel agents (USCCB/Vatican, OU/Chabad/ReformJudaism, GOARCH/OCA, ICNA/
al-islam, Hindu American Foundation, Buddhist Churches of America, Sikh
Coalition, LDS Handbook, etc.).

> **This is AI cross-verification, not a substitute for clergy/expert sign-off.**
> It exists to catch the dangerous errors early and make the human review fast.
> Run the full review in `/admin/faith-qa`.

## Summary: 76 claims checked — 58 confirmed, 15 needs-nuance, 3 wrong

**The dangerous reversible claims all verified CORRECT** — Muslim & Eastern
Orthodox cremation-forbidden, Jewish/Muslim embalming-forbidden, 24-hour
burial timing. No reversed disposition errors among the high-stakes claims.

## ✅ Fixed automatically (clear, well-cited)

- **Hindu** `cremation-required` → `cremation-preferred`: cremation is standard but not universal (ascetics/gurus/sadhus and some infants are buried). Notes updated.
- **Protestant** notes: removed the overgeneralization that *all* denominations accept cremation — some conservative branches (independent Bible, Holiness, Anabaptist) restrict to burial. Now says "ask your pastor."

## ⚠ For human reviewer — needs-nuance / open items

| Tradition | Field | Current | Issue & suggested direction | Source |
|---|---|---|---|---|
| christian-catholic | timelineNorm | Funeral Mass typically within 3-7 days. | Consider: 'Funeral Mass typically within 3-7 days in American practice, but no strict doctrinal timeline is required.' This clarifies that the range is cultural, not binding. | Order of Christian Funerals (liturgical practice); Vatican d |
| christian-catholic | dispositionAllowed | traditional-burial, graveside-burial, cremation-with-service | If 'memorial-no-body' is meant to include direct cremation without body viewing followed by ashes burial, it's acceptable. But clarify to families that cremation always requires su | Vatican Instruction Ad resurgendum cum Christo, Section 5 |
| christian-protestant | dispositionNorm | either (meaning both burial and cremation accepted across Pr | Add nuance: dispositionNorm should include a comment noting denominational variation. Suggested: 'either (for mainline, many evangelical, and non-denominational churches; some inde | Wikipedia Cremation article (verified June 2026), Episcopal  |
| christian-protestant | cheatsheet-claim | cremation [is an] equally accepted option | Modify to: 'cremation is an option accepted in most mainstream Protestant churches, though some independent, free church, Holiness, and Anabaptist traditions do not practice it. As | Wikipedia Cremation article; Episcopal Church, Methodist, an |
| christian-protestant | dispositionNorm | Sources cited: https://www.elca.org/Faith/Faith-and-Society/ | Replace broken URLs with live sources or remove if unable to verify. Keep Episcopal Church glossary URL (verified working). Search for current ELCA and Methodist official statement | Direct HTTP testing: ELCA URL returns 404, Methodist URL ret |
| christian-orthodox | embalmingNorm | common | Change 'embalmingNorm' from 'common' to 'uncommon' or 'discouraged' to reflect the actual variance in Orthodox communities where some forbid it entirely. Alternatively, add clarify | Wikipedia - Embalming article, section on Religious practice |
| christian-orthodox | timelineNorm | Funeral typically within 2–3 days. Trisagion service the nig | Adjust timeline language to acknowledge variation: 'Funeral typically within 2-3 days. Trisagion service typically held before the funeral (often the evening before, but timing var | Wikipedia - Trisagion article; Memorial service in the Easte |
| lds-mormon | dispositionNorm | burial-preferred; cremation not forbidden | Clarify that cremation is discouraged for endowed members specifically due to temple covenant theology regarding the body's preservation. For non-endowed members, cremation is more | Church of Jesus Christ of Latter-day Saints General Handbook |
| jewish | dispositionNorm | burial-required | Current approach is reasonable for a top-level entry capturing the stringent default. Consider clarifying in accompanying UI text that this is 'traditional/Orthodox-Conservative de | Union for Reform Judaism position statement on cremation; Ra |
| jewish | notes-claim | Reform congregations sometimes accept cremation; Conservativ | Change 'Reform congregations sometimes accept cremation' to 'Reform Judaism increasingly permits cremation (now common in many communities)' to better reflect modern American Refor | Union for Reform Judaism statement on cremation; Pew Researc |
| hindu | cheatsheet-claim | openingQuestion: We need cremation within 24 hours and a sho | Rephrase opening question to: 'We're planning a Hindu cremation as soon as possible and would like a pre-cremation ceremony space. What's the soonest you can schedule?' | After.com funeral guide, Funeral.com |
| buddhist | timelineNorm | Service often held 3–7 days after death; some traditions wai | Consider updating timelineNorm to: 'Service often held 3–7 days after death. Weekly memorial observances continue for 49 days. Many traditions also observe a 100-day milestone mark | Funeral.com (49 Days After Death), SOTOZEN.COM (Hōji service |
| buddhist | notes-claim | Body undisturbed for 8–24 hours after death in whatToAskTheF | The current wording ('Some traditions ask that the body remain undisturbed for 8–24 hours') is reasonable given the variation, but could add: 'This timing varies by lineage—some tr | Tricycle Magazine (The Body After Death), Quora (Buddhist bo |
| sikh | dispositionNorm | cremation-required | Change dispositionNorm from 'cremation-required' to 'cremation-preferred' or add clarifying text that cremation is 'the standard practice' rather than strictly required in all circ | Sikh Rehat Maryada; Sikh Coalition; standard gurdwara guidan |
| sikh | notes-claim | Mourners dress in plain clothing, often white | Change to 'Mourners typically wear plain clothing; some communities prefer white' to reflect regional variation | Sikh Rehat Maryada; regional gurdwara customs vary |

## Per-family summaries

**Catholic** — The Catholic profile is substantially accurate on high-stakes disposition norms (burial preferred, cremation permitted) and correctly states the Vatican's restrictions on ash handling (must be interred in sacred place, not scattered/kept at home). Timeline is practical rather than doctrinal and could be clarified. Main risk: the 'memorial-no-body' option in dispositionAllowed could mislead familie

**Protestant Faith Tradition Profile** — The Protestant profile in faith-traditions.ts makes several key claims about disposition, timeline, and embalming practices. Most claims are confirmed or need nuance, but one major claim requires correction: the assertion that both burial and cremation are accepted "across Protestant denominations" misrepresents practice for independent Bible churches, free churches, Holiness churches, and Anabapt

**Eastern Orthodox** — The Eastern Orthodox profile contains mostly accurate core doctrine on cremation prohibition and burial orientation. However, the embalming norm requires nuance. The file characterizes embalming as 'common,' but authoritative sources (Wikipedia - Embalming article) indicate that Eastern Orthodox practice varies significantly: some communities absolutely forbid embalming except by legal necessity, 

**LDS / Mormon** — The LDS/Mormon profile is substantially accurate. All critical claims are confirmed or need only minor nuance. The main area for improvement is clarification about cremation policy's specific application to endowed vs. non-endowed members, which carries religious significance in LDS theology. The profile correctly identifies the funeral as a ward (non-temple) ordinance, accurately describes Relief

**Jewish Funeral Practices** — All Jewish faith profiles in the file are substantially CORRECT. No dangerous inversions or high-risk errors were found. The top-level entry correctly represents the most stringent (Orthodox/Conservative) default while directing families to select sub-profiles for movement-specific guidance. The sub-profiles (Orthodox, Conservative, Reform, Reconstructionist) all accurately reflect denominational 

**Muslim (Sunni & Shia) funeral practices** — All major factual claims in the Muslim (Sunni and Shia) faith profiles are confirmed as accurate against authoritative Islamic sources (Al-Islam.org for Shia, Wikipedia, Islamic funeral guides, ICNA/ISNA resources). No dangerous errors or reversed facts were found. The disposition requirement (burial-required), timeline (within 24 hours when possible), and embalming prohibition (forbidden) are all

**hindu** — The Hindu faith profile contains ONE CRITICAL ERROR: dispositionNorm is set to 'cremation-required' when authoritative sources consistently indicate cremation is 'standard' or 'predominant' but NOT universally required. Several Hindu sects and groups (gurus, swamis, sadhus) practice burial instead. All other claims (24-hour timeline, discouraged embalming, role of eldest son, ashes immersion) are 

**Buddhist** — The Buddhist faith profile makes accurate high-level claims about cremation being preferred (not required), embalming being uncommon, and memorial observances continuing beyond 49 days. However, there is a notable gap: the timelineNorm field mentions the 49-day period for memorial rites but omits any reference to the 100-day observance, which is extensively documented in East Asian Buddhist tradit

**Sikh** — The Sikh profile is largely accurate and reflects mainstream North American Sikh funeral practice. The main issue is semantic: 'cremation-required' is stronger language than the authoritative sources support. Sikh sources (Sikh Rehat Maryada, Sikh Coalition, gurdwara guidance) establish cremation as the standard and strongly preferred practice, not as an absolute requirement that forbids burial en
