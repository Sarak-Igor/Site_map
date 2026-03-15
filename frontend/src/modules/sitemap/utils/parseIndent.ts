/**
 * Converte um texto aninhado em uma lista de objetos Flat.
 *
 * Exemplo de Entrada:
 * Home
 *   Dashboard
 *   Financeiro
 *     Relatorios
 * Logout
 * 
 * Exemplo de Saída:
 * [
 *   { id: "1", label: "Home", parent_id: null },
 *   { id: "2", label: "Dashboard", parent_id: "1" },
 *   { id: "3", label: "Financeiro", parent_id: "1" },
 *   { id: "4", label: "Relatorios", parent_id: "3" },
 *   { id: "5", label: "Logout", parent_id: null }
 * ]
 */
export const parseIndentedText = (text: string) => {
    const lines = text.split('\n');
    const items = [];
    const indentStack = []; // Vai guardar { level: number, id: string }
    let idCounter = 1;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.trim() === '') continue; // Pular linhas em branco

        // Conta quantos espaços existem no começo da linha
        const indentMatch = line.match(/^(\s*)/);
        const indentLevel = indentMatch ? indentMatch[0].length : 0;
        const label = line.trim();

        // Extração de Descrição (Mapa de Itens) via Pipe '|'
        const descriptionMatch = label.match(/\|(.*)$/);
        const description = descriptionMatch ? descriptionMatch[1].trim() : null;

        // Extração de Metadados via Regex
        const statusMatch = label.match(/\[(.*?)\]/);
        const timelineMatch = label.match(/\{(.*?)\}/);
        const progressMatch = label.match(/\((.*?)\)/);

        const status = statusMatch ? statusMatch[1] : null;
        const timeline = timelineMatch ? timelineMatch[1] : null;
        const progress = progressMatch ? progressMatch[1] : null;

        // Limpa o Label original removendo os marcadores de metadados e a descrição
        let cleanLabel = label
            .replace(/\|.*$/, '')
            .replace(/\[.*?\]/, '')
            .replace(/\{.*?\}/, '')
            .replace(/\(.*?\)/, '')
            .trim();

        const currentId = idCounter.toString();
        idCounter++;

        // Limpa a pilha para encontrar quem é o parente correto
        while (indentStack.length > 0 && indentStack[indentStack.length - 1].level >= indentLevel) {
            indentStack.pop();
        }

        let parent_id = null;
        if (indentStack.length > 0) {
            parent_id = indentStack[indentStack.length - 1].id;
        }

        items.push({
            id: currentId,
            label: cleanLabel,
            parent_id: parent_id,
            status: status,
            timeline: timeline,
            progress: progress,
            description: description
        });

        // Adiciona este item na pilha pro proximo loop
        indentStack.push({ level: indentLevel, id: currentId });
    }

    return items;
};
