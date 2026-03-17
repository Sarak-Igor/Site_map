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

        const originalLineTrimmed = line.trim();

        // Inicializamos variáveis de nível e label
        let indentLevel = 0;
        let label = originalLineTrimmed;

        // Expressão Regular para capturar prefixo numérico como "1-", "1.1-", "2.1.1 -" 
        // Opcionalmente com espaços ou pontuações variáveis limitando com traço ou espaço.
        const prefixMatch = originalLineTrimmed.match(/^([\d.]+)\s*-\s*/);

        // Se encontrou prefixo "1.1.2-", o nível é a quantidade de números identificados.
        if (prefixMatch) {
            // "1" = 1 parte (Nível 1). "1.1" = 2 partes (Nível 2).
            const parts = prefixMatch[1].split('.').filter(p => p.length > 0);

            // O nível agora é exatamente a contagem de partes numéricas.
            // Isso deixa o Nível 0 livre para o Título (Site Map).
            indentLevel = parts.length;

            // Remove o prefixo do label visível
            label = originalLineTrimmed.replace(prefixMatch[0], '').trim();
        } else {
            // Fallback para textos sem numeração (ex: "Site Map") -> Nível 0
            // Ou lógica antiga de indentação se houver espaços
            const indentMatch = line.match(/^(\s*)/);
            if (indentMatch && indentMatch[0].length > 0) {
                // Se houver espaços, calculamos nível baseado neles, mas somamos 1 
                // para não colidir com a raiz se o usuário indentar manualmente.
                indentLevel = Math.floor(indentMatch[0].length / 2) + 1;
            } else {
                indentLevel = 0; // Texto puro sem espaços no início = Raiz
            }
            label = line.trim();
        }

        // Extração de Descrição (Mapa de Itens) via Pipe '|'
        const descriptionMatch = label.match(/\|(.*)$/);
        const description = descriptionMatch ? descriptionMatch[1].trim() : null;

        // Extração de Metadados via Regex
        const statusMatch = label.match(/\[(.*?)\]/);
        const timelineMatch = label.match(/\{(.*?)\}/);
        const progressMatch = label.match(/\((.*?)\)/);

        const status = statusMatch ? statusMatch[1] : null;
        const timeline = timelineMatch ? timelineMatch[1] : null;
        let progress = progressMatch ? progressMatch[1] : null;

        // Fallback: Extração de Progresso do Próprio Label (Ex: "Progresso: 80%")
        if (!progress) {
            const labelProgressMatch = label.match(/Progresso:\s*(\d+)%/i);
            if (labelProgressMatch) {
                progress = labelProgressMatch[1];
            }
        }

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
