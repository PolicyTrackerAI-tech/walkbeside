# Spanish draft — /worksheet (pre-meeting preferences worksheet)

**Status: DRAFT FOR HUMAN REVIEW — machine translation, must NOT ship without bilingual post-edit.**
Register: usted, neutral Latin American Spanish. Family-voice strings (we/our) stay first-person plural.
Glossary anchors used throughout: funeral home = "la funeraria"; funeral director = "el director de la funeraria"; casket = "ataúd"; urn = "urna"; burial vault = "bóveda (vault)" — English kept with gloss on first use per surface; headstone = "lápida"; viewing = "velorio"; plot = "lote"; FTC Funeral Rule and General Price List kept in English with Spanish gloss on first use.

---

## app/worksheet/page.tsx — metadata

> EN: Pre-meeting preferences worksheet
ES: Hoja de preferencias previa a la reunión

> EN: Walk into the funeral home knowing what you want. Print this and bring it. The director sees you brought it and the meeting changes.
ES: Entre a la funeraria sabiendo lo que quiere. Imprima esta hoja y llévela. El director ve que usted la trajo y la reunión cambia.

## app/worksheet/page.tsx — header / back link

> EN: ← Planning
ES: ← Planificación

> EN: Pre-meeting worksheet
ES: Hoja de trabajo previa a la reunión

> EN: Walk into the meeting with decisions made.
ES: Llegue a la reunión con las decisiones ya tomadas.

> EN: Fill this out before you go to the funeral home. Print it. Bring it. The director will see you brought it — and that alone changes the meeting.
ES: Llene esta hoja antes de ir a la funeraria. Imprímala. Llévela. El director verá que usted la trajo — y eso, por sí solo, cambia la reunión.

> EN: Your answers save to this browser only. Nothing is sent.
ES: Sus respuestas se guardan solo en este navegador. No se envía nada.

## app/worksheet/page.tsx — planning-ahead banner (aheadMode)

> EN: The worksheet works just as well before a death — the arrangement meeting hasn't happened yet, and filling this out now means it starts with your decisions already made. Skip anything that doesn't apply yet.
ES: La hoja de trabajo funciona igual de bien antes de un fallecimiento — la reunión de arreglos aún no ha ocurrido, y llenarla ahora significa que empezará con sus decisiones ya tomadas. Omita lo que todavía no aplique.

---

## Worksheet.tsx — HARD_NOE_OPTIONS (checkbox labels, shown in Section 6 and on the printed card)

> EN: Embalming
ES: Embalsamamiento

> EN: Premium / metal casket
ES: Ataúd premium / de metal

> EN: Family limousine
ES: Limusina para la familia

> EN: Vault upgrade above cemetery's minimum
ES: Mejora de la bóveda (vault) por encima del mínimo del cementerio

> EN: Funeral home cosmetology / preparation
ES: Cosmetología / preparación por parte de la funeraria

