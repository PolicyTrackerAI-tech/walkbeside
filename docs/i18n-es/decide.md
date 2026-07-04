# /decide — Spanish (es-419) draft for human review

**Surface:** `/decide` — service-type recommendation flow
**Source files:** `app/decide/page.tsx`, `app/decide/DecideFlow.tsx`
**Status:** MACHINE DRAFT — must NOT ship without bilingual human post-edit (hard gate per roadmap).
**Register:** usted throughout. Neutral Latin American Spanish.

Strings interpolated at runtime are shown with `{placeholders}` — do not translate placeholder names. Strings from `lib/faith-traditions.ts`, `lib/pricing-data.ts` (SERVICE_LABELS), and `lib/decide-engine.ts` (oneLiner, reasons) render on this page but live in other files — they are separate surfaces, not included here.

---

## app/decide/page.tsx

### Metadata

> EN: Let's figure out what kind of service fits.
ES: Vamos a encontrar el tipo de servicio que se ajusta a su caso.

> EN: A short, no-pressure walkthrough that recommends the type of service that fits your faith, your budget, and what you actually want.
ES: Una guía corta y sin presiones que le recomienda el tipo de servicio que se ajusta a su fe, su presupuesto y lo que usted realmente quiere.

### Header (BackLink label)

> EN: ← Planning
ES: ← Planificación

### Page body

> EN: Let's figure out what kind of service fits.
ES: Vamos a encontrar el tipo de servicio que se ajusta a su caso.

> EN: Four short questions. We'll recommend a type of service so you can move on to comparing prices. No account, nothing saved.
ES: Cuatro preguntas breves. Le recomendaremos un tipo de servicio para que pueda pasar a comparar precios. Sin cuenta y sin guardar nada.

### PlanningAheadBanner (note prop, ahead mode only)

> EN: Deciding the type of service now — while nothing is urgent — is exactly the right order. Answer for the person you're planning for.
ES: Decidir ahora el tipo de servicio — cuando nada es urgente — es exactamente el orden correcto. Responda por la persona para quien está planificando.

---

## app/decide/DecideFlow.tsx

### FAITH_DROPDOWN options

> EN: No religious tradition
ES: Sin tradición religiosa

> EN: Atheist
ES: Atea

> EN: Catholic
ES: Católica

> EN: Protestant
ES: Protestante

> EN: Eastern Orthodox
ES: Ortodoxa oriental

> EN: LDS / Mormon
ES: SUD / mormona

> EN: Jewish
ES: Judía

> EN: Muslim
ES: Musulmana

> EN: Hindu
ES: Hindú

> EN: Buddhist
ES: Budista

> EN: Sikh
ES: Sij

> EN: Other (please specify)
ES: Otra (por favor especifique)

### Question 1 — Faith tradition

> EN: Faith tradition
ES: Tradición de fe

> EN: Pick what guides decisions in your family. Pick 'No religious tradition' if none is in play.
ES: Elija la que guía las decisiones en su familia. Elija 'Sin tradición religiosa' si ninguna entra en juego.

### Question 1a — Custom faith (shown when "Other" is selected)

> EN: What tradition?
ES: ¿Qué tradición?

> EN: e.g. Bahá'í, Jain, Quaker, Native American spiritual practice…
ES: p. ej., bahá'í, jainista, cuáquera, práctica espiritual indígena norteamericana…

### Question 1b — Denomination (shown when the tradition has denominations)

> EN: Which tradition?
ES: ¿Cuál tradición?

> EN: Practice within this tradition varies by denomination. Pick the closest — or 'Not sure' if you don't know.
ES: La práctica dentro de esta tradición varía según la denominación. Elija la más cercana — o 'No estoy seguro(a)' si no sabe.

> EN: Select one…
ES: Seleccione una…

### Question 2 — Body at the service

> EN: Will the body be at the service?
ES: ¿El cuerpo estará presente en el servicio?

> EN: Open casket means people see them at the service (requires embalming). Closed casket means the casket is there with the lid closed (embalming optional). Memorial means no body present — often used after cremation.
ES: Ataúd abierto significa que las personas pueden ver a su ser querido durante el servicio (requiere embalsamamiento). Ataúd cerrado significa que el ataúd está presente con la tapa cerrada (el embalsamamiento es opcional). Servicio conmemorativo significa que el cuerpo no está presente — se usa a menudo después de la cremación.

> EN: Open casket — visible during the service
ES: Ataúd abierto — visible durante el servicio

> EN: Closed casket — present, lid closed
ES: Ataúd cerrado — presente, con la tapa cerrada

> EN: No — memorial service only (no body)
ES: No — solo servicio conmemorativo (sin el cuerpo)

> EN: Not sure yet
ES: Todavía no estoy seguro(a)

### Question 3 — Disposition preference

> EN: Disposition preference
ES: Preferencia de disposición final

> EN: Pick what feels right. We'll flag if it conflicts with the tradition you chose.
ES: Elija lo que le parezca correcto. Le avisaremos si entra en conflicto con la tradición que eligió.

> EN: No strong preference
ES: Sin preferencia marcada

> EN: Burial
ES: Entierro

> EN: Cremation
ES: Cremación

> EN: Whole-body donation to science
ES: Donación del cuerpo completo a la ciencia

### Question 4 — Cost priority

> EN: What matters most on cost?
ES: ¿Qué es lo más importante en cuanto al costo?

