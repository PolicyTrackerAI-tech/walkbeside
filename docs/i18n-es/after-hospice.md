# Spanish draft — /after-hospice (`app/after-hospice/page.tsx`)

**Status: DRAFT FOR HUMAN REVIEW — machine translation, must NOT ship without bilingual post-edit.**

Conventions in this file:
- `**bold**` marks text rendered in `<strong>` in the JSX.
- `[square brackets]` mark inline link text that sits mid-sentence (the whole sentence is one string in the source; the bracketed words are the `<Link>`).
- Standalone trailing link sentences are listed as their own EN/ES pair.
- Register: usted throughout. Hedges preserved 1:1 (see notes at bottom).

## Metadata (`export const metadata`)

> EN: When someone dies in hospice — what to expect, what to do, what families miss
ES: Cuando alguien muere en hospicio — qué esperar, qué hacer, lo que las familias pasan por alto

> EN: An honest guide to a hospice death. What the final days actually look like, what to do in the first 30 minutes after death (don't call 911), the handoff to the funeral home, and the grief specific to long illness.
ES: Una guía honesta sobre la muerte en hospicio. Cómo son realmente los últimos días, qué hacer en los primeros 30 minutos después de la muerte (no llame al 911), la transición a la funeraria y el duelo propio de una enfermedad larga.

> EN: When someone dies in hospice
ES: Cuando alguien muere en hospicio

> EN: After
ES: Después

## ArticleSchema (JSON-LD structured data)

> EN: When someone dies in hospice
ES: Cuando alguien muere en hospicio

> EN: The smoothest kind of death, and the things families still get wrong. Don't call 911. What the final days look like, the hour of death, the hospice handoff to the funeral home.
ES: La muerte menos complicada de todas, y los errores que las familias todavía cometen. No llame al 911. Cómo son los últimos días, la hora de la muerte, y la transición del hospicio a la funeraria.

> EN: After
ES: Después

## Hero (eyebrow + h1 + intro)

> EN: When someone dies in hospice
ES: Cuando alguien muere en hospicio

> EN: The smoothest kind of death, and the things families still get wrong.
ES: La muerte menos complicada de todas, y los errores que las familias todavía cometen.

> EN: About 1.7 million Americans die in hospice care each year — nearly half of all deaths in the US. Of every kind of death, hospice deaths involve the fewest decisions, the least paperwork, and the most warning. That said, families still make a handful of avoidable mistakes in the first hour. This page is what to expect and what to do.
ES: Cada año, alrededor de 1.7 millones de personas mueren bajo cuidados de hospicio (cuidados para enfermos terminales) en Estados Unidos — casi la mitad de todas las muertes del país. De todos los tipos de muerte, las muertes en hospicio implican la menor cantidad de decisiones, el menor papeleo y el mayor aviso previo. Aun así, las familias todavía cometen algunos errores evitables en la primera hora. Esta página explica qué esperar y qué hacer.

## Card (tone="warn"): If you are reading this in real time

> EN: If you are reading this in real time
ES: Si está leyendo esto en tiempo real

> EN: Do not call 911. Call hospice first.
ES: No llame al 911. Llame primero al hospicio.

> EN: The single most common mistake families make in the moment of a hospice death is calling 911. That call triggers a paramedic response and, in some jurisdictions, a coroner investigation — turning a peaceful death into a chaotic one. The hospice agency has a 24-hour line. Call them. They will send a nurse to pronounce death, handle paperwork, and walk you through what happens next.
ES: El error más común que cometen las familias en el momento de una muerte en hospicio es llamar al 911. Esa llamada activa una respuesta de paramédicos y, en algunas jurisdicciones, una investigación del coroner (funcionario forense) — y convierte una muerte tranquila en una caótica. La agencia de hospicio tiene una línea disponible las 24 horas. Llámelos. Enviarán a un enfermero para declarar el fallecimiento, encargarse del papeleo y guiarle en lo que sigue.

> EN: If you need the immediate-action checklist, start here.
ES: Si necesita la lista de acciones inmediatas, empiece aquí.

## Card: The final days

> EN: The final days
ES: Los últimos días

> EN: What dying actually looks like.
ES: Cómo es realmente el proceso de morir.

> EN: In the last 7–14 days, most hospice patients stop eating and drinking. This is not the family failing to feed them and not the body suffering. The dying body cannot process food, and pushing food or fluids at this stage can cause discomfort, not comfort. Hospice nurses will explain this when it starts. It is normal.
ES: En los últimos 7–14 días, la mayoría de los pacientes de hospicio dejan de comer y de beber. Esto no significa que la familia no los esté alimentando, ni que el cuerpo esté sufriendo. El cuerpo que está muriendo no puede procesar los alimentos, e insistir con comida o líquidos en esta etapa puede causar malestar, no alivio. Los enfermeros del hospicio se lo explicarán cuando empiece. Es normal.

> EN: In the last 24–72 hours, breathing usually changes. Patterns include long pauses (Cheyne-Stokes breathing), shallow rapid breaths, and a wet rattling sound (sometimes called the "death rattle") caused by saliva pooling in the throat that the body no longer clears. The rattle sounds distressing but does not appear to cause the dying person discomfort. Hospice will position the body and may suction lightly; aggressive suctioning is usually avoided.
ES: En las últimas 24–72 horas, la respiración generalmente cambia. Los patrones incluyen pausas largas (respiración de Cheyne-Stokes), respiraciones rápidas y superficiales, y un sonido húmedo, como un traqueteo (a veces llamado "estertor de la muerte", en inglés "death rattle"), causado por saliva que se acumula en la garganta y que el cuerpo ya no elimina. El estertor suena angustiante, pero no parece causar malestar a la persona que está muriendo. El hospicio acomodará el cuerpo y puede hacer una succión ligera; la succión agresiva generalmente se evita.

> EN: Hands and feet often become cool and mottled (purplish patches) as circulation pulls toward the core organs. Body temperature can rise and fall. The person may seem to talk to people who are not there or reach for things. Hospice nurses uniformly describe this as common and not a sign of pain or fear.
ES: Las manos y los pies con frecuencia se enfrían y se ven moteados (manchas moradas) a medida que la circulación se concentra en los órganos vitales. La temperatura del cuerpo puede subir y bajar. Puede parecer que la persona habla con personas que no están presentes o que intenta alcanzar cosas. Los enfermeros de hospicio describen esto, de manera uniforme, como algo común y no como una señal de dolor ni de miedo.

> EN: Hearing is the last sense to go. Whatever you want to say, say it. They likely hear you.
ES: El oído es el último sentido que se pierde. Lo que quiera decirle, dígaselo. Probablemente le escucha.

## Card: The moment of death

> EN: The moment of death
ES: El momento de la muerte

> EN: How you will know, and what to do next.
ES: Cómo lo sabrá, y qué hacer después.

> EN: Death usually comes quietly. Breathing slows, then stops. The body relaxes. The eyes may stay slightly open. There is no machine, no alarm, no countdown. Families often miss the exact moment because the long pauses in breathing made every previous pause feel like the last.
ES: La muerte generalmente llega en silencio. La respiración se hace más lenta y luego se detiene. El cuerpo se relaja. Los ojos pueden quedar entreabiertos. No hay máquinas, ni alarmas, ni cuenta regresiva. Con frecuencia las familias no notan el momento exacto, porque las pausas largas en la respiración hicieron que cada pausa anterior pareciera la última.

> EN: **There is no rush.** You do not have to call anyone in the first 10 minutes. Sit with the body if you want. Many families wash the face, brush the hair, place a hand on the chest, light a candle, pray, or simply breathe. Whatever you do in that first hour is yours.
ES: **No hay prisa.** No tiene que llamar a nadie en los primeros 10 minutos. Si lo desea, siéntese junto al cuerpo. Muchas familias lavan el rostro, peinan el cabello, ponen una mano sobre el pecho, encienden una vela, rezan o simplemente respiran. Lo que haga en esa primera hora le pertenece.

> EN: **When you are ready, call hospice.** A hospice nurse will come to the home, pronounce death, and complete the medical portion of the death certificate. This visit usually takes 30–90 minutes. The nurse will also call the funeral home you have chosen (or help you choose one), notify the physician, and dispose of any controlled medications in the home.
ES: **Cuando esté listo, llame al hospicio.** Un enfermero del hospicio irá a la casa, declarará el fallecimiento y completará la parte médica del certificado de defunción. Esta visita generalmente toma de 30 a 90 minutos. El enfermero también llamará a la funeraria que usted haya elegido (o le ayudará a elegir una), avisará al médico y desechará los medicamentos controlados que haya en la casa.

## Card: What hospice does (and does not do)

> EN: What hospice does (and does not do)
ES: Lo que el hospicio hace (y lo que no hace)

> EN: The handoff to the funeral home.
ES: La transición a la funeraria.

> EN: **Hospice handles:** pronouncement of death, medical portion of the death certificate, disposal of controlled medications, notification of the attending physician, support calls and bereavement check-ins (typically for 13 months after death, included in Medicare hospice benefits).
ES: **El hospicio se encarga de:** la declaración del fallecimiento, la parte médica del certificado de defunción, el desecho de los medicamentos controlados, la notificación al médico tratante, y las llamadas de apoyo y los seguimientos de duelo (por lo general durante los 13 meses posteriores a la muerte, incluidos en los beneficios de hospicio de Medicare).

> EN: **Hospice does not handle:** transporting the body, the funeral home arrangement meeting, cremation or burial decisions, the personal portion of the death certificate, obituary, memorial planning, estate matters, or notifying Social Security and other agencies.
ES: **El hospicio no se encarga de:** transportar el cuerpo, la reunión de arreglos con la funeraria, las decisiones sobre cremación o entierro, la parte personal del certificado de defunción, el obituario, la planificación del homenaje, los asuntos de la herencia, ni de notificar al Social Security (Seguro Social) y a otras agencias.

> EN: The funeral home you choose takes physical custody of the body once hospice has pronounced. Most hospice agencies have relationships with local funeral homes and will recommend one. You are not required to use their recommendation. Prices among funeral homes in the same city often vary by 200% to 400% for the same services. Comparing two or three before you commit is the single most effective way to avoid being overcharged.
ES: La funeraria que usted elija toma la custodia física del cuerpo una vez que el hospicio ha declarado el fallecimiento. La mayoría de las agencias de hospicio tienen relaciones con funerarias locales y le recomendarán una. Usted no está obligado a usar su recomendación. Los precios entre funerarias de una misma ciudad con frecuencia varían entre un 200% y un 400% por los mismos servicios. Comparar dos o tres antes de comprometerse es la manera más efectiva de evitar pagar de más.

> EN: See current price ranges here.
ES: Vea aquí los rangos de precios actuales.

## Card (tone="primary"): The advantage of a hospice death

> EN: The advantage of a hospice death
ES: La ventaja de una muerte en hospicio

> EN: You have time. Use it.
ES: Usted tiene tiempo. Úselo.

> EN: A hospice death gives families something most kinds of death do not: warning. Days or weeks of warning. Families who use that warning to compare funeral home prices, write down preferences with the dying person, gather important documents, and notify out-of-town family in advance avoid almost all of the chaos that follows other kinds of death.
ES: Una muerte en hospicio les da a las familias algo que la mayoría de los otros tipos de muerte no dan: aviso previo. Días o semanas de aviso. Las familias que usan ese aviso para comparar precios de funerarias, anotar las preferencias junto con la persona que está muriendo, reunir los documentos importantes y avisar con anticipación a los familiares que viven lejos evitan casi todo el caos que sigue a otros tipos de muerte.

> EN: Things worth doing while the person is still alive but in hospice:
ES: Cosas que vale la pena hacer mientras la persona aún vive y está en hospicio:

> EN: Ask them, gently, what they want. Cremation or burial. Service or no service. Music. Where to scatter ashes if cremation.
ES: Pregúntele, con delicadeza, qué quiere. Cremación o entierro. Con servicio o sin servicio. Qué música. Dónde esparcir las cenizas, si elige cremación.

> EN: There is a preferences worksheet here.
ES: Aquí hay una hoja de preferencias.

> EN: Locate their will, any pre-need funeral contracts, life insurance policies, and account passwords.
ES: Localice su testamento, cualquier contrato funerario prepagado (pre-need), las pólizas de seguro de vida y las contraseñas de sus cuentas.

> EN: Call two or three funeral homes and ask for their General Price List. You are not committing to anything.
ES: Llame a dos o tres funerarias y pida su General Price List (lista general de precios). No se está comprometiendo a nada.

> EN: What a GPL is and why it matters.
ES: Qué es la GPL y por qué importa.

> EN: Notify the people who will need to fly in. Funerals typically happen 5–10 days after death; someone flying in from across the country may need earlier notice than you think.
ES: Avise a las personas que tendrán que viajar. Los funerales por lo general se realizan de 5 a 10 días después de la muerte; alguien que viene en avión desde el otro lado del país puede necesitar más aviso previo del que usted cree.

## Card: Common emotional reactions

> EN: Common emotional reactions
ES: Reacciones emocionales comunes

> EN: Relief and guilt arrive together.
ES: El alivio y la culpa llegan juntos.

> EN: Many families feel relief in the hours after a hospice death — relief that the suffering is over, relief that the long vigil has ended, relief that they can sleep through the night again. That relief is normal. It is not a betrayal of the person who died. Hospice chaplains and social workers will say this out loud if asked.
ES: Muchas familias sienten alivio en las horas posteriores a una muerte en hospicio — alivio de que el sufrimiento terminó, alivio de que la larga vigilia acabó, alivio de poder volver a dormir toda la noche. Ese alivio es normal. No es una traición a la persona que murió. Los capellanes y los trabajadores sociales del hospicio se lo dirán en voz alta si se les pregunta.

> EN: Some families also describe feeling that their grief already happened. Anticipatory grief during a long illness can be as intense as the grief after death, and the death itself can feel like a quieter event than people expect. This is also normal.
ES: Algunas familias también describen la sensación de que su duelo ya ocurrió. El duelo anticipado durante una enfermedad larga puede ser tan intenso como el duelo después de la muerte, y la muerte en sí puede sentirse como un evento más silencioso de lo que la gente espera. Esto también es normal.

> EN: Others find the grief lands much later — weeks or months out, when the caregiving identity is gone and the days that used to revolve around the dying person are suddenly empty. Hospice bereavement programs run for 13 months for exactly this reason. The first anniversary, holidays, and the deceased's birthday are the most common hard days. Use the bereavement services. They are free and they are included in the Medicare hospice benefit.
ES: A otros el duelo les llega mucho después — semanas o meses más tarde, cuando la identidad de cuidador desaparece y los días que giraban alrededor de la persona que estaba muriendo de pronto quedan vacíos. Los programas de duelo del hospicio duran 13 meses precisamente por esta razón. El primer aniversario, los días festivos y el cumpleaños de la persona fallecida son los días difíciles más comunes. Use los servicios de duelo. Son gratuitos y están incluidos en el beneficio de hospicio de Medicare.

## Card: The next 30 days

> EN: The next 30 days
ES: Los próximos 30 días

> EN: The practical checklist.
ES: La lista práctica.

> EN: Things that have to happen in the first month, in rough order:
ES: Lo que tiene que ocurrir en el primer mes, en orden aproximado:

> EN: Funeral home arrangement meeting (typically within 48 hours of death).
ES: Reunión de arreglos con la funeraria (por lo general dentro de las 48 horas posteriores a la muerte).

> EN: Order 10–15 certified death certificates.
ES: Pida de 10 a 15 copias certificadas del certificado de defunción.

> EN: Why so many.
ES: Por qué tantas.

> EN: Service or memorial, if planned (typically 5–10 days after death).
ES: Servicio o acto conmemorativo, si se planea uno (por lo general de 5 a 10 días después de la muerte).

> EN: Notify Social Security (usually the funeral home reports the death, but the family separately applies for [survivor benefits]).
ES: Notifique al Social Security (generalmente la funeraria reporta la muerte, pero la familia solicita por separado los [beneficios para sobrevivientes]).

> EN: Notify employer (for bereavement leave and any life insurance through work).
ES: Notifique al empleador (para la licencia por duelo y cualquier seguro de vida a través del trabajo).

> EN: Notify banks, brokerages, retirement accounts, pension administrator, life insurance companies.
ES: Notifique a los bancos, las casas de bolsa, las cuentas de jubilación, al administrador de la pensión y a las compañías de seguros de vida.

> EN: Begin probate if there is a will or significant assets.
ES: Inicie el probate (proceso legal de sucesión) si hay testamento o bienes significativos.

> EN: State-by-state probate basics.
ES: Conceptos básicos del probate, estado por estado.

> EN: Cancel subscriptions, change utility accounts, forward mail.
ES: Cancele las suscripciones, cambie las cuentas de los servicios públicos y redirija el correo postal.

> EN: Accounts-to-close checklist.
ES: Lista de cuentas por cerrar.

> EN: Veterans benefits if applicable.
ES: Beneficios para veteranos, si corresponde.

> EN: VA burial benefits and survivor pensions.
ES: Beneficios de entierro del VA (Departamento de Asuntos de Veteranos) y pensiones para sobrevivientes.

## Card (tone="primary"): CTA — we walk you through the rest

> EN: We walk the family through the rest.
ES: Nosotros acompañamos a la familia en el resto.

> EN: The hospice death itself is usually the smoothest part. The 30 days after — the death certificates, the accounts, the probate, the survivor benefits — are where most families get overwhelmed. We walk you through that part.
ES: La muerte en hospicio en sí generalmente es la parte menos complicada. Los 30 días siguientes — los certificados de defunción, las cuentas, el probate, los beneficios para sobrevivientes — son donde la mayoría de las familias se sienten abrumadas. Nosotros le guiamos en esa parte.

> EN: See what fits your situation →
ES: Vea qué se ajusta a su situación →

## Disclaimer (fine print)

> EN: This page is general consumer information, not medical, legal, or financial advice. Hospice practices, Medicare benefits, and state-specific rules change. For a binding answer about a specific situation, talk to the hospice agency, the funeral home, and (for benefits) the Social Security Administration directly.
ES: Esta página es información general para el consumidor; no es consejo médico, legal ni financiero. Las prácticas de los hospicios, los beneficios de Medicare y las reglas específicas de cada estado cambian. Para una respuesta definitiva sobre una situación específica, hable directamente con la agencia de hospicio, con la funeraria y (para los beneficios) con la Social Security Administration (Administración del Seguro Social).

## Card: The second-guessing

> EN: The second-guessing
ES: Las dudas que vienen después

> EN: If you keep replaying the decisions, you're in good company.
ES: Si sigue repasando las decisiones una y otra vez, está en buena compañía.

> EN: "Did we start hospice too soon — or too late?" "Should we have tried one more treatment?" "Was the DNR right?" Research on families after end-of-life care consistently finds this kind of doubt to be one of the most common experiences caregivers carry — including after decisions that were, by every measure, made with love and good information. Replaying them is your mind trying to make sense of an impossible situation; it is not evidence you chose wrong.
ES: "¿Empezamos el hospicio demasiado pronto — o demasiado tarde?" "¿Debimos intentar un tratamiento más?" "¿Fue correcta la DNR (orden de no reanimar)?" Las investigaciones sobre familias después de los cuidados al final de la vida encuentran, de manera consistente, que este tipo de duda es una de las experiencias más comunes que cargan los cuidadores — incluso después de decisiones que, según todos los criterios, se tomaron con amor y con buena información. Repasarlas es la forma en que su mente intenta darle sentido a una situación imposible; no es prueba de que eligió mal.

> EN: Two things help. Saying the doubt out loud to someone — the hospice's free bereavement counselor has heard every version of it, and that's exactly what they're there for. And time-boxing it: if the same questions are still looping months from now and getting heavier rather than lighter, that's worth a real conversation — the [quiet self-check on the grief page] gives you an honest read and the right people to talk to.
ES: Dos cosas ayudan. Decir la duda en voz alta a alguien — el consejero de duelo gratuito del hospicio ha escuchado todas las versiones de esa duda, y para eso está exactamente. Y ponerle un límite de tiempo: si las mismas preguntas siguen dando vueltas dentro de unos meses y se sienten más pesadas en lugar de más ligeras, eso amerita una conversación de verdad — la [autoevaluación tranquila en la página de duelo] le da una lectura honesta y las personas indicadas con quienes hablar.

## EmailCapture (props)

> EN: Save this for the days ahead.
ES: Guarde esto para los días que vienen.

> EN: The work continues for weeks after the funeral. We'll email this guide so you have it on your phone when you need it.
ES: El trabajo continúa durante semanas después del funeral. Le enviaremos esta guía por correo electrónico para que la tenga en su teléfono cuando la necesite.

> EN: Email me this guide
ES: Enviarme esta guía por correo

> EN: It's in your inbox. Take care.
ES: Ya está en su bandeja de entrada. Cuídese.

---

## Notes for the human reviewer

1. **"Hospicio"** — used throughout for "hospice", glossed on first body use as "cuidados de hospicio (cuidados para enfermos terminales)" in the hero intro. In some countries "hospicio" historically means orphanage/asylum; for a US Spanish-speaking audience dealing with US hospice agencies it is the term Medicare materials use, but please confirm it reads correctly for your target communities.
2. **Gendered adjectives** — "Cuando esté listo" (moment-of-death card) and "Usted no está obligado" (handoff card) default to the masculine generic. Consider "listo(a)" / "obligado(a)" or restructuring if the house style prefers explicitly inclusive forms.
3. **"Enfermero"** — masculine generic used for "nurse" after one "un enfermero" simplification; most US hospice nurses are women, so "enfermera" or "enfermero o enfermera" may read better. Flagged for your call.
4. **US-specific terms glossed on first use per the rules**: coroner (funcionario forense), Social Security (Seguro Social), General Price List (lista general de precios), GPL, pre-need, probate (proceso legal de sucesión), DNR (orden de no reanimar), VA (Departamento de Asuntos de Veteranos), Social Security Administration (Administración del Seguro Social). Later occurrences drop the gloss (e.g. "Social Security" in the next-30-days list, "probate" in the CTA card).
5. **Hedges carried over verbatim in meaning**: usually→generalmente; typically→por lo general; often→con frecuencia; may→puede; does not appear to→no parece; likely→probablemente; in some jurisdictions→en algunas jurisdicciones; sometimes called→a veces llamado; uniformly describe→describen de manera uniforme; consistently finds→encuentran de manera consistente; if applicable→si corresponde. The full disclaimer paragraph is translated without softening.
6. **Numbers** — "1.7 millones" keeps the US decimal point (audience is in the US); change to "1,7" only if house style says otherwise. Number ranges "7–14", "24–72", "30–90" kept as digits; "5–10 days" rendered "de 5 a 10 días" where it reads more naturally in prose.
7. **"Death rattle"** — translated "estertor de la muerte" with the English term kept in quotes, since US hospice staff may say it in English to the family.
8. **"Second-guessing" eyebrow** — no exact Spanish equivalent; drafted as "Las dudas que vienen después". Alternative: "Cuestionarse las decisiones". Reviewer's choice.
9. **"You're in good company"** — rendered literally ("está en buena compañía"), which is understood but slightly calqued; alternative: "le pasa a muchas más personas de las que cree."
10. **Duplicated strings** — "When someone dies in hospice" and "After" appear three/two times (metadata ogImage, ArticleSchema, visible hero eyebrow); each occurrence is listed so the count matches the source.
11. **Do-not-translate honored** — 911, phone-free; URLs/hrefs, component names, and the brand untouched; "Cheyne-Stokes" kept as-is.
12. **Inline links** — bracketed spans (`[beneficios para sobrevivientes]`, `[autoevaluación tranquila en la página de duelo]`) mark the `<Link>` text inside a larger string; word order was kept so the link can wrap a contiguous span in Spanish.
