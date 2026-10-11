# @ismael1361/react-use

Uma coleção de hooks úteis para React, construídos com TypeScript.

## Instalação

```bash
npm install @ismael1361/react-use
# ou
yarn add @ismael1361/react-use
```

---

## Indice

- [@ismael1361/react-use](#ismael1361react-use)
  - [Instalação](#instalação)
  - [Indice](#indice)
  - [`useBeforeunload`](#usebeforeunload)
  - [`useCache`](#usecache)
  - [`useCallbackRef`](#usecallbackref)
  - [`useCountdown`](#usecountdown)
  - [`useData`](#usedata)
  - [`useDataStorager`](#usedatastorager)
  - [`useDebouncedCallback`](#usedebouncedcallback)
  - [`useDebouncedEffect`](#usedebouncedeffect)
  - [`useEventEmitter`](#useeventemitter)
  - [`useEventListener`](#useeventlistener)
  - [`useHistory`](#usehistory)
  - [`useId`](#useid)
  - [`useLocalStorage`](#uselocalstorage)
  - [`useMediaQuery`](#usemediaquery)
  - [`usePromise`](#usepromise)
  - [`useRefObserver`](#userefobserver)
  - [`useSizeEffect`](#usesizeeffect)
  - [`useSubscribeEvent`](#usesubscribeevent)
  - [`useToggle`](#usetoggle)
  - [`useSharedValue`](#usesharedvalue)
  - [`useSharedValues`](#usesharedvalues)
  - [`useAnimation`](#useanimation)
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

---

## `useBeforeunload`

```typescript
useBeforeunload(handler: (event: BeforeUnloadEvent) => string | void): void
```

Um hook do React para lidar com o evento `beforeunload`, permitindo exibir um prompt de confirmação ao usuário antes que ele saia da página.

É ideal para prevenir a perda acidental de dados em formulários, editores de texto ou qualquer aplicação onde o usuário possa ter alterações não salvas.

**Exemplo:**
```tsx
import React, { useState } from 'react';
import { useBeforeunload } from '@ismael1361/react-use';

const TextEditor = () => {
  const [text, setText] = useState('');
  const hasUnsavedChanges = text !== '';

  useBeforeunload((event) => {
    // A condição é verificada apenas quando o usuário tenta sair.
    if (hasUnsavedChanges) {
      // Retornar qualquer string ativa o prompt de confirmação do navegador.
      return 'Você tem alterações não salvas!';
    }
  });

  return (
    <div>
      <h3>Editor de Texto</h3>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Escreva algo e tente sair da página."
      />
    </div>
  );
};
```

## `useCache`

```typescript
useCache<T>(key: PropertyKey, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>]
```

Um hook customizado do React que gerencia um estado em um cache global na memória. Ele se comporta como o `useState`, mas o valor é compartilhado entre todos os componentes que usam o mesmo `key`. O estado não é persistente e será perdido ao recarregar a página.

Útil para compartilhar estado entre componentes distantes na árvore de componentes sem recorrer a prop drilling ou contextos complexos, quando a persistência não é necessária.

**Exemplo:**
```tsx
import { useCache } from "@ismael1361/react-use";

// Componente 1: Exibe e atualiza um contador
function CounterDisplay() {
  const [count, setCount] = useCache('sharedCounter', 0);

  return (
    <div>
      <p>Contador: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>Incrementar</button>
    </div>
  );
}

// Componente 2: Apenas exibe o mesmo contador
function CounterViewer() {
  const [count] = useCache('sharedCounter', 0);
  return <p>Valor atual do contador (em outro componente): {count}</p>;
}
```

## `useCallbackRef`

```typescript
useCallbackRef<T>(callback: T | undefined): T
```

Um hook do React que cria uma referência de função estável (memoizada) para um callback que pode mudar ao longo do tempo.

Este hook retorna uma função com uma identidade estável que não muda entre as renderizações. No entanto, ao ser chamada, ela sempre executará a versão mais recente da função de `callback` que foi passada para o hook.

É útil para otimizações de performance, especialmente ao passar callbacks para componentes filhos memoizados (`React.memo`) ou para hooks como `useEffect`, `useCallback`, e `useMemo`, evitando re-renderizações ou re-execuções desnecessárias quando apenas a implementação do callback muda.

**Exemplo:**
```tsx
import React, { useState, useCallback } from 'react';
import { useCallbackRef } from '@ismael1361/react-use';

// Componente filho memoizado que só re-renderiza se suas props mudarem.
const MemoizedButton = React.memo(({ onClick }) => {
  console.log('Filho re-renderizou');
  return <button onClick={onClick}>Clique em mim</button>;
});

const ParentComponent = () => {
  const [count, setCount] = useState(0);

  // Este callback é recriado a cada renderização do ParentComponent.
  const handleClick = () => {
    console.log(`O contador atual é: ${count}`);
  };

  // Usamos useCallbackRef para criar uma referência estável para o handleClick.
  const stableHandleClick = useCallbackRef(handleClick);

  return (
    <div>
      <p>Contador: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>Incrementar</button>
      <MemoizedButton onClick={stableHandleClick} />
    </div>
  );
};
```

## `useCountdown`

```typescript
useCountdown(targetDate: Date, options?: Partial<CountdownOptions>): string
```

Um hook React para criar uma contagem regressiva para uma data alvo. Retorna uma string formatada representando o tempo restante.

**Exemplo:**
```tsx
import { useCountdown } from '@ismael1361/react-use'; // ajuste o caminho

const BasicCountdown = () => {
  // Contagem para 10 minutos a partir de agora
  const target = new Date();
  target.setMinutes(target.getMinutes() + 10);

  const countdown = useCountdown(target);

  return <p>Tempo restante: {countdown}</p>;
};
```

```tsx
// Exemplo com Início Atrasado e Formato Customizado

const DelayedCountdown = () => {
  // A contagem termina em 20 segundos
  const targetTime = new Date(Date.now() + 20000);
  // Mas só começa a contar daqui a 5 segundos
  const startTime = new Date(Date.now() + 5000);

  const formatFn = ({ seconds }) => `Faltam só ${seconds} segundos!`;

  const countdown = useCountdown(targetTime, { startDate: startTime, format: formatFn });

  return <p>A contagem começa em 5s: {countdown}</p>;
};
```

## `useData`

```typescript
useData<T extends object>(initialData: T, context?: string): DataProps<T>
```

Um hook React para gerenciamento de estado com histórico (undo/redo) e compartilhamento de contexto. Ele retorna um objeto de dados reativo que pode ser mutado diretamente, com as alterações sendo salvas automaticamente no histórico.

**Exemplo:**
```tsx
import { useData } from '@ismael1361/react-use'; // Ajuste o caminho do import

const Counter = ({ contextId }) => {
  // Se contextId for fornecido, o estado será compartilhado.
  const { data, undo, redo, canUndo, canRedo } = useData({ count: 0 }, contextId);

  return (
    <div>
      <p>Contador: {data.count}</p>
      <button onClick={() => data.count++}>Incrementar</button>
      <button onClick={undo} disabled={!canUndo}>Desfazer</button>
      <button onClick={redo} disabled={!canRedo}>Refazer</button>
    </div>
  );
};

const App = () => {
  const sharedContext = "my-shared-counter";

  return (
    <div>
      <h1>Contador Compartilhado</h1>
      <p>Ambos os contadores abaixo compartilham o mesmo estado.</p>
      <Counter contextId={sharedContext} />
      <Counter contextId={sharedContext} />
    </div>
  );
}
```

## `useDataStorager`

```typescript
useDataStorager<T>(key: PropertyKey, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>]
```

Um hook customizado do React que gerencia um estado em um armazenamento de dados global na memória. Ele se comporta como o `useState`, mas o valor é compartilhado entre todos os componentes que usam a mesma `key`. O estado não é persistente e será perdido ao recarregar a página.

Este hook é uma abstração sobre o `useCache`, fornecendo uma API idêntica para compartilhar estado entre componentes distantes na árvore de componentes sem recorrer a prop drilling ou contextos complexos, quando a persistência não é necessária.

**Exemplo:**
```tsx
import { useDataStorager } from "@ismael1361/react-use";

// Componente que exibe e atualiza um nome de usuário
function UserProfileEditor() {
  const [username, setUsername] = useDataStorager('currentUser', 'Guest');

  return (
    <div>
      <p>Editando usuário: {username}</p>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
    </div>
  );
}

// Outro componente que apenas exibe o nome de usuário
function Header() {
  const [username] = useDataStorager('currentUser', 'Guest');
  return <header>Bem-vindo, {username}!</header>;
}
```

## `useDebouncedCallback`

```typescript
useDebouncedCallback<T>(callback: T, delay: number): T
```

Cria uma versão "debounced" de um callback que atrasa sua execução até que um determinado tempo (`delay`) tenha passado sem que a função seja chamada novamente.

Este hook é útil para otimizar o desempenho em cenários onde uma função é chamada com muita frequência, como em eventos de `onChange` de inputs, redimensionamento de janela ou rolagem de página. Ele garante que a lógica custosa (ex: uma chamada de API) só seja executada quando o usuário "pausa".

Utiliza `useCallbackRef` internamente para garantir que a versão mais recente do `callback` seja sempre usada, sem quebrar a memoização da função retornada.

**Exemplo:**
```tsx
import React, { useState } from 'react';
import { useDebouncedCallback } from '@ismael1361/react-use';

const SearchComponent = () => {
  const [inputValue, setInputValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // A função debounced só será chamada 500ms após o usuário parar de digitar.
  const debouncedSetSearchTerm = useDebouncedCallback((value) => {
    console.log(`Buscando por: ${value}`);
    setSearchTerm(value);
  }, 500);

  const handleChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    debouncedSetSearchTerm(value);
  };

  return (
    <div>
      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        placeholder="Digite para buscar..."
      />
      <p>Termo de busca atual: {searchTerm}</p>
    </div>
  );
};
```

## `useDebouncedEffect`

```typescript
useDebouncedEffect(effect: React.EffectCallback, delay: number, deps?: React.DependencyList): void
```

Executa um "effect" após um "debounce" de um determinado tempo. É semelhante ao `useEffect`, mas a função de "effect" só é chamada depois que as dependências (`deps`) param de mudar por um período de tempo especificado (`delay`).

Este hook é ideal para cenários onde você precisa executar uma operação (como uma chamada de API) em resposta a mudanças rápidas de estado ou props, mas quer esperar até que o usuário tenha "terminado" de fazer as alterações.

**Exemplo:**
```tsx
import React, { useState } from 'react';
import { useDebouncedEffect } from '@ismael1361/react-use';

const SearchComponent = () => {
  const [inputValue, setInputValue] = useState('');
  const [apiQuery, setApiQuery] = useState('');

  // O efeito será acionado 500ms depois que o usuário parar de digitar.
  useDebouncedEffect(() => {
    if (inputValue) {
      console.log(`Fazendo chamada de API para: "${inputValue}"`);
      setApiQuery(inputValue);
    }
  }, 500, [inputValue]);

  return (
    <div>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Digite para buscar..."
      />
      <p>Buscando por: {apiQuery}</p>
    </div>
  );
};
```

## `useEventEmitter`

```typescript
useEventEmitter<T extends any[]>(name: string, callback?: EventCallback<T> | undefined, deps?: React.DependencyList): (...args: T) => void
```

Cria um sistema de eventos que permite a comunicação entre componentes React de forma desacoplada. Um componente pode 'ouvir' um evento e outro componente pode 'emitir' esse evento, passando dados entre eles sem a necessidade de prop drilling ou context.

**Exemplo:**
```tsx
import React, { useState } from 'react';
import { useEventEmitter } from '@ismael1361/react-use';

// Componente que ouve o evento e exibe uma notificação
const Notifier = () => {
  const [message, setMessage] = useState('');

  useEventEmitter<[string]>('show-notification', (newMessage) => {
    setMessage(newMessage);

    // Retorna um destrutor para limpar a mensagem após 3 segundos
    const timer = setTimeout(() => setMessage(''), 3000);
    return () => clearTimeout(timer);
  });

  if (!message) return null;

  return (
    <div style={{ position: 'fixed', top: 20, right: 20, background: 'lightgreen', padding: '10px' }}>
      {message}
    </div>
  );
};

// Componente que emite o evento
const Trigger = () => {
  const emitNotification = useEventEmitter<[string]>('show-notification');

  return (
    <button onClick={() => emitNotification('Evento disparado com sucesso!')}>
      Mostrar Notificação
    </button>
  );
};
```

## `useEventListener`

```typescript
useEventListener<E, T>(event: E, listener: EventListener<T, E>): MutableRefObject<T>
```

Anexa um ouvinte de eventos a um elemento do DOM, `document` ou `window` de forma declarativa e segura em componentes React.

Este hook garante que o ouvinte de eventos seja sempre a versão mais recente da função de callback, sem a necessidade de remover e readicionar o ouvinte a cada renderização, graças ao uso interno de `useCallbackRef`.

**Exemplo:**
```tsx
import React, { useState, useRef } from 'react';
import { useEventListener } from '@ismael1361/react-use';

const EventListenerComponent = () => {
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [clickCount, setClickCount] = useState(0);
  const divRef = useRef<HTMLDivElement>(null);

  // Exemplo 1: Ouvindo o evento 'click' na window.
  useEventListener('click', () => {
    setClickCount((count) => count + 1);
  });

  // Exemplo 2: Ouvindo o evento 'mousemove' em uma div específica.
  const divRef = useEventListener<'mousemove', HTMLDivElement>(
    'mousemove',
    (event) => {
      setCoords({ x: event.clientX, y: event.clientY });
    }
  );

  return (
    <div>
      <p>Cliques na janela: {clickCount}</p>
      <div
        ref={divRef}
        style={{
          width: '300px',
          height: '200px',
          border: '1px solid black',
          backgroundColor: '#f0f0f0',
          marginTop: '10px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <p>Passe o mouse aqui!</p>
        <p>Coordenadas: X: {coords.x}, Y: {coords.y}</p>
      </div>
    </div>
  );
};
```

## `useHistory`

```typescript
useHistory(): HistoryProps
```

Um hook React que fornece uma interface reativa para o objeto de histórico do navegador. Ele permite que os componentes acessem e manipulem facilmente a URL, o estado e os parâmetros de consulta. O hook garante que o componente seja re-renderizado sempre que a localização do histórico mudar.

**Exemplo:**
```tsx
import React from 'react';
import { useHistory, history } from '@ismael1361/react-use'; // Supondo que o hook esteja neste pacote
// Para que o roteamento funcione, o componente principal da aplicação
// deve usar um Router que utilize a instância de 'history' exportada.
// Exemplo com React Router v5:
// import { Router } from 'react-router-dom';
//
// const App = () => (
//   <Router history={history}>
//     <NavigationComponent />
//   </Router>
// );

const NavigationComponent = () => {
  const { push, replace, back, pathname, query, pathinfo } = useHistory();

  const goToUserPage = () => {
    // Navega para uma nova página, passando estado
    push('/users/123', { from: 'home' });
  };

  const addQueryParam = () => {
    // Substitui a entrada atual, adicionando um parâmetro de consulta
    replace(`${pathname}?sort=asc`);
  };

  return (
    <div>
      <p>Caminho Atual: {pathname}</p>
      <p>Query Params & State: {JSON.stringify(query)}</p>
      <button onClick={goToUserPage}>Ir para /users/123</button>
      <button onClick={addQueryParam}>Adicionar '?sort=asc'</button>
      <button onClick={back}>Voltar</button>
    </div>
  );
};
```

## `useId`

```typescript
useId(): string
```

Gera um ID único e estável que persiste durante o ciclo de vida do componente.

Este hook garante que o ID seja gerado apenas uma vez, na montagem do componente, e permaneça o mesmo em renderizações subsequentes. É ideal para gerar identificadores para elementos DOM (como em `id` e `htmlFor`), chaves de lista não baseadas em dados, ou qualquer cenário onde um identificador persistente por componente é necessário.

**Exemplo:**
```tsx
import React from 'react';
import { useId } from '@ismael1361/react-use';

const FormField = () => {
  const inputId = useId(); // ex: "a1b2c3d4e5f64a7b8c9d0e1f2a3b4c5d"

  // 'inputId' será o mesmo em todas as renderizações deste componente.

  return (
    <div>
      <label htmlFor={inputId}>Nome de usuário:</label>
      <input id={inputId} type="text" name="username" />
    </div>
  );
};
```

## `useLocalStorage`

```typescript
useLocalStorage<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>]
```

Um hook customizado do React que persiste o estado no `localStorage` do navegador. Ele se comporta como o `useState`, mas o valor é automaticamente salvo no `localStorage` sempre que muda e é recuperado na montagem do componente.

**Exemplo:**
```tsx
import { useLocalStorage } from "@ismael1361/react-use";

function UserSettings() {
  const [name, setName] = useLocalStorage('userName', 'Visitante');

  return (
    <div>
      <h1>Olá, {name}!</h1>
      <input
        type="text"
        placeholder="Digite seu nome"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <p>Este nome será lembrado na próxima vez que você visitar.</p>
    </div>
  );
}
```

## `useMediaQuery`

```typescript
useMediaQuery(query: string, effect: EffectCallback, deps?: DependencyList): void
```

Executa um efeito colateral em resposta a uma media query do CSS, de forma reativa. O hook observa a media query e executa o callback `effect` sempre que o estado de correspondência (match) muda, além de na montagem inicial do componente.

É útil para aplicar lógica ou efeitos secundários que dependem do tamanho da tela, orientação ou outras características do dispositivo, sem precisar gerenciar o estado em um `useState`.

**Exemplo:**
```tsx
import React, { useState } from 'react';
import { useMediaQuery } from '@ismael1361/react-use';

const MediaQueryEffectComponent = () => {
  const [deviceType, setDeviceType] = useState('desktop');

  // Efeito para telas de mobile (até 768px)
  useMediaQuery('(max-width: 768px)', (matches) => {
    const newDeviceType = matches ? 'mobile' : 'desktop';
    setDeviceType(newDeviceType);
    console.log(`Layout alterado para: ${newDeviceType}`);

    // Função de limpeza opcional
    return () => console.log(`Limpando efeito para ${newDeviceType}`);
  });

  return (
    <div>
      <h1>O dispositivo atual é: {deviceType}</h1>
      <p>Redimensione a janela para ver o efeito no console.</p>
    </div>
  );
};
```

## `usePromise`

```typescript
usePromise<T>(callback: () => Promise<T>, deps?: React.DependencyList, loading?: boolean): [result: T | undefined, state: "pending" | "rejected" | "fulfilled", error: any]
```

Um hook React para gerenciar operações assíncronas (Promises) de forma declarativa. Ele executa uma função que retorna uma Promise e fornece o estado atual da operação (pendente, resolvida ou rejeitada), o resultado ou o erro.

A Promise é re-executada sempre que as dependências (`deps`) mudam.

**Exemplo:**
```tsx
import React, { useState } from 'react';
import { usePromise } from '@ismael1361/react-use';

const fetchUserData = async (userId: number) => {
  const response = await fetch(`https://jsonplaceholder.typicode.com/users/${userId}`);
  if (!response.ok) {
    throw new Error('Falha ao buscar usuário');
  }
  return response.json();
};

const UserProfile = ({ userId }) => {
  const [result, state, error] = usePromise(() => fetchUserData(userId), [userId]);

  if (state === 'pending') {
    return <div>Carregando perfil...</div>;
  }

  if (state === 'rejected') {
    return <div>Erro: {error.message}</div>;
  }

  return (
    <div>
      <h1>{result.name}</h1>
      <p>Email: {result.email}</p>
      <p>Telefone: {result.phone}</p>
    </div>
  );
};
```

## `useRefObserver`

```typescript
useRefObserver<T>(initialValue: T, effect: EffectCallback<T>, deps?: React.DependencyList): MutableRefObject<T>
```

Cria um objeto de referência (ref) que executa um efeito colateral sempre que seu valor `.current` é modificado.

Este hook é uma combinação de `useRef` e `useEffect`, permitindo reagir a mudanças em um valor sem causar re-renderizações no componente. O efeito também é executado na montagem inicial e sempre que as dependências (`deps`) mudam.

**Exemplo:**
```tsx
import React, { useState } from 'react';
import { useRefObserver } from '@ismael1361/react-use';

const LoggerComponent = () => {
  const [inputValue, setInputValue] = useState('');

  // Cria um observador para o valor do input.
  // O efeito será logar o novo valor no console.
  const observedValueRef = useRefObserver<string>('', (value) => {
    console.log(`O valor observado agora é: "${value}"`);

    // Retorna uma função de limpeza que é chamada antes do próximo efeito.
    return () => {
      console.log(`Limpando efeito para o valor anterior.`);
    };
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    // Atribuir a .current aciona o efeito do useRefObserver.
    observedValueRef.current = newValue;
  };

  return (
    <div>
      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        placeholder="Digite algo para observar..."
      />
      <p>Verifique o console enquanto digita.</p>
    </div>
  );
};
```

## `useSizeEffect`

```typescript
useSizeEffect<T>(callback: SizeEffect<T>, deps?: React.DependencyList): React.MutableRefObject<T | null>
```

Observa as mudanças de tamanho de um elemento do DOM e executa um callback sempre que suas dimensões mudam. Utiliza a `ResizeObserver` API para uma monitoração de performance.

O callback é executado na montagem inicial e sempre que o tamanho do elemento observado é alterado.

**Exemplo:**
```tsx
import React, { useState } from 'react';
import { useSizeEffect } from '@ismael1361/react-use';

const ResizableComponent = () => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const elementRef = useSizeEffect<HTMLDivElement>((size) => {
    console.log('O tamanho mudou:', size);
    setDimensions(size);
  });

  return (
    <div
      ref={elementRef}
      style={{
        border: '2px solid steelblue',
        padding: '20px',
        resize: 'both', // Permite que o usuário redimensione o div
        overflow: 'auto',
      }}
    >
      <p>Redimensione esta caixa!</p>
      <p>Largura: {Math.round(dimensions.width)}px</p>
      <p>Altura: {Math.round(dimensions.height)}px</p>
    </div>
  );
};
```

## `useSubscribeEvent`

```typescript
useSubscribeEvent<E, K>(scope: SubscribeEvent<E>, event: K, callback: SubscribeEventCallback<E[K]>, isOnce?: boolean): EmitEvent<E[K]>
```

Assina um componente a um evento de um "event bus" e retorna uma função para emitir esse mesmo evento.

Este hook gerencia o ciclo de vida da inscrição, garantindo que o callback seja assinado quando o componente é montado e removido quando é desmontado. O callback fornecido é sempre a versão mais recente, evitando problemas com closures obsoletas.

**Exemplo:**
```tsx
// 1. Crie o event bus em um arquivo compartilhado (ex: src/events.ts)
import { createSubscribeEvent } from '@ismael1361/react-use';
export const appEvents = createSubscribeEvent<{
  'toggle-sidebar': [];
}>();

// 2. Em um componente, ouça o evento para alterar seu estado.
// src/components/Sidebar.tsx
import React, { useState } from 'react';
import { useSubscribeEvent } from '@ismael1361/react-use';
import { appEvents } from '../events';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Ouve o evento 'toggle-sidebar' e atualiza o estado.
  useSubscribeEvent(appEvents, 'toggle-sidebar', () => {
    setIsOpen(prev => !prev);
  });

  return <aside className={isOpen ? 'open' : 'closed'}>Sidebar</aside>;
};

// 3. Em outro componente, use o hook para obter a função de emissão.
// src/components/Header.tsx
import React from 'react';
import { useSubscribeEvent } from '@ismael1361/react-use';
import { appEvents } from '../events';

const Header = () => {
  // Passa um callback vazio para apenas obter a função de emissão.
  const emitToggle = useSubscribeEvent(appEvents, 'toggle-sidebar', () => {});

  return <button onClick={emitToggle}>Toggle Sidebar</button>;
};
```

## `useToggle`

```typescript
useToggle(initialState?: boolean): [state: boolean, toggle: () => void, setTrue: () => void, setFalse: () => void]
```

Um hook customizado do React para gerenciar um estado booleano (toggle).

Fornece o estado atual e funções para alternar o estado (`toggle`), defini-lo explicitamente como `true` (`setTrue`) ou `false` (`setFalse`).

**Exemplo:**
```tsx
import { useToggle } from "@ismael1361/react-use";

function ToggleComponent() {
  const [isVisible, toggleVisibility, show, hide] = useToggle(false);

  return (
    <div>
      <button onClick={toggleVisibility}>{isVisible ? 'Esconder' : 'Mostrar'}</button>
      <button onClick={show}>Forçar Mostrar</button>
      <button onClick={hide}>Forçar Esconder</button>
      {isVisible && <p>Agora você me vê!</p>}
    </div>
  );
}
```

## `useSharedValue`

```typescript
useSharedValue<T>(initialValue: T): SharedValue<T>
```

Cria e gerencia uma instância de `SharedValue` de forma reativa dentro de um componente React.

Este hook encapsula um valor inicial em uma instância de `SharedValue`. Ele se inscreve no evento 'change' do `SharedValue` e força uma nova renderização do componente sempre que o valor é alterado, tornando-o "reativo" no ecossistema React.

É ideal para valores que precisam ser compartilhados entre diferentes lógicas (como animações) e a UI do React, garantindo que a interface sempre reflita o estado atual do valor.

**Exemplo:**
```tsx
import React from 'react';
import { useSharedValue } from '@ismael1361/react-use';

const FadingComponent = () => {
  // Cria um valor reativo para a opacidade.
  const opacity = useSharedValue(1);

  const toggleVisibility = () => {
    // Modificar o valor. Isso irá disparar o evento 'change'
    // e causar uma nova renderização do componente.
    opacity.value = opacity.value === 1 ? 0 : 1;
  };

  return (
    <div>
      <div style={{ opacity: opacity.value, transition: 'opacity 0.5s' }}>
        Olá, Mundo!
      </div>
      <button onClick={toggleVisibility}>Toggle Visibilidade</button>
    </div>
  );
};
```

## `useSharedValues`

```typescript
useSharedValues<S extends AnimationState>(initialValues: S): { [K in keyof S]: SharedValue<S[K]>; }
```

Cria e gerencia um objeto de valores compartilhados (`SharedValue`) de forma reativa dentro de um componente React.

Este hook pega um objeto de estado inicial e cria um `SharedValue` para cada uma de suas propriedades, agrupando-os sob uma instância de `SharedValues`. Ele se inscreve no evento `change` dessa instância e força uma nova renderização do componente sempre que qualquer um dos valores é alterado. Isso torna os valores compartilhados "reativos" no ecossistema React.

**Exemplo:**
```tsx
import React from 'react';
import { useSharedValues } from '@ismael1361/react-use';

const MyComponent = () => {
  // Cria um estado reativo para a posição e opacidade.
  // O retorno é um objeto com as instâncias de SharedValue.
  const styleState = useSharedValues({ x: 0, opacity: 1 });

  const handleAnimate = () => {
    // Modificar os valores individuais.
    // Isso irá disparar o evento 'change' e causar uma nova renderização.
    styleState.x.value = 100;
    styleState.opacity.value = 0.5;
  };

  return (
    <div>
      <div
        style={{
          // Acessa o valor atual de cada SharedValue para a renderização.
          transform: `translateX(${styleState.x.value}px)`,
          opacity: styleState.opacity.value,
          width: 50,
          height: 50,
          backgroundColor: 'tomato',
          transition: 'transform 0.5s, opacity 0.5s'
        }}
      />
      <button onClick={handleAnimate}>Animate</button>
    </div>
  );
};
```

## `useAnimation`

```typescript
useAnimation<S extends AnimationState>(animation: AnimationFn<S>, state?: S, deps?: React.DependencyList): AnimationProps<S>
```

Um hook do React para criar e gerenciar animações complexas de forma declarativa.

Este hook integra a biblioteca `@ismael1361/animation` ao ciclo de vida de um componente React, permitindo a criação de animações baseadas em geradores que podem ser controladas facilmente. Ele gerencia o estado da animação, garante que o componente seja re-renderizado quando os valores da animação mudam e lida com a limpeza de recursos.

**Exemplo:**
```typescript
import React from 'react';
import { useAnimation } from '@ismael1361/react-use';

const FadingBox = () => {
  const animation = useAnimation(
    function* (state) {
      // Anima a opacidade de 0 a 1 e de volta para 0, em um loop infinito.
      yield* this.loop(() =>
        this.sequence(500,
          () => this.timing(state.opacity, { to: 1, duration: 1000 }),
          () => this.timing(state.opacity, { to: 0, duration: 1000 })
        )
      );
    },
    { opacity: 0 } // Estado inicial
  );

  const style = {
    width: 100,
    height: 100,
    backgroundColor: 'tomato',
    // Acessa o valor atual da animação para aplicar ao estilo
    opacity: animation.state.opacity.value,
  };

  return <div style={style} />;
};
```

### `timeSincePreviousFrame`

```typescript
timeSincePreviousFrame(): InputGenerator<number>
```

Obtém o tempo decorrido (em milissegundos) desde o quadro de animação anterior. Usado dentro de um gerador de animação para controlar o fluxo de tempo.

**Exemplo:**
```typescript
const deltaTime = yield* this.timeSincePreviousFrame();
console.log(`O último quadro demorou ${deltaTime}ms para renderizar.`);
```

### `timing`

```typescript
timing(value: SharedValue<number> | TimingCallback, config?: TimingConfig): InputGenerator
```

Anima propriedade de um `SharedValue<number>` ou executa uma função de retorno de chamada com o valor animado.

**Exemplo:**
```typescript
// Usando SharedValue diretamente
yield* this.timing(state.opacity, { to: 1, duration: 500 });

// Usando uma função de retorno de chamada
yield* this.timing((val) => {
  console.log(`Current value: ${val}`);
  state.opacity.value = val;
  return val > 0.8; // Cancela a animação quando o valor ultrapassar 0.8
}, { to: 1, duration: 1000 });
```

### `wait`

```typescript
wait(duration?: number | undefined): InputGenerator
```

Pausa a execução da animação por uma determinada duração.

**Exemplo:**
```typescript
console.log("Início da pausa.");
yield* this.wait(1000); // Espera por 1 segundo.
console.log("Fim da pausa.");
```

### `waitUntil`

```typescript
waitUntil(value: SharedValue<boolean>, invert?: boolean): InputGenerator
```

Pausa a execução da animação até que uma condição em um `SharedValue<boolean>` seja atendida.

**Exemplo:**
```typescript
// Espera até state.isReady.value se tornar true
yield* this.waitUntil(state.isReady);
console.log("A condição foi atendida!");

// Exemplo com 'invert'
// Espera até state.isVisible.value se tornar false
yield* this.waitUntil(state.isVisible, true);
console.log("O elemento não está mais visível.");
```

### `delay`

```typescript
delay(duration?: number | undefined, animation?: Input | undefined): InputGenerator
```

Cria uma pausa e, opcionalmente, executa outra animação em seguida. É um atalho para combinar `wait` com outra animação.

**Exemplo:**
```typescript
// Apenas espera por 500ms
yield* this.delay(500);

// Espera 1 segundo e depois inicia uma animação de opacidade.
yield* this.delay(1000, () => this.timing(state.opacity, { to: 1 }));
```

### `parallel`

```typescript
parallel(...inputs: Input[]): InputGenerator
```

Executa múltiplas animações (geradores) em paralelo. A execução termina quando todas as animações filhas tiverem sido concluídas.

**Exemplo:**
```typescript
yield* this.parallel(
  () => this.timing(state.opacity, { to: 1, duration: 1000 }),
  () => this.timing(state.scale, { to: 1, duration: 1000 })
);
// Ambas as animações de opacidade e escala ocorrerão simultaneamente.
```

### `all`

```typescript
all(...inputs: Input[]): InputGenerator
```

Um alias para `parallel`. Executa múltiplas animações em paralelo. A execução termina quando todas as animações filhas tiverem sido concluídas.

**Exemplo:**
```typescript
yield* this.all(
  () => this.timing(state.opacity, { to: 1, duration: 1000 }),
  () => this.timing(state.scale, { to: 1, duration: 1000 })
);
// Ambas as animações de opacidade e escala ocorrerão simultaneamente.
```

### `any`

```typescript
any(...inputs: Input[]): InputGenerator
```

Executa múltiplas animações (geradores) em paralelo e termina assim que a primeira delas for concluída. As outras animações são interrompidas.

**Exemplo:**
```typescript
yield* this.any(
  () => this.timing(state.opacity, { to: 1, duration: 1000 }),
  () => this.timing(state.scale, { to: 1, duration: 1000 })
);
// Uma das animações de opacidade ou escala ocorrerão primeiro.
```

### `chain`

```typescript
chain(...inputs: Input[]): InputGenerator
```

Executa múltiplas animações (geradores) em sequência, uma após a outra.

**Exemplo:**
```typescript
yield* this.chain(
  () => this.timing(state.opacity, { to: 1, duration: 1000 }),
  () => this.timing(state.scale, { to: 1, duration: 1000 })
);
// As animações de opacidade e escala ocorrerão em sequência.
```

### `stagger`

```typescript
stagger(delayMs: number, ...inputs: Input[]): InputGenerator
```

Executa múltiplas animações em paralelo, mas com um atraso escalonado entre o início de cada uma.

**Exemplo:**
```typescript
yield* this.stagger(
  100,
  () => this.timing(state.opacity, { to: 1, duration: 1000 }),
  () => this.timing(state.scale, { to: 1, duration: 1000 })
);
// As animações de opacidade e escala ocorrerão em paralelo, mas com um atraso de 100ms entre elas.
```

### `sequence`

```typescript
sequence(delayMs: number, ...inputs: Input[]): InputGenerator
```

Executa múltiplas animações em sequência, com um atraso definido entre o fim de uma e o início da próxima.

**Exemplo:**
```typescript
yield* this.sequence(
  100,
  () => this.timing(state.opacity, { to: 1, duration: 1000 }),
  () => this.timing(state.scale, { to: 1, duration: 1000 })
);
// As animações de opacidade e escala ocorrerão em sequência, com um atraso de 100ms entre elas.
```

### `loop`

```typescript
loop(factory: LoopCallback): InputGenerator
loop(iterations: number, factory: LoopCallback): InputGenerator
```

Executa uma animação (gerador) repetidamente.

**Exemplo:**
```typescript
// Gira um elemento 3 vezes
yield* this.loop(3, () => this.timing(state.rotation, { to: 360, duration: 1000 }));

// Anima a opacidade para cima e para baixo infinitamente
yield* this.loop(() => this.chain(
  () => this.timing(state.opacity, { to: 1, duration: 500 }),
  () => this.timing(state.opacity, { to: 0, duration: 500 })
));
```

### Easing

#### `Easing.linear`

```typescript
Easing.linear(t: number): number
```

Função linear, `f(t) = t`. A posição se correlaciona um-para-um com o tempo decorrido.

**Exemplo:**
```typescript
yield* this.timing(state.opacity, { to: 1, duration: 1000, easing: this.Easing.linear });
```

#### `Easing.ease`

```typescript
Easing.ease(t: number): number
```

Uma interação inercial simples, semelhante a um objeto acelerando lentamente.

**Exemplo:**
```typescript
yield* this.timing(state.opacity, { to: 1, duration: 1000, easing: this.Easing.ease });
```

#### `Easing.quad`

```typescript
Easing.quad(t: number): number
```

Função quadrática, `f(t) = t * t`. A posição é igual ao quadrado do tempo decorrido.

**Exemplo:**
```typescript
yield* this.timing(state.opacity, { to: 1, duration: 1000, easing: this.Easing.quad });
```

#### `Easing.cubic`

```typescript
Easing.cubic(t: number): number
```

Função cúbica, `f(t) = t * t * t`. A posição é igual ao cubo do tempo decorrido.

**Exemplo:**
```typescript
yield* this.timing(state.opacity, { to: 1, duration: 1000, easing: this.Easing.cubic });
```

#### `Easing.poly`

```typescript
Easing.poly(n: number): EasingFunction
```

Cria uma função de potência. A posição é igual à N-ésima potência do tempo decorrido.

**Exemplo:**
```typescript
yield* this.timing(state.opacity, { to: 1, duration: 1000, easing: this.Easing.poly(3) });
```

#### `Easing.sin`

```typescript
Easing.sin(t: number): number
```

Função sinusoidal.

**Exemplo:**
```typescript
yield* this.timing(state.opacity, { to: 1, duration: 1000, easing: this.Easing.sin });
```

#### `Easing.circle`

```typescript
Easing.circle(t: number): number
```

Função circular.

**Exemplo:**
```typescript
yield* this.timing(state.opacity, { to: 1, duration: 1000, easing: this.Easing.circle });
```

#### `Easing.exp`

```typescript
Easing.exp(t: number): number
```

Função exponencial.

**Exemplo:**
```typescript
yield* this.timing(state.opacity, { to: 1, duration: 1000, easing: this.Easing.exp });
```

#### `Easing.elastic`

```typescript
Easing.elastic(bounciness?: number): EasingFunction
```

Cria uma interação elástica simples, como uma mola oscilando. O `bounciness` (elasticidade) padrão é 1. Um valor 0 não ultrapassa o limite, e um valor N > 1 ultrapassará o limite aproximadamente N vezes.

**Exemplo:**
```typescript
yield* this.timing(state.opacity, { to: 1, duration: 1000, easing: this.Easing.elastic(1.5) });
```

#### `Easing.back`

```typescript
Easing.back(s?: number): EasingFunction
```

Cria um efeito onde o objeto recua um pouco antes de avançar.

**Exemplo:**
```typescript
yield* this.timing(state.opacity, { to: 1, duration: 1000, easing: this.Easing.back(2) });
```

#### `Easing.bounce`

```typescript
Easing.bounce(t: number): number
```

Fornece um efeito de "quicar" simples.

**Exemplo:**
```typescript
yield* this.timing(state.opacity, { to: 1, duration: 1000, easing: this.Easing.bounce });
```

#### `Easing.bezier`

```typescript
Easing.bezier(x1: number, y1: number, x2: number, y2: number): { factory: () => EasingFunction; }
```

Cria uma curva de Bézier cúbica, equivalente à `transition-timing-function` do CSS.

**Exemplo:**
```typescript
yield* this.timing(state.opacity, { to: 1, duration: 1000, easing: this.Easing.bezier(0.25, 0.1, 0.25, 1).factory() });
```

#### `Easing.bezierFn`

```typescript
Easing.bezierFn(x1: number, y1: number, x2: number, y2: number): EasingFunction
```

A implementação base para a curva de Bézier cúbica.

**Exemplo:**
```typescript
yield* this.timing(state.opacity, { to: 1, duration: 1000, easing: this.Easing.bezierFn(0.25, 0.1, 0.25, 1) });
```

#### `Easing.in`

```typescript
Easing.in(easing: EasingFunction): EasingFunction
```

Modificador que executa uma função de easing na sua forma original (aceleração no início).

**Exemplo:**
```typescript
yield* this.timing(state.opacity, { to: 1, duration: 1000, easing: this.Easing.in(Easing.sin) });
```

#### `Easing.out`

```typescript
Easing.out(easing: EasingFunction): EasingFunction
```

Modificador que executa uma função de easing de forma invertida (desaceleração no final).

**Exemplo:**
```typescript
yield* this.timing(state.opacity, { to: 1, duration: 1000, easing: this.Easing.out(Easing.sin) });
```

#### `Easing.inOut`

```typescript
Easing.inOut(easing: EasingFunction): EasingFunction
```

Modificador que torna qualquer função de easing simétrica. A função acelera na primeira metade da duração e desacelera na segunda metade.

**Exemplo:**
```typescript
yield* this.timing(state.opacity, { to: 1, duration: 1000, easing: this.Easing.inOut(Easing.sin) });
```

#### `Easing.steps`

```typescript
Easing.steps(n?: number, roundToNextStep?: boolean | undefined): EasingFunction
```

Cria uma função de easing que avança em degraus discretos.

**Exemplo:**
```typescript
yield* this.timing(state.opacity, { to: 1, duration: 1000, easing: this.Easing.steps(5) });
```