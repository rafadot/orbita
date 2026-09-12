CREATE TABLE usuarios (
    id                       UUID PRIMARY KEY,
    nome                     VARCHAR(255)      NOT NULL,
    email                    VARCHAR(255)      NOT NULL,
    senha_hash               VARCHAR(255)      NOT NULL,
    email_confirmado_em      TIMESTAMPTZ       NULL,
    termos_aceitos_em        TIMESTAMPTZ       NOT NULL,
    tentativas_login_falhas  INT               NOT NULL DEFAULT 0,
    bloqueado_ate            TIMESTAMPTZ       NULL,
    criado_em                TIMESTAMPTZ       NOT NULL DEFAULT now(),
    atualizado_em            TIMESTAMPTZ       NOT NULL DEFAULT now()
);

-- usuarios é a exceção à regra "toda tabela tem user_id" — ela É o usuário.
CREATE UNIQUE INDEX idx_usuarios_email ON usuarios (email);

CREATE TABLE tokens_confirmacao_email (
    id          UUID PRIMARY KEY,
    usuario_id  UUID          NOT NULL REFERENCES usuarios (id),
    token_hash  VARCHAR(64)   NOT NULL,
    expira_em   TIMESTAMPTZ   NOT NULL,
    usado_em    TIMESTAMPTZ   NULL,
    criado_em   TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX idx_tokens_confirmacao_email_usuario_id ON tokens_confirmacao_email (usuario_id);
CREATE UNIQUE INDEX idx_tokens_confirmacao_email_token_hash ON tokens_confirmacao_email (token_hash);

CREATE TABLE tokens_atualizacao (
    id           UUID PRIMARY KEY,
    usuario_id   UUID          NOT NULL REFERENCES usuarios (id),
    token_hash   VARCHAR(64)   NOT NULL,
    expira_em    TIMESTAMPTZ   NOT NULL,
    revogado_em  TIMESTAMPTZ   NULL,
    persistente  BOOLEAN       NOT NULL DEFAULT false,
    criado_em    TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX idx_tokens_atualizacao_usuario_id ON tokens_atualizacao (usuario_id);
CREATE UNIQUE INDEX idx_tokens_atualizacao_token_hash ON tokens_atualizacao (token_hash);
