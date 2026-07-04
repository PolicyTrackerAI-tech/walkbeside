# Spanish draft — `/where` (app/where/page.tsx)

Surface: the "Where are you in this?" stage-picker page (Screen 2 — four path cards).
Register: usted throughout. Neutral Latin American Spanish. DRAFT FOR HUMAN REVIEW — do not ship as-is.

## metadata (page `<title>` + description)

> EN: Where are you in this?
ES: ¿En qué punto se encuentra usted?

> EN: Three paths. Pick the one that fits. We help families before, during, and after a death.
ES: Tres caminos. Elija el que se ajuste a su situación. Ayudamos a las familias antes, durante y después de un fallecimiento.

## SiteHeader / BackLink (rightSlot label)

> EN: ← Home
ES: ← Inicio

## Page heading + intro (WherePage body)

> EN: Where are you in this?
ES: ¿En qué punto se encuentra usted?

> EN: Pick the one that fits best. We help at every stage.
ES: Elija la opción que mejor describa su situación. Ayudamos en cada etapa.

## PATHS array — card 1: /where/just-happened (emphasis)

> EN: It just happened
ES: Acaba de suceder

> EN: Death in the last few hours or days. We’ll walk through the next 72 hours.
ES: El fallecimiento ocurrió en las últimas horas o días. Le guiaremos paso a paso durante las próximas 72 horas.

## PATHS array — card 2: /decide

> EN: We’re arranging the funeral
ES: Estamos organizando el funeral

> EN: Decisions need to be made in the next few days. We help pick the service and avoid being overcharged.
ES: Hay decisiones que tomar en los próximos días. Le ayudamos a elegir el servicio y a evitar pagar de más.

## PATHS array — card 3: /next-30-days

> EN: The funeral already happened
ES: El funeral ya se realizó

> EN: Now the paperwork begins — death certificates, Social Security, accounts to close, estate. We walk through it in order.
ES: Ahora empiezan los trámites: certificados de defunción, el Social Security (Seguro Social), cuentas por cerrar, la sucesión. Lo acompañamos en orden.

## PATHS array — card 4: /planning

> EN: I’m planning ahead
ES: Estoy planeando con anticipación

> EN: Nobody has died. Learning what funerals should cost and how to set things up before the day comes.
ES: Nadie ha fallecido. Aquí puede aprender cuánto debería costar un funeral y cómo dejar todo preparado antes de que llegue el día.

---

Reviewer notes:
- The "→" arrow glyph on each card is `aria-hidden` decorative and was not extracted.
- "Social Security" kept in English with gloss "(Seguro Social)" per the US-terms rule — it is the program name families will see on forms.
- "estate" rendered as "la sucesión"; alternatives: "el patrimonio" / "la herencia". Reviewer should pick per house glossary.
- "death certificates" rendered as "certificados de defunción" (neutral); Mexico commonly uses "actas de defunción".
- EN metadata says "Three paths" but the page now lists FOUR cards — translated faithfully as "Tres caminos"; flag the English source for a fix.
- "should cost" kept as the conditional "debería costar" to preserve the hedge.
- Strings inside `SiteHeader`, `BackLink` (beyond the "← Home" label passed here), and `HelpFooter` live in their own components and are out of scope for this file.
