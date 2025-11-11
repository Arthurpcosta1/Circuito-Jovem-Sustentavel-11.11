import { projectId, publicAnonKey } from './supabase/info';

export async function initializeSeedData() {
  try {
    // Verificar se já existem dados
    const checkResponse = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-7af4432d/instituicoes`,
      {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      }
    );

    if (checkResponse.ok) {
      const data = await checkResponse.json();
      
      // Se já existem dados, não fazer nada
      if (data && data.length > 0) {
        console.log('Dados já inicializados');
        return true;
      }
    }

    // Inicializar dados de teste
    console.log('Inicializando dados de teste...');
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-7af4432d/seed-data`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      }
    );

    if (response.ok) {
      console.log('Dados de teste inicializados com sucesso!');
      return true;
    } else {
      console.error('Erro ao inicializar dados de teste');
      return false;
    }
  } catch (error) {
    console.error('Erro ao verificar/inicializar dados:', error);
    return false;
  }
}
