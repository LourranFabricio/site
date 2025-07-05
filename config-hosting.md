# Configuração para Hospedagem Gratuita

## Serviços Recomendados

### 1. InfinityFree
- **URL**: https://infinityfree.net/
- **Limites**: 5GB de espaço, 250GB de banda
- **PHP**: 8.0
- **MySQL**: 5.7
- **Domínio**: .epizy.com, .rf.gd, .rf.gd

### 2. x10hosting
- **URL**: https://x10hosting.com/
- **Limites**: 1GB de espaço, 10GB de banda
- **PHP**: 8.0
- **MySQL**: 8.0
- **Domínio**: .x10.mx

### 3. 000webhost
- **URL**: https://000webhost.com/
- **Limites**: 300MB de espaço, 3GB de banda
- **PHP**: 8.0
- **MySQL**: 8.0
- **Domínio**: .000webhostapp.com

## Passos para Deploy

### 1. Preparação dos Arquivos
```bash
# Estrutura de arquivos para upload
site/
├── index.html
├── login.html
├── profile.html
├── partness.html
├── .htaccess
├── assets/
│   ├── css/
│   ├── js/
│   └── img/
├── api/
│   ├── login.php
│   ├── register.php
│   └── ...
└── src/
    ├── config/
    ├── controller/
    └── model/
```

### 2. Configuração do Banco de Dados

#### Criar banco de dados:
```sql
-- Estrutura do banco
CREATE DATABASE brandge_db;
USE brandge_db;

-- Tabela de usuários
CREATE TABLE Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    cpf_cnpj VARCHAR(20) NOT NULL,
    phone VARCHAR(20),
    bio TEXT,
    role ENUM('cliente', 'designer') DEFAULT 'cliente',
    profile_picture VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de especialidades
CREATE TABLE Specialties (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de relacionamento usuário-especialidades
CREATE TABLE UserSpecialties (
    user_id INT,
    specialty_id INT,
    PRIMARY KEY (user_id, specialty_id),
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (specialty_id) REFERENCES Specialties(id) ON DELETE CASCADE
);

-- Tabela de portfólio
CREATE TABLE PortfolioImages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    designer_id INT NOT NULL,
    image_path VARCHAR(255) NOT NULL,
    ordem INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (designer_id) REFERENCES Users(id) ON DELETE CASCADE
);

-- Inserir especialidades padrão
INSERT INTO Specialties (name) VALUES 
('Design Gráfico'),
('Web Design'),
('UI/UX Design'),
('Motion Design'),
('Design de Produto'),
('Ilustração'),
('Fotografia'),
('Branding'),
('Tipografia'),
('Design Editorial');
```

### 3. Configuração de Variáveis de Ambiente

Criar arquivo `.env` na raiz do projeto:
```env
# Configurações do Banco de Dados
DB_HOST=localhost
DB_NAME=brandge_db
DB_USER=seu_usuario
DB_PASS=sua_senha

# Configurações de Upload
UPLOAD_MAX_SIZE=5242880
ALLOWED_EXTENSIONS=jpg,jpeg,png,gif,webp

# Configurações de Segurança
SESSION_SECRET=chave_secreta_aleatoria_aqui
```

### 4. Permissões de Arquivos
```bash
# Diretórios que precisam de permissão de escrita
chmod 755 assets/img/portfolio/
chmod 755 logs/
chmod 644 .env
```

### 5. Configurações Específicas por Serviço

#### InfinityFree
- Usar painel de controle para criar banco MySQL
- Configurar domínio personalizado (opcional)
- Ativar SSL gratuito

#### x10hosting
- Usar cPanel para gerenciar arquivos
- Criar banco via phpMyAdmin
- Configurar subdomínio

#### 000webhost
- Usar File Manager para upload
- Criar banco via MySQL Databases
- Configurar domínio personalizado

## Problemas Comuns e Soluções

### 1. Erro de Conexão com Banco
```php
// Verificar se as credenciais estão corretas
// Testar conexão manualmente
```

### 2. Upload de Arquivos Falha
```php
// Verificar permissões do diretório
// Ajustar limites de upload no .htaccess
```

### 3. Sessões Não Funcionam
```php
// Verificar configurações de sessão
// Usar cookies em vez de sessões se necessário
```

### 4. Logs Não São Criados
```php
// Verificar permissões do diretório logs/
// Usar error_log() como fallback
```

## Monitoramento

### 1. Logs de Acesso
- Verificar arquivo `logs/app.log`
- Monitorar erros PHP em `logs/php_errors.log`

### 2. Performance
- Usar ferramentas como GTmetrix
- Monitorar uso de banda e espaço

### 3. Segurança
- Verificar logs de segurança
- Monitorar tentativas de acesso não autorizado

## Backup

### 1. Banco de Dados
```bash
# Exportar via phpMyAdmin
# Ou usar comando mysqldump se disponível
```

### 2. Arquivos
- Fazer backup regular dos uploads
- Manter cópia do código fonte

## Suporte

Para problemas específicos:
1. Verificar logs do sistema
2. Consultar documentação do serviço
3. Contatar suporte do provedor 