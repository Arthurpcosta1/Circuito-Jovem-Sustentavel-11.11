// Sistema de Níveis do Circuito Jovem Sustentável
// Baseado nas Chaves de Impacto acumuladas

export interface LevelInfo {
  nivel: number;
  nome: string;
  minChaves: number;
  maxChaves: number;
  cor: string;
}

export const NIVEIS: LevelInfo[] = [
  { nivel: 1, nome: 'Iniciante', minChaves: 0, maxChaves: 99, cor: 'gray' },
  { nivel: 2, nome: 'Bronze', minChaves: 100, maxChaves: 299, cor: 'orange' },
  { nivel: 3, nome: 'Prata', minChaves: 300, maxChaves: 599, cor: 'gray' },
  { nivel: 4, nome: 'Ouro', minChaves: 600, maxChaves: 999, cor: 'yellow' },
  { nivel: 5, nome: 'Diamante', minChaves: 1000, maxChaves: Infinity, cor: 'cyan' },
];

/**
 * Calcula o nível do usuário baseado nas chaves de impacto
 * @param chaves - Número de chaves de impacto acumuladas
 * @returns Informações do nível correspondente
 */
export function calcularNivel(chaves: number): LevelInfo {
  for (const nivel of NIVEIS) {
    if (chaves >= nivel.minChaves && chaves <= nivel.maxChaves) {
      return nivel;
    }
  }
  // Fallback para o primeiro nível
  return NIVEIS[0];
}

/**
 * Calcula o progresso percentual dentro do nível atual
 * @param chaves - Número de chaves de impacto acumuladas
 * @returns Porcentagem de progresso (0-100)
 */
export function calcularProgresso(chaves: number): number {
  const nivelAtual = calcularNivel(chaves);
  
  // Se for o último nível, sempre 100%
  if (nivelAtual.maxChaves === Infinity) {
    return 100;
  }
  
  const chavesNoNivel = chaves - nivelAtual.minChaves;
  const chavesNecessarias = nivelAtual.maxChaves - nivelAtual.minChaves + 1;
  const progresso = (chavesNoNivel / chavesNecessarias) * 100;
  
  return Math.min(Math.round(progresso), 100);
}

/**
 * Retorna quantas chaves faltam para o próximo nível
 * @param chaves - Número de chaves de impacto acumuladas
 * @returns Número de chaves necessárias ou null se já está no nível máximo
 */
export function chavesParaProximoNivel(chaves: number): number | null {
  const nivelAtual = calcularNivel(chaves);
  
  // Se for o último nível, não há próximo nível
  if (nivelAtual.maxChaves === Infinity) {
    return null;
  }
  
  return nivelAtual.maxChaves + 1 - chaves;
}

/**
 * Retorna o próximo nível ou null se já está no nível máximo
 * @param chaves - Número de chaves de impacto acumuladas
 * @returns Informações do próximo nível ou null
 */
export function proximoNivel(chaves: number): LevelInfo | null {
  const nivelAtual = calcularNivel(chaves);
  const indexAtual = NIVEIS.findIndex(n => n.nivel === nivelAtual.nivel);
  
  if (indexAtual === NIVEIS.length - 1) {
    return null; // Já está no nível máximo
  }
  
  return NIVEIS[indexAtual + 1];
}
