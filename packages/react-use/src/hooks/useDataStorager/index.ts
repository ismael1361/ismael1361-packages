import { useCache } from "../useCache";

/**
 * Um hook customizado do React que gerencia um estado em um armazenamento de dados global na memória.
 * Ele se comporta como o `useState`, mas o valor é compartilhado entre todos os componentes
 * que usam a mesma `key`. O estado não é persistente e será perdido ao recarregar a página.
 *
 * Este hook é uma abstração sobre o `useCache`, fornecendo uma API idêntica para
 * compartilhar estado entre componentes distantes na árvore de componentes sem
 * recorrer a prop drilling ou contextos complexos, quando a persistência não é necessária.
 *
 * @template T O tipo do valor a ser armazenado.
 * @param {PropertyKey} key A chave única sob a qual o valor é armazenado.
 * @param {T} initialValue O valor inicial a ser usado se nenhum valor for encontrado para a chave fornecida.
 * @returns {[T, (value: T | ((val: T) => T)) => void]} Uma tupla contendo o valor armazenado e uma função para atualizá-lo, espelhando a API do `useState`.
 *
 * @example
 * ```jsx
 * import { useDataStorager } from "@ismael1361/react-use";
 *
 * // Componente que exibe e atualiza um nome de usuário
 * function UserProfileEditor() {
 *   const [username, setUsername] = useDataStorager('currentUser', 'Guest');
 *
 *   return (
 *     <div>
 *       <p>Editando usuário: {username}</p>
 *       <input
 *         type="text"
 *         value={username}
 *         onChange={(e) => setUsername(e.target.value)}
 *       />
 *     </div>
 *   );
 * }
 *
 * // Outro componente que apenas exibe o nome de usuário
 * function Header() {
 *   const [username] = useDataStorager('currentUser', 'Guest');
 *   return <header>Bem-vindo, {username}!</header>;
 * }
 * ```
 */
export const useDataStorager = <T>(key: PropertyKey, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
	const [value, setValue] = useCache<T>(`__DataStorage__${key.toString()}__`, initialValue);
	return [value, setValue];
};
