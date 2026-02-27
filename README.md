# Signature Salesiano – Email Signature Builder

Gerador de assinatura de email institucional para o Instituto São José Salesiano – Resende.

Projeto criado como MVP para padronizar assinaturas de email, permitindo que usuários preencham seus dados e copiem uma assinatura HTML pronta para uso em clientes como Gmail e Outlook.

## Objetivo

- Padronizar assinaturas de email institucionais
- Evitar erros manuais de formatação
- Facilitar a criação e adoção por funcionários
- Servir como base para futura evolução do sistema

## Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui

## Funcionalidades

- Formulário com:
  - Nome
  - Cargo
  - Setor
  - Telefone direto
  - Email
- Geração de assinatura HTML institucional
- Preview em tempo real
- Cópia da assinatura em formato `text/html`
- Compatível com Gmail e Outlook
- Layout responsivo
- Estilo seguro para email (tabelas + estilos inline)

## Identidade Institucional

- Instituto São José Salesiano – Resende
- Cores institucionais:
  - Azul: `#003087`
  - Vermelho: `#E4002B`
- Assets institucionais organizados na pasta `/assets`

## Como rodar o projeto

```bash
cd signature-salesiano
npm install
npm run dev

# Acesse http://localhost:3000 para usar o gerador de assinaturas
```

## Escopo atual

- Não possui autenticação
- Não possui backend
- Não possui persistência de dados
  Projeto focado exclusivamente no MVP funcional.

## Possíveis evoluções

- Backend em Node.js + TypeScript
- Sistema de login
- Múltiplos layouts de assinatura
- Exportação como imagem
- Painel administrativo

## Status

MVP funcional em ambiente local, faltam ajustes nos svgs que não aparecem, e talvez melhoria leve na barra que divide as infos da pessoa com as infos da instituição. O código está organizado e comentado para facilitar futuras evoluções.

remover stylesheets de cor e usar tudo no tailwind e variáveis no global.css para manter consistência e facilitar manutenção.
