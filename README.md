# Ritmo

App de estudo minimalista com presença online, sessões de foco, histórico
individual e gráficos de progresso.

## Executar localmente

Requisitos: Node.js 24 ou mais recente e npm.

1. Instale as dependências: npm ci
2. Copie .dev.vars.example para .dev.vars.
3. Preencha FIREBASE_WEB_CONFIG com o firebaseConfig do seu app Web no Firebase.
4. Habilite os provedores Google e E-mail/Senha, publique as regras e os índices
   conforme FIREBASE-SETUP.md.
5. Execute npm run dev e abra o endereço exibido no terminal.

O SDK Web não precisa de chave privada de conta de serviço.

## Recursos

- Firebase Authentication: Google, e-mail/senha e redefinição por e-mail.
- Cloud Firestore: presença, sessão em andamento e histórico.
- API GET /api/monitoring autenticada com Firebase ID token.
- Gráfico de 7 ou 30 dias, totais de foco e matérias.
- Regras que restringem gravações ao próprio usuário.
- Layout responsivo em verde-sálvia.

## Comandos

npm run dev        — desenvolvimento
npm run typecheck  — checagem TypeScript
npm test           — testes dos cálculos de monitoramento
npm run build      — build de produção
npm start          — preview local do Worker compilado

## Arquitetura

React + Vinext, Worker Cloudflare e Firebase.
O backend de monitoramento valida o token e usa a API REST do Firestore,
preservando as regras de segurança. Não utiliza Firebase Admin no navegador.
A configuração .openai/hosting.json preserva a identidade do Site já existente.
Este projeto não é um export estático para Firebase Hosting; banco e login
são Firebase, enquanto a API precisa de um servidor compatível.

## Configuração e migração

Leia FIREBASE-SETUP.md para ativar provedores, autorizar domínios, publicar regras
e índices e entender os limites da API. Sem configuração Firebase, o app mostra
um estado de configuração pendente. O backend antigo D1 só é habilitado
explicitamente com RITMO_LEGACY_MODE=true para migração; dados antigos não são
apagados nem associados automaticamente a novas identidades Firebase.

Login Google, e-mail de redefinição e regras publicadas precisam ser verificados
no projeto Firebase antes de uso em produção.
