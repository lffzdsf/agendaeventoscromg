# Agenda CRO-MG

Aplicação Next.js para gestão da agenda de eventos do CRO-MG.

## Acesso corporativo

O app agora está preparado para autenticação Google com restrição ao domínio `@cromg.org.br`.

Adicione estas variáveis ao ambiente antes do deploy:

1. `AUTH_SECRET`
2. `AUTH_GOOGLE_ID`
3. `AUTH_GOOGLE_SECRET`

No Google Cloud Console, use as URLs de callback:

- `http://localhost:3000/api/auth/callback/google`
- `https://SEU-DOMINIO/api/auth/callback/google`

O login aceita apenas contas com e-mail verificado do domínio `cromg.org.br`.

## Integração Google Sheets

Para habilitar a criação automática de uma planilha por evento:

1. Crie um arquivo `.env.local` com base em `.env.example`.
2. Publique o `Código.gs` como Web App no Apps Script.
3. Configure `GOOGLE_APPS_SCRIPT_WEB_APP_URL` com a URL publicada.
4. Se quiser proteger o endpoint, defina o mesmo valor em `GOOGLE_APPS_SCRIPT_SHARED_SECRET` e na propriedade `API_SHARED_SECRET` do Apps Script.
5. Reinicie o servidor com `npm run dev`.

Quando configurado, o botão na página de detalhe do evento cria uma planilha Google Sheets com abas:

- `Eventos`
- `Programacao`
- `Palestrantes`
- `Tarefas`
- `Fornecedores`
- `Comunicacao`

O Apps Script evita duplicação de planilhas por evento usando:

- mapeamento `eventId -> spreadsheetId` em `Script Properties`
- aba oculta `_Meta` dentro de cada planilha

## Publicação

Fluxo recomendado:

1. Subir o projeto para o GitHub.
2. Conectar o repositório na Vercel.
3. Configurar na Vercel as variáveis `AUTH_*` e `GOOGLE_*`.
4. Publicar o domínio final e cadastrá-lo também no Google OAuth.
