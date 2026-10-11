import { useMemo } from "react";
import { uuidv4 } from "@ismael1361/utils";

/**
 * Gera um ID único e estável que persiste durante o ciclo de vida do componente.
 *
 * Este hook garante que o ID seja gerado apenas uma vez, na montagem do componente,
 * e permaneça o mesmo em renderizações subsequentes. É ideal para gerar
 * identificadores para elementos DOM (como em `id` e `htmlFor`), chaves de lista
 * não baseadas em dados, ou qualquer cenário onde um identificador persistente
 * por componente é necessário.
 *
 * @returns {string} Uma string de ID única e estável.
 *
 * @example
 * ```tsx
 * import React from 'react';
 * import { useId } from '@ismael1361/react-use';
 *
 * const FormField = () => {
 *   const inputId = useId(); // ex: "a1b2c3d4e5f64a7b8c9d0e1f2a3b4c5d"
 *
 *   // 'inputId' será o mesmo em todas as renderizações deste componente.
 *
 *   return (
 *     <div>
 *       <label htmlFor={inputId}>Nome de usuário:</label>
 *       <input id={inputId} type="text" name="username" />
 *     </div>
 *   );
 * };
 * ```
 */
export const useId = (): string => {
	return useMemo(() => uuidv4(""), []);
};
