# Brandge - Apresentação Rápida

## Introdução

O Brandge é uma plataforma web para conectar clientes e designers, permitindo cadastro, gerenciamento de portfólio, especialidades e perfis. O sistema foi desenvolvido em PHP (backend), MySQL (banco de dados) e JavaScript (frontend), com foco em robustez, segurança e organização de código.

---

## Estrutura de Pastas

```
site/
│
├── api/                # Endpoints PHP (backend REST)
│   ├── login.php
│   ├── register.php
│   ├── check-session.php
│   ├── update-profile.php
│   ├── update-designer.php
│   ├── delete-account.php
│   ├── upload-portfolio.php
│   ├── delete-portfolio-image.php
│   ├── get-portfolio.php
│   ├── get-designer.php
│   ├── get-specialties.php
│   ├── list-designers.php
│   ├── list-specialties.php
│   └── logout.php
│
├── assets/
│   ├── css/            # Estilos CSS das páginas
│   ├── img/            # Imagens do site e portfólio
│   └── js/             # Scripts JavaScript do frontend
│
├── src/
│   ├── config/         # Configurações e conexão com o banco
│   │   ├── db.php
│   │   ├── env.php
│   │   └── logger.php
│   ├── controller/     # Lógica de autenticação e registro
│   └── model/          # Modelos de dados (ex: User.php)
│
├── index.html          # Página inicial
├── login.html          # Página de login/registro
├── profile.html        # Página de perfil do usuário
├── partness.html       # Página de parceiros/designers
└── DOCUMENTO_DESCRITIVO.md # Documentação descritiva do projeto
```

---

## Organização dos Arquivos

- **api/**: Endpoints RESTful em PHP, cada um responsável por uma funcionalidade específica. Todos retornam JSON e possuem tratamento robusto de erros.
- **assets/js/**: Scripts do frontend, responsáveis por interações, requisições AJAX e atualização dinâmica das páginas.
- **assets/css/**: Estilos separados por página/componentes.
- **src/config/**: Configurações sensíveis, conexão com o banco e sistema de logs.
- **src/controller/**: Lógica de autenticação e registro.
- **src/model/**: Modelos de dados (ex: usuário).

---

## Funcionalidades Principais

- Cadastro e login de usuários (cliente/designer)
- Gestão de perfil e atualização de dados
- Upload e exibição de portfólio para designers
- Associação de especialidades aos designers
- Listagem de designers e suas especialidades
- Exclusão de conta e imagens do portfólio
- Sistema de tratamento de erros e sessões

---

## Banco de Dados

O banco de dados é composto por 4 tabelas principais, todas com collation `utf8mb4_unicode_ci` para suportar caracteres especiais:

### users
Armazena dados dos usuários (clientes e designers).
- **id**: Identificador único
- **name**: Nome do usuário
- **email**: E-mail (único)
- **password_hash**: Senha criptografada
- **cpf_cnpj**: CPF ou CNPJ
- **role**: 'cliente' ou 'designer'
- **phone**: Telefone
- **profile_picture**: Caminho da foto de perfil (opcional)
- **created_at**: Data de criação
- **bio**: Biografia do usuário
- **faixa_preco**: Faixa de preço (opcional)

### specialties
Lista de especialidades de design.
- **id**: Identificador único
- **name**: Nome da especialidade

### designer_specialties
Relação N:N entre designers e especialidades.
- **id**: Identificador único
- **designer_id**: Referência ao usuário designer
- **specialty_id**: Referência à especialidade

### portfolio_images
Imagens do portfólio de cada designer.
- **id**: Identificador único
- **designer_id**: Referência ao usuário designer
- **image_path**: Caminho da imagem
- **ordem**: Ordem de exibição
- **created_at**: Data de upload

#### Relações
- Um usuário com `role = designer` pode ter várias especialidades (designer_specialties) e várias imagens de portfólio (portfolio_images).
- A tabela `designer_specialties` faz a ligação entre designers e suas especialidades.
- A tabela `portfolio_images` armazena as imagens enviadas por cada designer.

---

