# E1 — Pensar y construir con IA · Registro de pensamiento

> Este documento es parte del **expediente vivo** de la Residencia Founding AI Engineer.
> No registra solo *qué* construí, sino *cómo pensé, decidí e iteré* mientras lo construía.
> Se escribe en dos tiempos: el **diseño** (cerrado antes de construir) y la **bitácora**
> (que crece durante la construcción: el prompt, sus iteraciones, la verificación y la retrospectiva).
>
> Fecha de apertura: 2026-06-30 · Etapa: E1 · Proyecto: `projects/e1-landing-brief/`

---

## La etapa en una frase

E1 es donde paso de **usuario de IA** a **director de IA**: aprender a dirigir un modelo con
criterio —prompt engineering y context engineering— y producir resultados que **entiendo,
controlo y puedo defender**, no que solo "pedí". El criterio de cuándo *sí* y cuándo *no*
apoyarme en la IA es parte del aprendizaje, no un detalle.

---

## Proyecto de E1: "Brief de Landing"

### El problema y para quién
Pequeños negocios y profesionales necesitan una landing page, pero casi nunca saben cómo
estructurar el mensaje: qué decir en el hero, qué propuesta de valor, qué llamado a la acción.
Esa primera estructura se hace a mano, en blanco, cada vez. La herramienta resuelve ese
arranque: a partir de unas pocas respuestas, entrega una **primera estructura útil** de landing.

Elegí este problema porque vengo de marketing/ventas y lo entiendo desde adentro: mi criterio
de producto cubre lo que aún no domino técnicamente, y el resultado es algo *vendible*, no un
ejercicio de juguete.

### El contrato (qué hace, en una frase)
Recibe 5 respuestas sobre un negocio → devuelve un **brief de landing en texto (Markdown)** que
el dueño puede leer, copiar y usar. Nada más. Esa frase es la línea de "terminado".

### Entrada — 5 campos
| Campo | Qué captura |
|---|---|
| Negocio | Qué es el negocio |
| Oferta | Qué vende / qué ofrece |
| Público | A quién se dirige |
| Tono | Cómo suena la marca (cercano, formal, premium…) |
| Objetivo | Qué acción busca la landing (agendar, comprar, registrarse…) |

Cinco campos: suficiente contexto para que la IA produzca algo bueno, poca fricción para el
usuario. *Aquí vive una tensión de context engineering —más campos = mejor brief pero más
fricción— que documentaré al diseñar el prompt.*

### Salida
Un brief en **Markdown estructurado**, mostrado en pantalla y copiable, con:
- Propuesta de valor
- Titular de hero + subtítulo
- 3 beneficios
- Secciones sugeridas para la landing
- Llamado a la acción (CTA)

Es **texto**, no una landing renderizada (eso sería E2+). La razón es deliberada: el texto es
**verificable** —lo leo y juzgo si el copy sirve—, y la verificación es el corazón de E1.

### Arquitectura (las piezas)
```
projects/e1-landing-brief/
├── index.html        # formulario (5 campos) + JS que recoge respuestas y muestra el brief
└── api/
    └── brief.js      # función serverless: construye el prompt, llama a Claude, devuelve el texto
```
Flujo: `index.html` → `fetch('/api/brief')` → la función arma el prompt y llama a la API de
Anthropic → devuelve el brief → la página lo muestra.

La clave de la API (`ANTHROPIC_API_KEY`) vive en una **variable de entorno de Vercel**, nunca
en el código. Esto no es opcional: una clave en el código es una fuga de seguridad.

### Stack y por qué
HTML + JavaScript escritos **a mano** (sin framework) + una Vercel Function.
Por qué: a mi nivel actual quiero entender **cada línea**. Un framework escondería piezas y
violaría el principio que gobierna la residencia: *no aceptar código que no entiendo*. Es
continuidad directa de E0.

### Dónde vive en el repo
Dentro del monorepo `sovereign-builder`, en `projects/e1-landing-brief/`. Ver **ADR-1** abajo
para el razonamiento completo.

### Despliegue (decisión diferida a propósito)
El proyecto ya no es estático: tiene backend. Vercel despliega un repo como un proyecto con una
raíz, así que hay dos caminos limpios para un monorepo:
- **(a)** Un solo proyecto Vercel en la raíz; la herramienta como sub-ruta, su función en `/api/`.
- **(b)** Un segundo proyecto Vercel apuntando al mismo repo, con *Root Directory* =
  `projects/e1-landing-brief/` (URL propia, variable de entorno aislada).

Se decide **cuando lleguemos a desplegar**, para no dejar que la infraestructura robe el foco
del aprendizaje real. Inclinación actual: (b), por separación limpia. *A confirmar al desplegar.*

