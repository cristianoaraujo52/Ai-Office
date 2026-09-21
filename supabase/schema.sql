-- ============================================================
--  IA Office Academy — Schema Supabase
--  Execute este arquivo no SQL Editor do seu projeto Supabase
-- ============================================================

-- ── Profiles (extensão de auth.users) ─────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id         UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nome       TEXT NOT NULL DEFAULT '',
  email      TEXT NOT NULL DEFAULT '',
  role       TEXT NOT NULL DEFAULT 'aluno' CHECK (role IN ('admin', 'aluno')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger: cria profile automaticamente ao cadastrar usuário
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id, nome, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'aluno')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ── Módulos ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS modulos (
  id            TEXT PRIMARY KEY,
  titulo        TEXT NOT NULL,
  descricao     TEXT NOT NULL DEFAULT '',
  ordem         INTEGER NOT NULL DEFAULT 0,
  carga_horaria INTEGER NOT NULL DEFAULT 4,
  ativo         BOOLEAN NOT NULL DEFAULT true,
  cover_image   TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── Aulas ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS aulas (
  id               TEXT PRIMARY KEY,
  modulo_id        TEXT REFERENCES modulos(id) ON DELETE CASCADE,
  titulo           TEXT NOT NULL,
  descricao        TEXT NOT NULL DEFAULT '',
  descricao_curta  TEXT,
  conteudo_html    TEXT NOT NULL DEFAULT '',
  video_url        TEXT NOT NULL DEFAULT '',
  ordem            INTEGER NOT NULL DEFAULT 0,
  duracao_min      INTEGER NOT NULL DEFAULT 20,
  ativo            BOOLEAN NOT NULL DEFAULT true,
  objetivo         TEXT,
  passo_a_passo    JSONB DEFAULT '[]'::JSONB,
  dicas            JSONB DEFAULT '[]'::JSONB,
  erros_comuns     JSONB DEFAULT '[]'::JSONB,
  resumo           TEXT,
  exercicio        TEXT,
  narracao         TEXT,
  resumo_audio     TEXT,
  roteiro_video    TEXT,
  atividade_pratica TEXT,
  video_titulo     TEXT,
  video_canal      TEXT,
  video_duracao    TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ── Slides ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS slides (
  id         TEXT PRIMARY KEY,
  aula_id    TEXT REFERENCES aulas(id) ON DELETE CASCADE,
  titulo     TEXT NOT NULL,
  texto      TEXT NOT NULL DEFAULT '',
  imagem_url TEXT,
  ordem      INTEGER NOT NULL DEFAULT 0
);

-- ── Materiais ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS materiais (
  id      TEXT PRIMARY KEY,
  aula_id TEXT REFERENCES aulas(id) ON DELETE CASCADE,
  titulo  TEXT NOT NULL,
  tipo    TEXT NOT NULL DEFAULT 'link' CHECK (tipo IN ('pdf', 'link', 'video', 'outro')),
  url     TEXT NOT NULL
);

-- ── Quizzes ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS quizzes (
  id      TEXT PRIMARY KEY,
  aula_id TEXT REFERENCES aulas(id) ON DELETE CASCADE,
  titulo  TEXT NOT NULL,
  UNIQUE (aula_id)
);

-- ── Perguntas ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS perguntas (
  id               TEXT PRIMARY KEY,
  quiz_id          TEXT REFERENCES quizzes(id) ON DELETE CASCADE,
  texto            TEXT NOT NULL,
  opcoes           JSONB NOT NULL DEFAULT '[]'::JSONB,
  resposta_correta TEXT NOT NULL,
  ordem            INTEGER NOT NULL DEFAULT 0
);

-- ── Progressos ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS progressos (
  id             TEXT DEFAULT gen_random_uuid()::TEXT PRIMARY KEY,
  user_id        UUID REFERENCES profiles(id) ON DELETE CASCADE,
  aula_id        TEXT REFERENCES aulas(id) ON DELETE CASCADE,
  modulo_id      TEXT REFERENCES modulos(id) ON DELETE CASCADE,
  concluida      BOOLEAN NOT NULL DEFAULT false,
  tempo_estudo   INTEGER NOT NULL DEFAULT 0,
  quiz_realizado BOOLEAN NOT NULL DEFAULT false,
  quiz_nota      FLOAT,
  updated_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, aula_id)
);

-- ── Certificados ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS certificados (
  id             TEXT PRIMARY KEY,
  user_id        UUID REFERENCES profiles(id) ON DELETE CASCADE,
  user_nome      TEXT NOT NULL,
  curso          TEXT NOT NULL,
  carga_horaria  INTEGER NOT NULL,
  data_conclusao TEXT NOT NULL,
  codigo         TEXT NOT NULL UNIQUE
);

-- ============================================================
--  RLS (Row Level Security)
-- ============================================================

ALTER TABLE profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE modulos     ENABLE ROW LEVEL SECURITY;
ALTER TABLE aulas       ENABLE ROW LEVEL SECURITY;
ALTER TABLE slides      ENABLE ROW LEVEL SECURITY;
ALTER TABLE materiais   ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes     ENABLE ROW LEVEL SECURITY;
ALTER TABLE perguntas   ENABLE ROW LEVEL SECURITY;
ALTER TABLE progressos  ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificados ENABLE ROW LEVEL SECURITY;

-- Conteúdo do curso: qualquer pessoa autenticada pode ler
CREATE POLICY "Leitura pública – modulos"    ON modulos    FOR SELECT USING (true);
CREATE POLICY "Leitura pública – aulas"      ON aulas      FOR SELECT USING (true);
CREATE POLICY "Leitura pública – slides"     ON slides     FOR SELECT USING (true);
CREATE POLICY "Leitura pública – materiais"  ON materiais  FOR SELECT USING (true);
CREATE POLICY "Leitura pública – quizzes"    ON quizzes    FOR SELECT USING (true);
CREATE POLICY "Leitura pública – perguntas"  ON perguntas  FOR SELECT USING (true);

-- Somente admin pode escrever conteúdo
CREATE POLICY "Admin – modulos"   ON modulos   FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
) WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin – aulas"     ON aulas     FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
) WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin – slides"    ON slides    FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
) WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin – materiais" ON materiais FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
) WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin – quizzes"   ON quizzes   FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
) WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin – perguntas" ON perguntas FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
) WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Profiles: cada usuário vê/edita o próprio; admin vê todos
CREATE POLICY "Leitura do próprio profile" ON profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "Edição do próprio profile"  ON profiles FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "Admin – profiles"           ON profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin – gerenciar profiles" ON profiles FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
) WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Progressos: cada aluno vê/edita o próprio
CREATE POLICY "Leitura próprio progresso"  ON progressos FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Inserir próprio progresso"  ON progressos FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Atualizar próprio progresso" ON progressos FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admin – progressos"         ON progressos FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
) WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Certificados
CREATE POLICY "Leitura próprio certificado" ON certificados FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admin – certificados"        ON certificados FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
) WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
