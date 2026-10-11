# @ismael1361/animation

Uma coleção de funções e classes utilitárias, fortemente tipadas, construídas com TypeScript para acelerar o desenvolvimento de projetos em JavaScript/TypeScript.

## Instalação

```bash
npm install @ismael1361/animation
# ou
yarn add @ismael1361/animation
```

---

## Indice

- [@ismael1361/animation](#ismael1361animation)
  - [Instalação](#instalação)
  - [Indice](#indice)
  - [`create`](#create)
  - [Propriedades da Instância](#propriedades-da-instância)
    - [`state`](#state)
    - [`onChange`](#onchange)
    - [`start`](#start)
    - [`clear`](#clear)
    - [`pause`](#pause)
    - [`resume`](#resume)
    - [`play`](#play)
    - [`stop`](#stop)
    - [`restart`](#restart)
  - [Métodos](#métodos)
    - [`timeSincePreviousFrame`](#timesincepreviousframe)
    - [`timing`](#timing)
    - [`wait`](#wait)
    - [`waitUntil`](#waituntil)
    - [`delay`](#delay)
    - [`parallel`](#parallel)
    - [`all`](#all)
    - [`any`](#any)
    - [`chain`](#chain)
    - [`stagger`](#stagger)
    - [`sequence`](#sequence)
    - [`loop`](#loop)
  - [Easing](#easing)
    - [`Easing.linear`](#easinglinear)
    - [`Easing.ease`](#easingease)
    - [`Easing.quad`](#easingquad)
    - [`Easing.cubic`](#easingcubic)
    - [`Easing.poly`](#easingpoly)
    - [`Easing.sin`](#easingsin)
    - [`Easing.circle`](#easingcircle)
    - [`Easing.exp`](#easingexp)
    - [`Easing.elastic`](#easingelastic)
    - [`Easing.back`](#easingback)
    - [`Easing.bounce`](#easingbounce)
    - [`Easing.bezier`](#easingbezier)
    - [`Easing.bezierFn`](#easingbezierfn)
    - [`Easing.in`](#easingin)
    - [`Easing.out`](#easingout)
    - [`Easing.inOut`](#easinginout)
    - [`Easing.steps`](#easingsteps)
  - [Shared Value](#shared-value)
    - [`SharedValue`](#sharedvalue)
      - [Propriedades da Instância](#propriedades-da-instância-1)
        - [`value`](#value)
        - [`current`](#current)
        - [`on`](#on)
        - [`off`](#off)
        - [`clear`](#clear-1)
    - [`SharedValues`](#sharedvalues)
      - [Propriedades da Instância](#propriedades-da-instância-2)
        - [`values`](#values)
        - [`current`](#current-1)
        - [`on`](#on-1)
        - [`off`](#off-1)
        - [`initialize`](#initialize)
        - [`destroy`](#destroy)
        - [`clear`](#clear-2)
    - [`sharedValues`](#sharedvalues-1)

## `create`

```ts
create<S extends AnimationState = {}>(animation: AnimationFn<S>, state?: S): AnimationProps<S>;
```

Cria e gerencia um loop de animação baseado em um gerador, fornecendo controles como play, pause e stop.

Esta função é o coração do sistema de animação. Ela recebe a lógica da animação (um gerador) e um estado inicial. O estado é convertido em `SharedValue`s reativos que podem ser manipulados pelas funções de animação (`timing`, `wait`, etc.) dentro do gerador. O objeto retornado permite iniciar, pausar, parar e reiniciar a animação.

**Exemplo:**
```typescript
import { create, timing, wait } from '@ismael1361/animation';

// 1. Defina o estado inicial que sua animação irá manipular.
const initialState = {
  progress: 0,
};

// 2. Crie a animação usando a função `create`.
// A função geradora recebe o estado como `SharedValue`s.
const { state, start, pause } = create(function* (state) {
  console.log("Animação iniciada!");

  // Anima o valor 'progress' de 0 para 1 em 1 segundo.
  yield* timing(state.progress, { to: 1, duration: 1000 });

  yield* wait(500); // Pausa por 500ms.

  // Anima de volta para 0.
  yield* timing(state.progress, { to: 0, duration: 1000 });

  console.log("Animação concluída!");
}, initialState);

state.progress.on("change", (value)=>{
  console.log(`Progresso: ${value}`);
});

// 3. Inicie a animação.
start();

// Você pode controlar a animação a qualquer momento.
// setTimeout(() => pause(), 1200);
```

---

## Propriedades da Instância

### `state`

```ts
.state: SharedValuesState<S>;
```

Um objeto contendo os SharedValues reativos do estado da animação. Você pode usar isso para ler o estado atual da sua animação de fora do gerador.

**Exemplo:**
```typescript
const myAnimation = create(..., { progress: 0 });
// Em um loop de renderização ou efeito:
console.log(myAnimation.state.progress.value);
```

### `onChange`

```ts
.onChange(callback: (state: SharedValuesState<S>) => void): EventHandler;
```

Registra um ouvinte que é acionado sempre que qualquer valor no estado da animação é alterado. Isso é útil para sincronizar o estado da animação com a UI ou outra lógica externa, sem a necessidade de usar um hook React para re-renderizar o componente.

**Exemplo:**
```typescript
const myAnimation = create(..., { progress: 0 });
myAnimation.onChange((state) => {
  console.log(`Progresso: ${state.progress.value}`);
});
```

### `start`

```ts
.start(): void;
```

Inicia a animação do começo. Se já estiver em execução, ela será reiniciada.

**Exemplo:**
```typescript
const myAnimation = create(..., { progress: 0 });
myAnimation.start();
```

### `clear`

```ts
.clear(): void;
```

Limpa quaisquer recursos ou listeners criados pela animação (ex: via `onClear`).

**Exemplo:**
```typescript
const myAnimation = create(..., { progress: 0 });
myAnimation.clear();
```

### `pause`

```ts
.pause(): void;
```

Pausa a animação em seu estado atual.

**Exemplo:**
```typescript
const myAnimation = create(..., { progress: 0 });
myAnimation.pause();
```

### `resume`

```ts
.resume(): void;
```

Retoma uma animação que foi pausada.

**Exemplo:**
```typescript
const myAnimation = create(..., { progress: 0 });
myAnimation.pause();
myAnimation.resume();
```

### `play`

```ts
.play(): void;
```

Um atalho para `resume()`. Retoma uma animação pausada.

**Exemplo:**
```typescript
const myAnimation = create(..., { progress: 0 });
myAnimation.pause();
myAnimation.play();
```

### `stop`

```ts
.stop(): void;
```

Para a animação completamente, limpa seus recursos e redefine seu estado.

**Exemplo:**
```typescript
const myAnimation = create(..., { progress: 0 });
myAnimation.stop();
```

### `restart`

```ts
.restart(): void;
```

Um atalho para `stop()` seguido de `start()`. Reinicia a animação.

**Exemplo:**
```typescript
const myAnimation = create(..., { progress: 0 });
myAnimation.restart();
```

---

## Métodos

### `timeSincePreviousFrame`

```ts
timeSincePreviousFrame(): InputGenerator<number>;
```

Obtém o tempo decorrido (em milissegundos) desde o quadro de animação anterior. Usado dentro de um gerador de animação para controlar o fluxo de tempo.

**Exemplo:**
```typescript
import { create, timing, wait } from '@ismael1361/animation';

const animation = create(function* (state) {
  // Anima o valor 'progress' de 0 para 1 em 1 segundo.
  yield* timing(state.progress, { to: 1, duration: 1000 });

  yield* wait(500); // Pausa por 500ms.

  // Anima de volta para 0.
  yield* timing(state.progress, { to: 0, duration: 1000 });

  console.log("Animação concluída!");
}, { progress: 0 });

animation.start();
```

### `timing`

```ts
timing(value: SharedValue<number> | TimingCallback, config?: TimingConfig): InputGenerator
```

Anima propriedade de um `SharedValue<number>` ou executa uma função de retorno de chamada com o valor animado.

**Exemplo:**
```typescript
import { create, timing, wait } from '@ismael1361/animation';

const animation = create(function* (state) {
  // Anima o valor 'progress' de 0 para 1 em 1 segundo.
  yield* timing(state.progress, { to: 1, duration: 1000 });

  yield* wait(500); // Pausa por 500ms.

  // Anima de volta para 0.
  yield* timing(state.progress, { to: 0, duration: 1000 });

  yield* wait(500); // Pausa por 500ms.

  // Usando uma função de retorno de chamada.
  yield* timing((value) => {
    console.log(`Progresso: ${value}`);
    state.progress.value = value;
  }, { to: 0, duration: 1000 });

  console.log("Animação concluída!");
}, { progress: 0 });

animation.start();
```

### `wait`

```ts
wait(duration?: number): InputGenerator;
```

Pausa a execução da animação por uma determinada duração.

**Exemplo:**
```typescript
import { create, timing, wait } from '@ismael1361/animation';

const animation = create(function* (state) {
  // Anima o valor 'progress' de 0 para 1 em 1 segundo.
  yield* timing(state.progress, { to: 1, duration: 1000 });

  yield* wait(500); // Pausa por 500ms.

  // Anima de volta para 0.
  yield* timing(state.progress, { to: 0, duration: 1000 });

  console.log("Animação concluída!");
}, { progress: 0 });

animation.start();
```

### `waitUntil`

```ts
waitUntil(value: SharedValue<boolean>, invert?: boolean): InputGenerator
```

Pausa a execução da animação até que uma condição em um `SharedValue<boolean>` seja atendida.

**Exemplo:**
```ts
import { create, timing, waitUntil } from '@ismael1361/animation';

const animation = create(function* (state) {
  // Anima o valor 'progress' de 0 para 1 em 1 segundo.
  yield* timing(state.progress, { to: 1, duration: 1000 });

  yield* waitUntil(state.progress, true); // Pausa enquanto 'progress' for menor que 1.

  // Anima de volta para 0.
  yield* timing(state.progress, { to: 0, duration: 1000 });

  console.log("Animação concluída!");
}, { progress: 0 });

animation.start();
```

### `delay`

```ts
delay(duration?: number | undefined, animation?: Input | undefined): InputGenerator
```

Cria uma pausa e, opcionalmente, executa outra animação em seguida. É um atalho para combinar `wait` com outra animação.

**Exemplo:**
```typescript
import { create, timing, delay } from '@ismael1361/animation';

const animation = create(function* (state) {
  // Anima o valor 'progress' de 0 para 1 em 1 segundo.
  yield* timing(state.progress, { to: 1, duration: 1000 });

  yield* delay(500, timing(state.progress, { to: 0, duration: 1000 }));

  console.log("Animação concluída!");
}, { progress: 0 });

animation.start();
```

### `parallel`

```ts
parallel(...animations: Inputs): InputGenerator
```

Executa múltiplas animações (geradores) em paralelo. A execução termina quando todas as animações filhas tiverem sido concluídas.

**Exemplo:**
```typescript
import { create, timing, parallel, wait } from '@ismael1361/animation';

const animation = create(function* (state) {
  // Anima o valor 'progress' de 0 para 1 em 1 segundo.
  yield* timing(state.progress, { to: 1, duration: 1000 });

  yield* parallel(
    timing(state.progress, { to: 0, duration: 1000 }),
    wait(500)
  );

  console.log("Animação concluída!");
}, { progress: 0 });

animation.start();
```

### `all`

```ts
all(...animations: Inputs): InputGenerator
```

Um alias para `parallel`. Executa múltiplas animações em paralelo.A execução termina quando todas as animações filhas tiverem sido concluídas.

**Exemplo:**
```typescript
import { create, timing, all, wait } from '@ismael1361/animation';

const animation = create(function* (state) {
  // Anima o valor 'progress' de 0 para 1 em 1 segundo.
  yield* timing(state.progress, { to: 1, duration: 1000 });

  yield* all(
    timing(state.progress, { to: 0, duration: 1000 }),
    wait(500)
  );

  console.log("Animação concluída!");
}, { progress: 0 });

animation.start();
```

### `any`

```ts
any(...animations: Inputs): InputGenerator
```

Executa múltiplas animações (geradores) em paralelo e termina assim que a primeira delas for concluída. As outras animações são interrompidas.

**Exemplo:**
```typescript
import { create, timing, any, wait } from '@ismael1361/animation';

const animation = create(function* (state) {
  // Anima o valor 'progress' de 0 para 1 em 1 segundo.
  yield* timing(state.progress, { to: 1, duration: 1000 });

  yield* any(
    timing(state.progress, { to: 0, duration: 1000 }),
    wait(500)
  );

  console.log("Animação concluída!");
}, { progress: 0 });

animation.start();
```

### `chain`

```ts
chain(...animations: Inputs): InputGenerator
```

Executa múltiplas animações (geradores) em sequência, uma após a outra.

**Exemplo:**
```typescript
import { create, timing, chain, wait } from '@ismael1361/animation';

const animation = create(function* (state) {
  // Anima o valor 'progress' de 0 para 1 em 1 segundo.
  yield* timing(state.progress, { to: 1, duration: 1000 });

  yield* chain(
    timing(state.progress, { to: 0, duration: 1000 }),
    wait(500)
  );

  console.log("Animação concluída!");
}, { progress: 0 });

animation.start();
```

### `stagger`

```ts
stagger(delayMs: number, ...animations: Inputs): InputGenerator
```

Executa múltiplas animações em paralelo, mas com um atraso escalonado entre o início de cada uma.

**Exemplo:**
```typescript
import { create, timing, wait, stagger } from '@ismael1361/animation';

const animation = create(function* (state) {
  // Anima o valor 'progress' de 0 para 1 em 1 segundo.
  yield* timing(state.progress, { to: 1, duration: 1000 });

  yield* stagger(500,
    timing(state.progress, { to: 0, duration: 1000 }),
    wait(500)
  );

  console.log("Animação concluída!");
}, { progress: 0 });

animation.start();
```

### `sequence`

```ts
sequence(delayMs: number, ...animations: Inputs): InputGenerator
```

Executa múltiplas animações em sequência, com um atraso definido entre o fim de uma e o início da próxima.

**Exemplo:**
```typescript
import { create, timing, wait, sequence } from '@ismael1361/animation';

const animation = create(function* (state) {
  // Anima o valor 'progress' de 0 para 1 em 1 segundo.
  yield* timing(state.progress, { to: 1, duration: 1000 });

  yield* sequence(500,
    timing(state.progress, { to: 0, duration: 1000 }),
    wait(500)
  );

  console.log("Animação concluída!");
}, { progress: 0 });

animation.start();
```

### `loop`

```ts
loop(factory: LoopCallback): InputGenerator
loop(iterations: number, factory: LoopCallback): InputGenerator
```

Executa uma animação (gerador) repetidamente.

**Exemplo:**
```typescript
import { create, timing, loop } from '@ismael1361/animation';

const animation = create(function* (state) {
  // Anima o valor 'progress' de 0 para 1 em 1 segundo.
  yield* timing(state.progress, { to: 1, duration: 1000 });

  yield* loop(
    timing(state.progress, { to: 0, duration: 1000 })
  );

  console.log("Animação concluída!");
}, { progress: 0 });

animation.start();
```

---

## Easing

### `Easing.linear`

```ts
Easing.linear(t: number): number
```

Função linear, `f(t) = t`. A posição se correlaciona um-para-um com o tempo decorrido.

**Exemplo:**
```typescript
import { Easing, create, timing } from '@ismael1361/animation';

const animation = create(function* (state) {
  // Anima o valor 'progress' de 0 para 1 em 1 segundo.
  yield* timing(state.progress, { to: 1, duration: 1000, easing: Easing.linear });

  console.log("Animação concluída!");
}, { progress: 0 });

animation.start();
```

### `Easing.ease`

```ts
Easing.ease(t: number): number
```

Uma interação inercial simples, semelhante a um objeto acelerando lentamente.

**Exemplo:**
```typescript
import { Easing, create, timing } from '@ismael1361/animation';

const animation = create(function* (state) {
  // Anima o valor 'progress' de 0 para 1 em 1 segundo.
  yield* timing(state.progress, { to: 1, duration: 1000, easing: Easing.ease });

  console.log("Animação concluída!");
}, { progress: 0 });

animation.start();
```

### `Easing.quad`

```ts
Easing.quad(t: number): number
```

Função quadrática, `f(t) = t * t`. A posição é igual ao quadrado do tempo decorrido.

**Exemplo:**
```typescript
import { Easing, create, timing } from '@ismael1361/animation';

const animation = create(function* (state) {
  // Anima o valor 'progress' de 0 para 1 em 1 segundo.
  yield* timing(state.progress, { to: 1, duration: 1000, easing: Easing.quad });

  console.log("Animação concluída!");
}, { progress: 0 });

animation.start();
```

### `Easing.cubic`

```ts
Easing.cubic(t: number): number
```

Função cúbica, `f(t) = t * t * t`. A posição é igual ao cubo do tempo decorrido.

**Exemplo:**
```typescript
import { Easing, create, timing } from '@ismael1361/animation';

const animation = create(function* (state) {
  // Anima o valor 'progress' de 0 para 1 em 1 segundo.
  yield* timing(state.progress, { to: 1, duration: 1000, easing: Easing.cubic });

  console.log("Animação concluída!");
}, { progress: 0 });

animation.start();
```

### `Easing.poly`

```ts
Easing.poly(n: number): EasingFunction
```

Cria uma função de potência. A posição é igual à N-ésima potência do tempo decorrido.

**Exemplo:**
```typescript
import { Easing, create, timing } from '@ismael1361/animation';

const animation = create(function* (state) {
  // Anima o valor 'progress' de 0 para 1 em 1 segundo.
  yield* timing(state.progress, { to: 1, duration: 1000, easing: Easing.poly(3) });

  console.log("Animação concluída!");
}, { progress: 0 });

animation.start();
```

### `Easing.sin`

```ts
Easing.sin(t: number): number
```

Função sinusoidal.

**Exemplo:**
```typescript
import { Easing, create, timing } from '@ismael1361/animation';

const animation = create(function* (state) {
  // Anima o valor 'progress' de 0 para 1 em 1 segundo.
  yield* timing(state.progress, { to: 1, duration: 1000, easing: Easing.sin });

  console.log("Animação concluída!");
}, { progress: 0 });

animation.start();
```

### `Easing.circle`

```ts
Easing.circle(t: number): number
```

Função circular.

**Exemplo:**
```typescript
import { Easing, create, timing } from '@ismael1361/animation';

const animation = create(function* (state) {
  // Anima o valor 'progress' de 0 para 1 em 1 segundo.
  yield* timing(state.progress, { to: 1, duration: 1000, easing: Easing.circle });

  console.log("Animação concluída!");
}, { progress: 0 });

animation.start();
```

### `Easing.exp`

```ts
Easing.exp(t: number): number
```

Função exponencial.

**Exemplo:**
```typescript
import { Easing, create, timing } from '@ismael1361/animation';

const animation = create(function* (state) {
  // Anima o valor 'progress' de 0 para 1 em 1 segundo.
  yield* timing(state.progress, { to: 1, duration: 1000, easing: Easing.exp });

  console.log("Animação concluída!");
}, { progress: 0 });

animation.start();
```

### `Easing.elastic`

```ts
Easing.elastic(bounciness?: number): EasingFunction
```

Cria uma interação elástica simples, como uma mola oscilando. O `bounciness` (elasticidade) padrão é 1. Um valor 0 não ultrapassa o limite, e um valor N > 1 ultrapassará o limite aproximadamente N vezes.

**Exemplo:**
```typescript
import { Easing, create, timing } from '@ismael1361/animation';

const animation = create(function* (state) {
  // Anima o valor 'progress' de 0 para 1 em 1 segundo.
  yield* timing(state.progress, { to: 1, duration: 1000, easing: Easing.elastic(1.5) });

  console.log("Animação concluída!");
});

animation.start();
```

### `Easing.back`

```ts
Easing.back(s?: number): EasingFunction
```

Cria um efeito onde o objeto recua um pouco antes de avançar.

**Exemplo:**
```typescript
import { Easing, create, timing } from '@ismael1361/animation';

const animation = create(function* (state) {
  // Anima o valor 'progress' de 0 para 1 em 1 segundo.
  yield* timing(state.progress, { to: 1, duration: 1000, easing: Easing.back(2) });

  console.log("Animação concluída!");
}, { progress: 0 });

animation.start();
```

### `Easing.bounce`

```ts
Easing.bounce(t: number): number
```

Fornece um efeito de "quicar" simples.

**Exemplo:**
```typescript
import { Easing, create, timing } from '@ismael1361/animation';

const animation = create(function* (state) {
  // Anima o valor 'progress' de 0 para 1 em 1 segundo.
  yield* timing(state.progress, { to: 1, duration: 1000, easing: Easing.bounce });

  console.log("Animação concluída!");
}, { progress: 0 });

animation.start();
```

### `Easing.bezier`

```ts
Easing.bezier(x1: number, y1: number, x2: number, y2: number): { factory: () => EasingFunction; }
```

Cria uma curva de Bézier cúbica, equivalente à `transition-timing-function` do CSS.

**Exemplo:**
```typescript
import { Easing, create, timing } from '@ismael1361/animation';

const animation = create(function* (state) {
  // Anima o valor 'progress' de 0 para 1 em 1 segundo.
  yield* timing(state.progress, { to: 1, duration: 1000, easing: Easing.bezier(0.25, 0.1, 0.25, 1).factory() });

  console.log("Animação concluída!");
}, { progress: 0 });

animation.start();
```

### `Easing.bezierFn`

```ts
Easing.bezierFn(x1: number, y1: number, x2: number, y2: number): EasingFunction
```

A implementação base para a curva de Bézier cúbica.

**Exemplo:**
```typescript
import { Easing, create, timing } from '@ismael1361/animation';

const animation = create(function* (state) {
  // Anima o valor 'progress' de 0 para 1 em 1 segundo.
  yield* timing(state.progress, { to: 1, duration: 1000, easing: Easing.bezierFn(0.25, 0.1, 0.25, 1) });

  console.log("Animação concluída!");
}, { progress: 0 });

animation.start();
```

### `Easing.in`

```ts
Easing.in(easing: EasingFunction): EasingFunction
```

Modificador que executa uma função de easing na sua forma original (aceleração no início).

**Exemplo:**
```typescript
import { Easing, create, timing } from '@ismael1361/animation';

const animation = create(function* (state) {
  // Anima o valor 'progress' de 0 para 1 em 1 segundo.
  yield* timing(state.progress, { to: 1, duration: 1000, easing: Easing.in(Easing.sin) });

  console.log("Animação concluída!");
}, { progress: 0 });

animation.start();
```

### `Easing.out`

```ts
Easing.out(easing: EasingFunction): EasingFunction
```

Modificador que executa uma função de easing de forma invertida (desaceleração no final).

**Exemplo:**
```typescript
import { Easing, create, timing } from '@ismael1361/animation';

const animation = create(function* (state) {
  // Anima o valor 'progress' de 0 para 1 em 1 segundo.
  yield* timing(state.progress, { to: 1, duration: 1000, easing: Easing.out(Easing.sin) });

  console.log("Animação concluída!");
}, { progress: 0 });

animation.start();
```

### `Easing.inOut`

```ts
Easing.inOut(easing: EasingFunction): EasingFunction
```

Modificador que torna qualquer função de easing simétrica. A função acelera na primeira metade da duração e desacelera na segunda metade.

**Exemplo:**
```typescript
import { Easing, create, timing } from '@ismael1361/animation';

const animation = create(function* (state) {
  // Anima o valor 'progress' de 0 para 1 em 1 segundo.
  yield* timing(state.progress, { to: 1, duration: 1000, easing: Easing.inOut(Easing.sin) });

  console.log("Animação concluída!");
}, { progress: 0 });

animation.start();
```

### `Easing.steps`

```ts
Easing.steps(n?: number, roundToNextStep?: boolean | undefined): EasingFunction
```

Cria uma função de easing que avança em degraus discretos.

**Exemplo:**
```typescript
import { Easing, create, timing } from '@ismael1361/animation';

const animation = create(function* (state) {
  // Anima o valor 'progress' de 0 para 1 em 1 segundo.
  yield* timing(state.progress, { to: 1, duration: 1000, easing: Easing.steps(5) });

  console.log("Animação concluída!");
}, { progress: 0 });

animation.start();
```

---


## Shared Value

### `SharedValue`

```ts
class SharedValue<T>
```

Uma classe que encapsula um valor, permitindo que ele seja "observável" e reativo. Emite eventos quando seu valor é alterado, sendo a base para a reatividade nas animações.

**Exemplo:**
```typescript
import { SharedValue } from '@ismael1361/animation';

const opacity = new SharedValue(0);

opacity.on('change', (newValue) => {
  console.log(`A opacidade mudou para: ${newValue}`);
});

// Define um novo valor, o que dispara o evento 'change'
opacity.value = 0.5; // Logs: "A opacidade mudou para: 0.5"

// Acessa o valor atual
console.log(opacity.value); // Logs: 0.5

// Reseta para o valor inicial
opacity.clear(); // Logs: "A opacidade mudou para: 0"
console.log(opacity.value); // Logs: 0
```

---

#### Propriedades da Instância

##### `value`

```ts
.value: T;
```

Obtém o valor atual. Define um novo valor. Se o novo valor for diferente do atual, emite os eventos 'value' e 'change'.

##### `current`

```ts
.current: T;
```

Obtém o valor atual. Define um novo valor. Se o novo valor for diferente do atual, emite os eventos 'value' e 'change'.

##### `on`

```ts
.on(event: 'value', callback: (value: T) => void): void;
.on(event: 'change', callback: (value: T) => void): void;
```

Adiciona um listener para um evento especifico.

##### `off`

```ts
.off(event: 'value', callback: (value: T) => void): void;
.off(event: 'change', callback: (value: T) => void): void;
```

Remove um listener para um evento especifico.

##### `clear`

```ts
.clear(): void
```

Limpa o valor e emite o evento 'change' com o valor inicial.

---

### `SharedValues`

```ts
class SharedValues<S>
```

Gerencia um grupo de instâncias de `SharedValue` como um único objeto de estado.

Esta classe é um contêiner que pega um objeto de estado inicial e cria um `SharedValue` para cada uma de suas propriedades. Ela observa mudanças em qualquer um dos valores internos e emite eventos agregados, tornando mais fácil reagir a mudanças no estado geral da animação.

**Exemplo:**
```typescript
import { SharedValues } from '@ismael1361/animation';

const stateManager = new SharedValues({ x: 0, y: 100, opacity: 1 });

// Ouve por mudanças em qualquer propriedade.
// O evento é otimizado com requestAnimationFrame.
stateManager.on('change', (newState) => {
  console.log('O estado completo mudou:', newState);
  // Exemplo de saída: { x: 50, y: 100, opacity: 1 }
});

// Ouve por mudanças em uma propriedade específica.
stateManager.on('value', (key, value) => {
   console.log(`A propriedade '${key}' mudou para ${value}`);
   // Exemplo de saída: "A propriedade 'x' mudou para 50"
});

// Modifica um valor individual, o que dispara os eventos.
stateManager.current.x.value = 50;

// Obtém um snapshot dos valores atuais.
console.log(stateManager.values); // { x: 50, y: 100, opacity: 1 }

// Reseta todos os valores para o estado inicial.
stateManager.clear();
console.log(stateManager.values); // { x: 0, y: 100, opacity: 1 }
```

---

#### Propriedades da Instância

##### `values`

```ts
.values: S;
```

Obtém um snapshot dos valores atuais.

##### `current`

```ts
.current: SharedValuesState<S>;
```

Obtém o objeto de estado reativo, onde cada propriedade é uma instância de `SharedValue`. Use isso para acessar e manipular os valores individuais da animação diretamente.

##### `on`

```ts
.on(event: 'value', callback: (key: keyof S, value: S[keyof S]) => void): void;
.on(event: 'change', callback: (values: S) => void): void;
```

Adiciona um listener para um evento especifico.

##### `off`

```ts
.off(event: 'value', callback: (key: keyof S, value: S[keyof S]) => void): void;
.off(event: 'change', callback: (values: S) => void): void;
```

Remove um listener para um evento especifico.

##### `initialize`

```ts
.initialize(): void
```

Reinicia todos os valores para o estado inicial.

##### `destroy`

```ts
.destroy(): void
```

Limpa todos os listeners.

##### `clear`

```ts
.clear(): void
```

Limpa todos os valores e emite o evento 'change' com o estado inicial.

### `sharedValues`

```ts
sharedValues<S>(state: S): SharedValues<S>
```

Função de fábrica para criar e retornar uma nova instância de `SharedValues`.

É um atalho conveniente para `new SharedValues(state)`.

**Exemplo:**
```typescript
import { sharedValues } from '@ismael1361/animation';

const initialState = {
  x: 0,
  y: 0,
};

const position = sharedValues(initialState);

position.on('change', (newPosition) => {
  console.log('Nova posição:', newPosition);
  // => Nova posição: { x: 10, y: 0 }
});

// Modifica um valor individual
position.current.x.value = 10;

// Obtém um snapshot dos valores atuais
console.log(position.values); // { x: 10, y: 0 }
```