### El corazón de E1: prompt + verificación
El trabajo real de esta etapa **no es la infraestructura** —esa es el decorado—. Es:
1. **Diseñar el prompt del sistema** que convierte 5 respuestas en un buen brief: rol, tarea,
   contexto, restricciones, formato de salida. Se construye e itera (ver bitácora).
2. **Verificar**: definir qué hace bueno o malo a un brief, probar con negocios distintos
   (uno claro, uno ambiguo, uno casi vacío) y afinar el prompt según lo que falle.

---

## Decisiones de arquitectura registradas

### ADR-1 — Monorepo "expediente vivo" en vez de repo dedicado
**Decisión:** mantener los proyectos de la residencia dentro de `sovereign-builder`, en
`projects/<etapa>-<nombre>/`, con la documentación de pensamiento en `docs/`.

**Por qué:** el activo principal de la residencia no es cada app aislada, sino la **evidencia
acumulada de cómo aprendí a pensar, decidir y construir**. Un monorepo curado funciona como el
registro público de esa transformación; un conjunto de repos aislados fragmenta esa narrativa.

**Costo aceptado:** mezclar un sitio estático con un proyecto con backend obliga a aprender la
config de despliegue de Vercel para monorepos (ver sección de Despliegue). Es un costo real pero
acotado, y el conocimiento es útil.

**Frontera (cuándo se invierte):** si un proyecto se vuelve un producto comercial o merece vivir
solo, se extrae a su propio repo **con su historia** (`git subtree split --prefix=projects/...`).
La decisión es reversible, por eso es barata.

**Disciplinas que la sostienen** (para que el monorepo no se pudra):
1. README raíz como tour guiado / tabla de contenidos.
2. `docs/e1-prompt-engineering.md` (este archivo) como registro del pensamiento.
3. Convención `projects/<etapa>-<nombre>/`, cada proyecto con su propio README.
4. Distinción explícita en el README entre *artefactos de aprendizaje* y *productos vivos*.

### ADR-2 — IA dentro del producto (función serverless mínima) en vez de generador de prompt
**Decisión:** la herramienta llama a la API de Claude desde una función serverless (una sola
llamada), en lugar de generar un prompt para que el usuario lo pegue en su propia IA.

**Por qué:** respeta el objetivo de que el producto *use IA por dentro* (más vendible, resultado
instantáneo) y concentra el reto de aprendizaje justo donde E1 quiere: **diseñar el prompt/contexto
que se envía y verificar la salida**. El costo —un backend pequeño y una clave de API con costo
por uso— es bajo y bien acotado (~$5 de crédito sobran para todo E1).

**Alternativa descartada:** una app con framework, estado y múltiples llamadas; se sale del
alcance de 1–2 sesiones y mezcla temas de E2/E4.

---

## Criterios de "terminado" para este proyecto
- [ ] Genera un brief coherente y útil para al menos un negocio real de prueba.
- [ ] Maneja con dignidad entradas incompletas o raras (no se rompe feo).
- [ ] **Puedo explicar cada línea** del código y cada decisión del prompt — sin "lo escribió la IA".
- [ ] Está desplegado en vivo y accesible por URL.
- [ ] Documentado: este registro + el README del proyecto.

---

## Bitácora de construcción
*(Se completa durante la construcción — esta es la parte donde se ve el criterio formándose.)*

### Diseño del prompt del sistema e iteraciones
_Pendiente: el prompt inicial, qué falló, cómo lo afiné y por qué._

### Verificación: casos y hallazgos
_Pendiente: los 3 negocios de prueba, qué salió mal, qué aprendí sobre dirigir el modelo._

### Retrospectiva
_Pendiente: qué hice bien/mal, qué haría distinto un senior, cómo simplificar/mejorar/escalar._

## Por qué este proyecto existe

La forma más rápida de volverse dependiente de la IA es pedir resultados que no se entienden.

Este proyecto existe para practicar la habilidad opuesta:

- definir intención,
- proporcionar contexto,
- dirigir la generación,
- verificar la salida,
- y asumir la responsabilidad del resultado.

El objetivo de E1 no es construir un generador de briefs.

El objetivo de E1 es aprender a dirigir inteligencia con criterio.

## Bucle operativo de E1

Intención
    ↓
Contexto
    ↓
Generación
    ↓
Verificación
    ↓
Iteración

## Hipótesis de aprendizaje

Creo que la capacidad de dirigir sistemas de IA con criterio será una de las habilidades más valiosas de la próxima década.

La hipótesis de esta etapa es que:

- la calidad del resultado depende más del contexto que del modelo;
- la capacidad de verificación importa más que la capacidad de generación;
- la autoría permanece en quien dirige, no en quien ejecuta;
- el criterio es una ventaja más durable que cualquier herramienta específica.

Esta etapa pondrá a prueba esa hipótesis.