> EN: Funeral home flowers (we'll order direct)
ES: Flores de la funeraria (las pediremos directamente)

> EN: Funeral home headstone (we'll buy from a monument company)
ES: Lápida de la funeraria (la compraremos a una empresa de monumentos)

> EN: Newspaper obituary printing
ES: Publicación del obituario en el periódico

## Worksheet.tsx — CASKET_LABELS

> EN: Simple wood (low cost)
ES: Madera sencilla (bajo costo)

> EN: Plain pine (kosher / traditional)
ES: Pino sencillo (kosher / tradicional)

> EN: Metal
ES: Metal

> EN: Premium wood (oak, mahogany)
ES: Madera premium (roble, caoba)

> EN: Bringing our own from a third-party vendor
ES: Traeremos el nuestro, comprado a un vendedor externo

> EN: None — cremation, combustible container only
ES: Ninguno — cremación, solo un contenedor combustible

## Worksheet.tsx — VIEWING_LABELS

> EN: Private (family only)
ES: Privado (solo la familia)

> EN: Public viewing / visitation
ES: Velorio público / visitación

> EN: No viewing
ES: Sin velorio

## Worksheet.tsx — LOCATION_LABELS

> EN: Funeral home chapel
ES: Capilla de la funeraria

> EN: Our church / place of worship
ES: Nuestra iglesia / lugar de culto

> EN: Graveside only
ES: Solo junto a la tumba

> EN: No service at the funeral home
ES: Sin servicio en la funeraria

## Worksheet.tsx — OFFICIANT_LABELS

> EN: Our own clergy / officiant
ES: Nuestro propio clero / oficiante

> EN: Funeral home staff officiant
ES: Oficiante del personal de la funeraria

> EN: Family member or friend
ES: Un familiar o amigo

> EN: No officiant
ES: Sin oficiante

## Worksheet.tsx — PROGRAMS_LABELS

> EN: We'll print our own (Canva / Word)
ES: Los imprimiremos nosotros (Canva / Word)

> EN: Funeral home prints them
ES: La funeraria los imprime

> EN: No programs
ES: Sin programas

## Worksheet.tsx — FLOWERS_LABELS

> EN: Direct from a florist (cheaper)
ES: Directamente de una florería (más barato)

> EN: Through the funeral home
ES: A través de la funeraria

> EN: No flowers
ES: Sin flores

## Worksheet.tsx — OBITUARY_LABELS

> EN: Online only (free)
ES: Solo en línea (gratis)

> EN: Online + newspaper
ES: En línea + periódico

> EN: No obituary
ES: Sin obituario

## Worksheet.tsx — CEMETERY_LABELS

> EN: Plot already owned
ES: Ya tenemos un lote

> EN: Need to purchase a plot
ES: Necesitamos comprar un lote

> EN: Not decided yet
ES: Aún no decidido

## Worksheet.tsx — EMBALMING_LABELS

> EN: No strong preference
ES: Sin preferencia firme

> EN: Decline embalming — refrigeration is fine
ES: Rechazamos el embalsamamiento — la refrigeración está bien

> EN: Open to embalming if needed
ES: Abiertos al embalsamamiento si es necesario

## Worksheet.tsx — save / reset / loading (runtime strings)

> EN: Clear all answers and start over?
ES: ¿Borrar todas las respuestas y empezar de nuevo?

> EN: (could not save — browser blocked storage)
ES: (no se pudo guardar — el navegador bloqueó el almacenamiento)

> EN: Loading…
ES: Cargando…

## Worksheet.tsx — Section 1: The basics

> EN: Section 1
ES: Sección 1

> EN: The basics
ES: Lo básico

> EN: Name of the person who has died (or will)
ES: Nombre de la persona que falleció (o que fallecerá)

> EN: Full name
ES: Nombre completo

> EN: Timeline
ES: Momento

> EN: e.g. anticipated this week, already passed, planning ahead
ES: p. ej., se anticipa esta semana, ya falleció, planificando con anticipación

> EN: When
ES: Cuándo

> EN: Type of service we're considering
ES: Tipo de servicio que estamos considerando

> EN: — pick one —
ES: — elija una opción —

> EN: Faith tradition (optional)
ES: Tradición religiosa (opcional)

> EN: — none / prefer not to say —
ES: — ninguna / prefiero no decir —

## Worksheet.tsx — Section 2: Body and disposition

> EN: Section 2
ES: Sección 2

> EN: Body and disposition
ES: El cuerpo y la disposición final

> EN: Body present at the service?
ES: ¿El cuerpo estará presente en el servicio?

> EN: Yes
ES: Sí

> EN: No
ES: No

> EN: Not sure yet
ES: No lo sabemos todavía

> EN: Embalming
ES: Embalsamamiento

> EN: Cosmetology / body preparation by funeral home staff?
ES: ¿Cosmetología / preparación del cuerpo por el personal de la funeraria?

> EN: Decide at the meeting
ES: Decidir en la reunión

> EN: Viewing
ES: Velorio

(The cosmetology select reuses "No" / "Yes" — same translations as above.)

## Worksheet.tsx — Section 3: Casket / urn / vault

> EN: Section 3
ES: Sección 3

> EN: Casket / urn / vault
ES: Ataúd / urna / bóveda (vault)

> EN: Casket choice
ES: Elección del ataúd

> EN: — pick one —
ES: — elija una opción —

> EN: We're bringing our own casket — funeral home must legally accept it (FTC Funeral Rule)
ES: Traeremos nuestro propio ataúd — la funeraria tiene la obligación legal de aceptarlo (FTC Funeral Rule, la regla federal sobre funerales)

> EN: We're providing our own urn
ES: Traeremos nuestra propia urna

> EN: If a vault is needed, only the cemetery's minimum requirement — no upgrades
ES: Si se necesita una bóveda (vault), solo el requisito mínimo del cementerio — sin mejoras

## Worksheet.tsx — Section 4: The service

> EN: Section 4
ES: Sección 4

> EN: The service
ES: El servicio

> EN: Where
ES: Dónde

> EN: Officiant
ES: Oficiante

> EN: Family is arranging music — funeral home doesn't need to
ES: La familia se encarga de la música — la funeraria no necesita hacerlo

> EN: Programs
ES: Programas

> EN: Flowers
ES: Flores

> EN: Obituary
ES: Obituario

## Worksheet.tsx — Section 5: Cemetery (conditional)

> EN: Section 5
ES: Sección 5

> EN: Cemetery
ES: Cementerio

> EN: Plot
ES: Lote

> EN: Headstone purchased direct from a monument company, not the funeral home (massive markup at FH)
ES: La lápida se comprará directamente a una empresa de monumentos, no a la funeraria (el sobreprecio en la funeraria es enorme)

## Worksheet.tsx — Section 6: Hard noes

> EN: Section 6
ES: Sección 6

> EN: Hard noes
ES: Los "no" definitivos

> EN: Check anything you have already decided you will *not* pay for. Bring this list to the meeting.
ES: Marque todo lo que usted ya decidió que *no* va a pagar. Lleve esta lista a la reunión.

## Worksheet.tsx — Section 7: Notes and questions

> EN: Section 7
ES: Sección 7

> EN: Notes and questions
ES: Notas y preguntas

> EN: Notes for ourselves
ES: Notas para nosotros

> EN: Anything we want to remember when we walk in
ES: Todo lo que queremos recordar al entrar

> EN: Questions to ask the funeral home
ES: Preguntas para hacerle a la funeraria

> EN: One per line
ES: Una por línea

## Worksheet.tsx — action buttons card

> EN: Save to this browser
ES: Guardar en este navegador

> EN: Print preferences
ES: Imprimir preferencias

> EN: Clear all
ES: Borrar todo

> EN: Saved at {savedAt}
ES: Guardado a las {savedAt}

> EN: Saving stores your answers in this browser only. Nothing is sent anywhere. If you clear your browser data or use a different device, you'll need to fill it in again.
ES: Al guardar, sus respuestas se almacenan solo en este navegador. No se envía nada a ningún lado. Si borra los datos de su navegador o usa otro dispositivo, tendrá que llenarla de nuevo.

## Worksheet.tsx — print view intro (screen only)

> EN: Printable summary
ES: Resumen para imprimir

> EN: This is what the funeral director will see when you bring this in. Hit **Print preferences** above (or Cmd/Ctrl-P) to print just this card.
ES: Esto es lo que verá el director de la funeraria cuando usted la lleve. Presione **Imprimir preferencias** arriba (o Cmd/Ctrl-P) para imprimir solo esta tarjeta.

## Worksheet.tsx — PrintableSummary: header + intro

> EN: Pre-meeting preferences
ES: Preferencias previas a la reunión

> EN: honestfuneral.co
ES: honestfuneral.co (sin cambios — nombre de marca, no traducir)

> EN: These are the family's decisions, made before the meeting. Please base recommendations and quotes on these preferences.
ES: Estas son las decisiones de la familia, tomadas antes de la reunión. Por favor, base sus recomendaciones y cotizaciones en estas preferencias.

## Worksheet.tsx — PrintableSummary: table row labels

> EN: Person
ES: Persona

> EN: Timeline
ES: Momento

> EN: Service type
ES: Tipo de servicio

> EN: Faith tradition
ES: Tradición religiosa

> EN: Body present at service
ES: Cuerpo presente en el servicio

> EN: Embalming
ES: Embalsamamiento

> EN: Cosmetology by FH staff
ES: Cosmetología por el personal de la funeraria

> EN: Viewing
ES: Velorio

> EN: Casket
ES: Ataúd

> EN: Bringing own casket
ES: Traen su propio ataúd

> EN: Providing own urn
ES: Traen su propia urna

> EN: Vault
ES: Bóveda (vault)

> EN: Service location
ES: Lugar del servicio

> EN: Officiant
ES: Oficiante

> EN: Music
ES: Música

> EN: Programs
ES: Programas

> EN: Flowers
ES: Flores

> EN: Obituary
ES: Obituario

> EN: Cemetery plot
ES: Lote en el cementerio

> EN: Headstone
ES: Lápida

## Worksheet.tsx — PrintableSummary: computed values

> EN: Not chosen yet
ES: Aún no elegido

> EN: Not specified
ES: No especificada

> EN: Yes — FH must accept it
ES: Sí — la funeraria debe aceptarlo

> EN: Cemetery minimum only — no upgrades
ES: Solo el mínimo del cementerio — sin mejoras

> EN: Open to discussion
ES: Abiertos a conversarlo

> EN: Family arranging
ES: La familia se encarga

> EN: Funeral home arranging
ES: Se encarga la funeraria

> EN: Direct from monument company
ES: Directamente de una empresa de monumentos

> EN: Open to FH options
ES: Abiertos a las opciones de la funeraria

(The empty-value placeholder "—" is punctuation only; it does not change.)

## Worksheet.tsx — PrintableSummary: hard noes / notes / questions / FTC footer

> EN: Hard noes — items the family will not pay for
ES: Los "no" definitivos — artículos que la familia no pagará

> EN: Notes
ES: Notas

> EN: Questions for the funeral home
ES: Preguntas para la funeraria

> EN: Under the FTC Funeral Rule, the family has the right to a written itemized General Price List, to provide their own casket or urn, and to decline any service that is not legally required.
ES: Según la FTC Funeral Rule (la regla federal sobre funerales), la familia tiene derecho a recibir una General Price List (lista general de precios) detallada y por escrito, a traer su propio ataúd o urna, y a rechazar cualquier servicio que no sea exigido por ley.

## Worksheet.tsx — ynu() helper (used by the printed card)

> EN: Yes
ES: Sí

> EN: No
ES: No

> EN: Decide at the meeting
ES: Decidir en la reunión
