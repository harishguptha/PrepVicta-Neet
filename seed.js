require("dotenv").config();
const { Client } = require("pg");

const client = new Client({
  host: process.env.SUPABASE_HOST,
  port: parseInt(process.env.SUPABASE_PORT || "5432"),
  database: process.env.SUPABASE_DB,
  user: process.env.SUPABASE_USER,
  password: process.env.SUPABASE_PASSWORD,
  ssl: { rejectUnauthorized: false },
});

const SCHEMA = process.env.SUPABASE_SCHEMA || "prepvicta";

async function seed() {
  await client.connect();
  console.log("Connected to Supabase Postgres.");

  // ── Create schema ──
  await client.query(`CREATE SCHEMA IF NOT EXISTS ${SCHEMA}`);
  await client.query(`SET search_path TO ${SCHEMA}`);
  console.log(`Using schema: ${SCHEMA}`);

  // ── Drop existing tables (in dependency order) ──
  await client.query(`
    DROP TABLE IF EXISTS planner_tasks CASCADE;
    DROP TABLE IF EXISTS mock_test_results CASCADE;
    DROP TABLE IF EXISTS mock_tests CASCADE;
    DROP TABLE IF EXISTS revision_progress CASCADE;
    DROP TABLE IF EXISTS chapters CASCADE;
    DROP TABLE IF EXISTS subjects CASCADE;
    DROP TABLE IF EXISTS student_profiles CASCADE;
    DROP TABLE IF EXISTS mnemonics CASCADE;
    DROP TABLE IF EXISTS subscriptions CASCADE;
    DROP TABLE IF EXISTS users CASCADE;
    DROP TABLE IF EXISTS platform_kpis CASCADE;
  `);
  console.log("Dropped old tables.");

  // ════════════════════════════════════════════════
  //  TABLES
  // ════════════════════════════════════════════════

  // 1. users – shared by students and admins
  await client.query(`
    CREATE TABLE users (
      id            SERIAL PRIMARY KEY,
      email         VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      name          VARCHAR(255) NOT NULL,
      role          VARCHAR(20)  NOT NULL CHECK (role IN ('student','elite','admin')),
      created_at    TIMESTAMPTZ  DEFAULT NOW(),
      last_active   TIMESTAMPTZ  DEFAULT NOW()
    )
  `);

  // 2. subscriptions – tracks plan status per user
  await client.query(`
    CREATE TABLE subscriptions (
      id          SERIAL PRIMARY KEY,
      user_id     INT REFERENCES users(id) ON DELETE CASCADE,
      plan        VARCHAR(50)  NOT NULL,
      status      VARCHAR(20)  NOT NULL CHECK (status IN ('Active','Expired','Trial')),
      starts_at   DATE         NOT NULL,
      expires_at  DATE,
      created_at  TIMESTAMPTZ  DEFAULT NOW()
    )
  `);

  // 3. student_profiles – onboarding + dashboard data
  await client.query(`
    CREATE TABLE student_profiles (
      id                  SERIAL PRIMARY KEY,
      user_id             INT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      stage               VARCHAR(20)  NOT NULL,
      attempt_year        INT          NOT NULL,
      daily_study_hours   VARCHAR(20),
      strongest_subject   VARCHAR(30),
      weakest_subject     VARCHAR(30),
      confidence          VARCHAR(10),
      preferred_times     TEXT[],
      estimated_score_low INT DEFAULT 0,
      estimated_score_high INT DEFAULT 0,
      target_score        INT DEFAULT 650,
      badge_level         VARCHAR(30)  DEFAULT 'Beginner',
      badge_percent       INT          DEFAULT 0,
      syllabus_completed  INT          DEFAULT 0,
      syllabus_total      INT          DEFAULT 97,
      planner_adherence   INT          DEFAULT 0,
      study_streak_days   INT          DEFAULT 0,
      revision_percent    INT          DEFAULT 0
    )
  `);

  // 4. subjects
  await client.query(`
    CREATE TABLE subjects (
      id   SERIAL PRIMARY KEY,
      name VARCHAR(50) UNIQUE NOT NULL
    )
  `);

  // 5. chapters – per subject
  await client.query(`
    CREATE TABLE chapters (
      id          SERIAL PRIMARY KEY,
      subject_id  INT REFERENCES subjects(id) ON DELETE CASCADE,
      name        VARCHAR(255) NOT NULL,
      chapter_num INT NOT NULL
    )
  `);

  // 6. revision_progress – per student per chapter
  await client.query(`
    CREATE TABLE revision_progress (
      id          SERIAL PRIMARY KEY,
      user_id     INT REFERENCES users(id) ON DELETE CASCADE,
      chapter_id  INT REFERENCES chapters(id) ON DELETE CASCADE,
      accuracy    INT DEFAULT 0,
      revised     BOOLEAN DEFAULT FALSE,
      revised_at  TIMESTAMPTZ,
      UNIQUE(user_id, chapter_id)
    )
  `);

  // 7. mock_tests – test definitions
  await client.query(`
    CREATE TABLE mock_tests (
      id             SERIAL PRIMARY KEY,
      title          VARCHAR(255) NOT NULL,
      test_type      VARCHAR(30)  NOT NULL CHECK (test_type IN ('full_mock','subject','weekly_mixed','topic')),
      total_questions INT NOT NULL,
      duration_mins  INT NOT NULL,
      created_at     TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  // 8. mock_test_results – per student per test
  await client.query(`
    CREATE TABLE mock_test_results (
      id               SERIAL PRIMARY KEY,
      user_id          INT REFERENCES users(id) ON DELETE CASCADE,
      mock_test_id     INT REFERENCES mock_tests(id) ON DELETE CASCADE,
      total_score      INT NOT NULL,
      max_score        INT NOT NULL,
      physics_score    INT DEFAULT 0,
      chemistry_score  INT DEFAULT 0,
      biology_score    INT DEFAULT 0,
      accuracy_percent INT DEFAULT 0,
      avg_time_per_q   INT DEFAULT 0,
      taken_at         TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  // 9. planner_tasks – MoSCoW daily plan
  await client.query(`
    CREATE TABLE planner_tasks (
      id           SERIAL PRIMARY KEY,
      user_id      INT REFERENCES users(id) ON DELETE CASCADE,
      subject      VARCHAR(50) NOT NULL,
      title        VARCHAR(255) NOT NULL,
      note         VARCHAR(255),
      duration_min INT NOT NULL,
      priority     VARCHAR(10) NOT NULL CHECK (priority IN ('must','should','could')),
      is_done      BOOLEAN DEFAULT FALSE,
      plan_date    DATE NOT NULL,
      created_at   TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  // 10. mnemonics – saved by students
  await client.query(`
    CREATE TABLE mnemonics (
      id         SERIAL PRIMARY KEY,
      user_id    INT REFERENCES users(id) ON DELETE CASCADE,
      title      VARCHAR(255) NOT NULL,
      content    TEXT NOT NULL,
      meaning    TEXT,
      subject    VARCHAR(50),
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  // 11. platform_kpis – admin dashboard snapshots
  await client.query(`
    CREATE TABLE platform_kpis (
      id                  SERIAL PRIMARY KEY,
      snapshot_date       DATE UNIQUE NOT NULL,
      dau_mau_ratio       NUMERIC(5,2),
      planner_adoption    NUMERIC(5,2),
      avg_mock_score      INT,
      avg_mock_max        INT,
      monthly_revenue     NUMERIC(12,2),
      total_students      INT,
      active_students     INT,
      trial_students      INT,
      expired_students    INT
    )
  `);

  console.log("All tables created.");

  // ════════════════════════════════════════════════
  //  SEED DATA
  // ════════════════════════════════════════════════

  // ── Users ──
  await client.query(`
    INSERT INTO users (email, password_hash, name, role) VALUES
      ('akash@prepvicta.com',  'akash123',  'Akash Gunasekar', 'elite'),
      ('raja@prepvicta.com',   'raja123',   'Raja Shanmugam',      'student'),
      ('pavan@prepvicta.com',  'pavan123',  'Pavan Vignesh',     'student'),
      ('admin@prepvicta.com',  'admin123',  'Super Admin',     'admin')
  `);
  console.log("Users seeded.");

  // ── Subscriptions ──
  await client.query(`
    INSERT INTO subscriptions (user_id, plan, status, starts_at, expires_at) VALUES
      (1, 'Elite Premium',   'Active',  '2025-06-01', '2026-06-01'),
      (2, 'Pro Annual',      'Active',  '2025-01-01', '2026-01-01'),
      (3, 'Basic Monthly',   'Active',  '2025-04-01', '2025-05-01')
  `);
  console.log("Subscriptions seeded.");

  // ── Student Profile (main student) ──
  await client.query(`
    INSERT INTO student_profiles (
      user_id, stage, attempt_year, daily_study_hours, strongest_subject,
      weakest_subject, confidence, preferred_times,
      estimated_score_low, estimated_score_high, target_score,
      badge_level, badge_percent, syllabus_completed, syllabus_total,
      planner_adherence, study_streak_days, revision_percent
    ) VALUES (
      1, 'Class 12', 2025, '4-6 hrs', 'Biology',
      'Physics', 'Medium', ARRAY['Morning','Evening'],
      540, 580, 650,
      'Pro Achiever', 82, 63, 97,
      90, 15, 78
    )
  `);
  console.log("Student profile seeded.");

  // ── Subjects ──
  await client.query(`
    INSERT INTO subjects (name) VALUES ('Physics'), ('Chemistry'), ('Biology')
  `);

  // ── Chapters ──
  const physicsChapters = [
    "Mechanics", "Rotational Motion", "Gravitation", "Thermodynamics",
    "Oscillations & Waves", "Electrostatics", "Current Electricity",
    "Magnetism", "Electromagnetic Induction", "Wave Optics",
    "Modern Physics", "Semiconductor Electronics"
  ];
  const chemistryChapters = [
    "The Living World", "Atomic Structure", "Chemical Bonding",
    "Thermodynamics", "Equilibrium", "Redox Reactions",
    "Electrochemistry", "Chemical Kinetics", "Surface Chemistry",
    "p-Block Elements", "d-Block Elements", "Coordination Compounds",
    "Organic Chemistry Basics", "Hydrocarbons", "Polymers"
  ];
  const biologyChapters = [
    "The Living World", "Biological Classification", "Plant Kingdom",
    "Animal Kingdom", "Morphology of Flowering Plants",
    "Cell Biology", "Cell Cycle", "Biomolecules",
    "Photosynthesis", "Respiration in Plants",
    "Digestion & Absorption", "Breathing & Exchange of Gases",
    "Body Fluids & Circulation", "Excretory Products",
    "Neural Control & Coordination", "Locomotion & Movement",
    "Chemical Coordination", "Human Reproduction",
    "Reproductive Health", "Genetics", "Molecular Basis of Inheritance",
    "Evolution", "Human Health & Disease", "Biotechnology",
    "Organisms & Populations", "Ecosystem", "Biodiversity"
  ];

  for (let i = 0; i < physicsChapters.length; i++) {
    await client.query(
      `INSERT INTO chapters (subject_id, name, chapter_num) VALUES (1, $1, $2)`,
      [physicsChapters[i], i + 1]
    );
  }
  for (let i = 0; i < chemistryChapters.length; i++) {
    await client.query(
      `INSERT INTO chapters (subject_id, name, chapter_num) VALUES (2, $1, $2)`,
      [chemistryChapters[i], i + 1]
    );
  }
  for (let i = 0; i < biologyChapters.length; i++) {
    await client.query(
      `INSERT INTO chapters (subject_id, name, chapter_num) VALUES (3, $1, $2)`,
      [biologyChapters[i], i + 1]
    );
  }
  console.log(`Chapters seeded: ${physicsChapters.length + chemistryChapters.length + biologyChapters.length} total.`);

  // ── Revision progress (weak topics for student 1) ──
  // Get chapter IDs for the weak topics
  const { rows: weakChapters } = await client.query(`
    SELECT id, name FROM chapters
    WHERE name IN ('Rotational Motion', 'Chemical Bonding', 'Genetics')
  `);
  for (const ch of weakChapters) {
    const acc = ch.name === "Rotational Motion" ? 32
              : ch.name === "Chemical Bonding" ? 41
              : 45;
    await client.query(
      `INSERT INTO revision_progress (user_id, chapter_id, accuracy, revised)
       VALUES (1, $1, $2, false)`,
      [ch.id, acc]
    );
  }
  // Mark some chapters as revised
  const { rows: revisedChapters } = await client.query(`
    SELECT id FROM chapters WHERE chapter_num <= 15 AND subject_id = 3
  `);
  for (const ch of revisedChapters) {
    await client.query(
      `INSERT INTO revision_progress (user_id, chapter_id, accuracy, revised, revised_at)
       VALUES (1, $1, $2, true, NOW())
       ON CONFLICT (user_id, chapter_id) DO UPDATE SET revised = true, revised_at = NOW()`,
      [ch.id, 70 + Math.floor(Math.random() * 25)]
    );
  }
  console.log("Revision progress seeded.");

  // ── Mock Tests ──
  await client.query(`
    INSERT INTO mock_tests (title, test_type, total_questions, duration_mins) VALUES
      ('Full NEET Mock 1',  'full_mock',    180, 180),
      ('Full NEET Mock 2',  'full_mock',    180, 180),
      ('Full NEET Mock 3',  'full_mock',    180, 180),
      ('Full NEET Mock 4',  'full_mock',    180, 180),
      ('Full NEET Mock 5',  'full_mock',    180, 180),
      ('Full NEET Mock 6',  'full_mock',    180, 180),
      ('Full NEET Mock 7',  'full_mock',    180, 180),
      ('Full NEET Mock 8',  'full_mock',    180, 180),
      ('Full NEET Mock 9',  'full_mock',    180, 180),
      ('Full NEET Mock 10', 'full_mock',    180, 180),
      ('Full NEET Mock 11', 'full_mock',    180, 180),
      ('Full NEET Mock 12', 'full_mock',    180, 180),
      ('Physics Subject Test',   'subject', 45,  45),
      ('Chemistry Subject Test', 'subject', 45,  45),
      ('Biology Subject Test',   'subject', 45,  45),
      ('Weekly Mixed Test',  'weekly_mixed', 30,  30),
      ('Genetics Topic Test','topic',        20,  20)
  `);
  console.log("Mock tests seeded.");

  // ── Mock test results (student 1, matching dashboard trend M1→M5 & Mock 12) ──
  const mockScores = [
    { mockId: 1,  total: 420, phy: 120, chem: 130, bio: 170, acc: 58, time: 72 },
    { mockId: 2,  total: 450, phy: 130, chem: 140, bio: 180, acc: 63, time: 68 },
    { mockId: 3,  total: 490, phy: 145, chem: 155, bio: 190, acc: 68, time: 65 },
    { mockId: 4,  total: 520, phy: 150, chem: 160, bio: 210, acc: 72, time: 62 },
    { mockId: 5,  total: 545, phy: 155, chem: 165, bio: 225, acc: 76, time: 60 },
    { mockId: 6,  total: 550, phy: 158, chem: 167, bio: 225, acc: 76, time: 59 },
    { mockId: 7,  total: 560, phy: 160, chem: 170, bio: 230, acc: 78, time: 58 },
    { mockId: 8,  total: 570, phy: 162, chem: 172, bio: 236, acc: 79, time: 57 },
    { mockId: 9,  total: 580, phy: 165, chem: 175, bio: 240, acc: 81, time: 56 },
    { mockId: 10, total: 590, phy: 160, chem: 170, bio: 260, acc: 82, time: 56 },
    { mockId: 11, total: 600, phy: 165, chem: 170, bio: 265, acc: 83, time: 55 },
    { mockId: 12, total: 615, phy: 160, chem: 170, bio: 285, acc: 85, time: 55 },
  ];

  for (const s of mockScores) {
    await client.query(
      `INSERT INTO mock_test_results
        (user_id, mock_test_id, total_score, max_score, physics_score, chemistry_score, biology_score, accuracy_percent, avg_time_per_q, taken_at)
       VALUES (1, $1, $2, 720, $3, $4, $5, $6, $7, NOW() - ($8 || ' days')::interval)`,
      [s.mockId, s.total, s.phy, s.chem, s.bio, s.acc, s.time, (12 - s.mockId) * 7]
    );
  }
  console.log("Mock test results seeded (12 mocks).");

  // ── Planner tasks (today's plan for student 1) ──
  await client.query(`
    INSERT INTO planner_tasks (user_id, subject, title, note, duration_min, priority, is_done, plan_date) VALUES
      (1, 'Physics',   'Rotational Motion: Rolling without slipping', 'High weightage, overdue',   120, 'must',   false, CURRENT_DATE),
      (1, 'Biology',   'Genetics Chapter Test',                       'Scheduled Mock Test',         45, 'must',   false, CURRENT_DATE),
      (1, 'Chemistry', 'Chemical Bonding Revision',                   'Planned revision',            60, 'should', true,  CURRENT_DATE),
      (1, 'Biology',   'Human Reproduction Notes',                    'New topic',                   90, 'should', false, CURRENT_DATE),
      (1, 'Physics',   '10 Mechanics MCQs',                           'Bonus practice',              30, 'could',  false, CURRENT_DATE),
      (1, 'Chemistry', 'Periodic Table Mnemonics',                    'Quick review',                15, 'could',  false, CURRENT_DATE)
  `);
  console.log("Planner tasks seeded.");

  // ── Mnemonics (saved library for student 1) ──
  await client.query(`
    INSERT INTO mnemonics (user_id, title, content, meaning, subject) VALUES
      (1, 'Taxonomy Order',          'King Philip Came Over For Good Spaghetti',       'Kingdom → Phylum → Class → Order → Family → Genus → Species', 'Biology'),
      (1, 'OIL RIG',                 'Oxidation Is Loss, Reduction Is Gain',           'Remember electron transfer in redox reactions',               'Chemistry'),
      (1, 'Roy G. Biv',              'Red, Orange, Yellow, Green, Blue, Indigo, Violet','Visible spectrum order by wavelength',                       'Physics'),
      (1, 'WBC Types',               'Never Let Monkeys Eat Bananas',                  'Neutrophils, Lymphocytes, Monocytes, Eosinophils, Basophils', 'Biology'),
      (1, 'EM Spectrum Order',        'Raging Martians Invaded Venus Using X-ray Guns', 'Radio, Micro, IR, Visible, UV, X-ray, Gamma',                'Physics'),
      (1, 'Amino Acid Groups',       'Any Alligator Gets Very Lonely In Lovely Pools', 'Ala, Arg, Gly, Val, Leu, Ile, Lys, Pro',                     'Biology'),
      (1, 'Electrochemical Series',  'Please Stop Calling Me A Zebra, I Lack Courage', 'K, Na, Ca, Mg, Al, Zn, Fe, Ni, Sn, Pb, H, Cu, Hg, Ag, Au',  'Chemistry'),
      (1, 'Cranial Nerves',          'Oh Oh Oh To Touch And Feel Very Green Vegetables AH','Olfactory, Optic, Oculomotor, Trochlear, Trigeminal...', 'Biology'),
      (1, 'Diatomic Elements',       'Have No Fear Of Ice Cold Beer',                  'H, N, F, O, I, Cl, Br',                                      'Chemistry'),
      (1, 'Mohs Hardness Scale',     'Toronto Girls Can Fly And Other Queer Things Can Do','Talc, Gypsum, Calcite, Fluorite...',                      'Chemistry'),
      (1, 'Biological Classification','King Philip Came Over For Green Soup',           'Kingdom, Phylum, Class, Order, Family, Genus, Species',       'Biology'),
      (1, 'Krebs Cycle Intermediates','Can I Keep Selling Seashells For Money, Officer?','Citrate, Isocitrate, α-KG, Succinyl-CoA, Succinate...',      'Biology')
  `);
  console.log("Mnemonics seeded (12 saved).");

  // ── Platform KPIs (for admin dashboard) ──
  await client.query(`
    INSERT INTO platform_kpis (
      snapshot_date, dau_mau_ratio, planner_adoption, avg_mock_score, avg_mock_max,
      monthly_revenue, total_students, active_students, trial_students, expired_students
    ) VALUES
      (CURRENT_DATE, 42.8, 76.0, 482, 720, 4200000, 12400, 8200, 1500, 2700)
  `);
  console.log("Platform KPIs seeded.");

  console.log("\n✓ Seed complete. All tables created and populated.");

  await client.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