> EN: There's no wrong answer. Some families want the lowest possible cost; others want a fuller traditional service.
ES: No hay respuesta incorrecta. Algunas familias quieren el costo más bajo posible; otras quieren un servicio tradicional más completo.

> EN: Lowest cost — strip to essentials
ES: El costo más bajo — solo lo esencial

> EN: Balanced — fair price for what we want
ES: Equilibrado — un precio justo por lo que queremos

> EN: Tradition matters more than cost
ES: La tradición importa más que el costo

### Question 5 — Veteran status

> EN: Veterans qualify for free national cemetery burial, a burial allowance, and a flag — most families miss at least one. We'll surface them automatically if you answer yes.
ES: Los veteranos califican para un entierro sin costo en un cementerio nacional, una asignación para el entierro (burial allowance) y una bandera — la mayoría de las familias pasa por alto al menos uno de estos beneficios. Se los mostraremos automáticamente si responde que sí.

> EN: Have they served in the military? *(ahead mode)*
ES: ¿Ha servido esta persona en las fuerzas armadas?

> EN: Did the deceased serve in the military? *(at-need mode)*
ES: ¿La persona fallecida sirvió en las fuerzas armadas?

> EN: Not sure
ES: No estoy seguro(a)

> EN: Yes — they're a veteran *(ahead mode)*
ES: Sí — es veterano(a)

> EN: Yes — they were a veteran *(at-need mode)*
ES: Sí — era veterano(a)

> EN: No
ES: No

### "What we'll do with your answers" box

> EN: What we'll do with your answers:
ES: Qué haremos con sus respuestas:

> EN: We recommend a service type that fits your answers.
ES: Le recomendamos un tipo de servicio que se ajusta a sus respuestas.

> EN: You'll see what fair pricing looks like for it.
ES: Verá cómo son los precios justos para ese tipo de servicio.

> EN: Nothing is saved. No one gets contacted.
ES: No se guarda nada. No se contacta a nadie.

### Submit row

> EN: Show me what fits →
ES: Ver qué se ajusta a mi caso →

> EN: Updated — adjust answers above to refine.
ES: Actualizado — ajuste las respuestas de arriba para afinar el resultado.

### Recommendation card

> EN: Recommendation
ES: Recomendación

> EN: Fair total range nationally:
ES: Rango total justo a nivel nacional:

> EN: predatory:
ES: abusivo:

> EN: Families like yours typically save ${low} to ${high} on the funeral arrangement when they compare two or three homes with our help — versus walking into the first home they call.
ES: Las familias como la suya generalmente ahorran de ${low} a ${high} en el arreglo funerario cuando comparan dos o tres funerarias con nuestra ayuda — en vez de quedarse con la primera funeraria a la que llaman.

### Recommendation CTAs — ahead mode

> EN: Take this into your family plan →
ES: Llevar esto a su plan familiar →

> EN: See fair prices for this path
ES: Ver precios justos para esta opción

> EN: Nothing is committed and no one is contacted — this just tells you which path to write into the plan, so the first call later happens on your terms.
ES: Nada queda comprometido y no se contacta a nadie — esto solo le indica qué camino anotar en el plan, para que la primera llamada, más adelante, se haga en sus propios términos.

### Recommendation CTAs — at-need mode

> EN: Have us compare funeral homes for you →
ES: Permítanos comparar funerarias por usted →

> EN: Or look up fair prices first
ES: O consulte primero los precios justos

> EN: Free to families. We reach out on your behalf and bring the quotes back side by side — you pick a home at no charge. No commissions or kickbacks from any home we contact.
ES: Gratis para las familias. Nos comunicamos con las funerarias en su nombre y le traemos las cotizaciones lado a lado — usted elige una funeraria sin ningún costo. No aceptamos comisiones ni pagos por referencias de ninguna funeraria que contactemos.

### Faith profile card (hidden for secular/other)

> EN: {faithProfile.label} — what to expect
ES: {faithProfile.label} — qué esperar

> EN: Timeline
ES: Plazos

> EN: Embalming
ES: Embalsamamiento

> EN: Full guide for {faithProfile.label} →
ES: Guía completa para {faithProfile.label} →

> EN: General guidance to help you prepare, not religious authority. Customs vary by community — confirm specifics with your own faith leader.
ES: Orientación general para ayudarle a prepararse; no es autoridad religiosa. Las costumbres varían según la comunidad — confirme los detalles con su propio líder religioso.

### Conflict warning card

> EN: Heads up: Your disposition preference conflicts with the tradition you chose. We weighted faith because it's usually the harder constraint to change. If you want to override, pick "No religious preference" at the top.
ES: Atención: su preferencia de disposición final entra en conflicto con la tradición que eligió. Le dimos más peso a la fe porque generalmente es la restricción más difícil de cambiar. Si quiere anular esto, elija «Sin tradición religiosa» en la parte de arriba.

*(Reviewer note: the English source says "No religious preference" but the actual dropdown option is "No religious tradition". The ES draft points to the real option label so the instruction works; consider fixing the EN source.)*

### embalmingLabel() strings

> EN: Common in this tradition.
ES: Común en esta tradición.

> EN: Not customary, but allowed.
ES: No es costumbre, pero está permitido.

> EN: Generally discouraged.
ES: Generalmente se desaconseja.

> EN: Not part of the tradition. Decline at the funeral home.
ES: No es parte de la tradición. Rechácelo en la funeraria.
