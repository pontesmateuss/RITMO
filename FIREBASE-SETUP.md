# Ritmo — Firebase

## Ativação no seu projeto

1. Adicione um app Web no Firebase e copie seu firebaseConfig.
2. Ative Authentication > Sign-in method > Google e Email/Password.
3. Em Authentication > Settings > Authorized domains, adicione:
   ritmo-estudo-juntos-nov20.wanderingdream.chatgpt.site
   Para desenvolvimento, adicione localhost e 127.0.0.1.
4. Crie o Cloud Firestore em modo de produção, no banco (default).
5. Publique as regras e índices deste repositório:
   firebase deploy --only firestore:rules,firestore:indexes --project SEU_PROJECT_ID
   Revise e mescle as regras caso o projeto já hospede outros apps.
6. Na hospedagem, configure FIREBASE_WEB_CONFIG com o objeto JSON do app web:
   {"apiKey":"...","authDomain":"...firebaseapp.com","projectId":"...","appId":"..."}
   Opcionalmente storageBucket e messagingSenderId.
   Em preview local, copie .dev.vars.example para .dev.vars (não versionado).
7. Publique novamente e teste Google, cadastro por e-mail, redefinição de senha,
   início/conclusão de sessão e gráfico em duas contas diferentes.

O config Web é público. Não use chave privada, credencial Admin ou service account.
O link de redefinição usa a página oficial hospedada pelo Firebase. Personalize o
modelo em Authentication > Templates. Senhas Google são gerenciadas no Google.

## API de monitoramento de estudos

GET /api/monitoring?days=7&timeZone=America%2FSao_Paulo
Authorization: Bearer <Firebase ID token>

days aceita 7 ou 30. O token é obtido com auth.currentUser.getIdToken().
A API verifica assinatura RS256, emissor, projeto, validade e identidade. Consulta
somente sessões do usuário autenticado via REST do Firestore, sujeita às regras.
Retorna totalSeconds, sessions, activeDays, series, subjects, generatedAt,
latencyMs e truncated. Cache desativado. Limite de 5.000 sessões por período;
truncated=true indica total parcial. Não é um serviço de uptime nem histórico
de erros da infraestrutura. O gráfico atualiza a cada minuto.

## Dados e limites

Coleções: ritmoPeople (nome e presença), ritmoActive (sessão em andamento por UID),
ritmoSessions (histórico imutável). Timestamps vêm do servidor. Conclusão atômica
remove a sessão ativa e cria o histórico usando seu identificador, evitando
duplicidade e finalização por outro usuário. Cada sessão contabiliza até 4 horas.
Presença: heartbeat a cada 20s, offline após 65s sem heartbeat. Apps em segundo
plano podem suspender o heartbeat. A comunidade mostra até 100 perfis/sessões
ativas e o painel carrega as 1.000 sessões concluídas mais recentes.
O monitoramento consulta o período do próprio usuário separadamente.

Participantes autenticados podem ler nomes, presença e histórico da comunidade.
E-mail e credenciais não são gravados nas coleções públicas da comunidade.

## Transição

Sem FIREBASE_WEB_CONFIG, o app informa que a configuração está pendente.
O modo anterior (ChatGPT + D1) exige RITMO_LEGACY_MODE=true explicitamente.
Com a variável configurada, a interface utiliza Firebase Auth e Firestore.
Dados antigos não são apagados nem migrados automaticamente: identidades D1 e
Firebase são diferentes. Migrar históricos exige associar explicitamente as contas.
O controle de acesso privado da hospedagem Sites continua valendo: a entrada
Google dentro do app não remove o acesso ChatGPT exigido pela hospedagem.
Para acesso apenas pelo Google, será necessário ajustar a audiência da hospedagem
ou hospedar o app em ambiente apropriado, com autorização do proprietário.

## Verificação

node --test tests/metrics.test.ts
npx tsc --noEmit
npm run build

Regras e integração com provedores devem ser validadas no projeto Firebase antes
de ativar. A máquina de desenvolvimento não possui Java para executar o emulador
Firestore. Nenhuma credencial Firebase foi incluída neste pacote.

## Referências

https://firebase.google.com/docs/auth/web/google-signin
https://firebase.google.com/docs/auth/web/manage-users
https://firebase.google.com/docs/auth/admin/verify-id-tokens
https://firebase.google.com/docs/firestore/use-rest-api

