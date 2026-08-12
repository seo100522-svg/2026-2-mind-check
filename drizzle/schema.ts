import { boolean, index, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const anonymousSessions = mysqlTable("anonymous_sessions", {
  id: int("id").autoincrement().primaryKey(),
  /** SHA-256 hash only; the raw browser session token is never persisted. */
  sessionHash: varchar("sessionHash", { length: 64 }).notNull().unique(),
  locale: mysqlEnum("locale", ["ko", "en", "ja"]).notNull().default("ko"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const assessmentResponses = mysqlTable(
  "assessment_responses",
  {
    id: int("id").autoincrement().primaryKey(),
    sessionId: int("sessionId")
      .notNull()
      .references(() => anonymousSessions.id, { onDelete: "cascade" }),
    locale: mysqlEnum("locale", ["ko", "en", "ja"]).notNull(),
    cesdScore: int("cesdScore").notNull(),
    pssScore: int("pssScore").notNull(),
    /** Legacy compatibility fields retained only to avoid destructive migration of an empty retired table. */
    legacyMallangiType: varchar("mallangiType", { length: 32 }).notNull().default("retired"),
    cesdAnswers: text("cesdAnswers").notNull(),
    pssAnswers: text("pssAnswers").notNull(),
    legacyMallangiAnswers: text("mallangiAnswers").notNull(),
    recommendedGame: varchar("recommendedGame", { length: 32 }).notNull().default("ping-pong-bingo"),
    satisfactionScore: int("satisfactionScore").notNull().default(0),
    satisfactionAnswerCount: int("satisfactionAnswerCount").notNull().default(0),
    satisfactionAnswers: text("satisfactionAnswers").notNull(),
    satisfactionComment: text("satisfactionComment"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => ({
    sessionCreatedIndex: index("assessment_responses_session_created_idx").on(
      table.sessionId,
      table.createdAt,
    ),
    recommendedGameIndex: index("assessment_responses_recommended_game_idx").on(table.recommendedGame),
  }),
);

/**
 * Student identity and consent are isolated from assessment scores to limit
 * access to administrators with a legitimate student-support purpose.
 */
export const studentAssessmentProfiles = mysqlTable(
  "student_assessment_profiles",
  {
    id: int("id").autoincrement().primaryKey(),
    responseId: int("responseId")
      .notNull()
      .unique(),
    studentName: varchar("studentName", { length: 120 }).notNull(),
    studentId: varchar("studentId", { length: 64 }).notNull(),
    department: varchar("department", { length: 160 }).notNull(),
    personalDataConsent: boolean("personalDataConsent").notNull(),
    personalDataConsentAt: timestamp("personalDataConsentAt").notNull(),
    counselingContactConsent: boolean("counselingContactConsent").notNull().default(false),
    counselingContactConsentAt: timestamp("counselingContactConsentAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => ({
    studentIdIndex: index("student_assessment_profiles_student_id_idx").on(table.studentId),
    contactConsentIndex: index("student_assessment_profiles_contact_consent_idx").on(table.counselingContactConsent),
  }),
);

/**
 * One current, exportable record per student number. Historical submissions
 * remain separated in profiles/responses while this table points at the latest
 * response selected for each student.
 */
export const studentAssessmentCurrent = mysqlTable(
  "student_assessment_current",
  {
    studentId: varchar("studentId", { length: 64 }).primaryKey(),
    responseId: int("responseId").notNull().unique(),
    studentName: varchar("studentName", { length: 120 }).notNull(),
    department: varchar("department", { length: 160 }).notNull(),
    personalDataConsent: boolean("personalDataConsent").notNull(),
    personalDataConsentAt: timestamp("personalDataConsentAt").notNull(),
    counselingContactConsent: boolean("counselingContactConsent").notNull().default(false),
    counselingContactConsentAt: timestamp("counselingContactConsentAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => ({
    departmentIndex: index("student_assessment_current_department_idx").on(table.department),
    contactConsentIndex: index("student_assessment_current_contact_consent_idx").on(table.counselingContactConsent),
  }),
);

/**
 * 운영자가 데이터베이스 화면에서 바로 확인하는 학생별 최신 통합 기록입니다.
 * 표와 열 이름은 한국어로 유지하며, 학번마다 한 행만 갱신합니다.
 */
export const studentMindCheckRecords = mysqlTable(
  "학생_마음체크_기록",
  {
    recordId: int("기록번호").autoincrement().primaryKey(),
    studentId: varchar("학번", { length: 64 }).notNull().unique(),
    studentName: varchar("이름", { length: 120 }).notNull(),
    department: varchar("학과", { length: 160 }).notNull(),
    locale: mysqlEnum("응답언어", ["ko", "en", "ja"]).notNull().default("ko"),
    personalDataConsent: boolean("개인정보동의").notNull(),
    personalDataConsentAt: timestamp("개인정보동의시각").notNull(),
    counselingContactConsent: boolean("상담연락동의").notNull().default(false),
    counselingContactConsentAt: timestamp("상담연락동의시각"),
    cesdScore: int("우울점수").notNull(),
    pssScore: int("스트레스점수").notNull(),
    cesdAnswers: text("우울응답").notNull(),
    pssAnswers: text("스트레스응답").notNull(),
    satisfaction1: int("만족도1").notNull().default(0),
    satisfaction2: int("만족도2").notNull().default(0),
    satisfaction3: int("만족도3").notNull().default(0),
    satisfaction4: int("만족도4").notNull().default(0),
    satisfaction5: int("만족도5").notNull().default(0),
    satisfaction6: text("만족도6").notNull(),
    submittedAt: timestamp("제출시각").defaultNow().notNull(),
    updatedAt: timestamp("수정시각").defaultNow().onUpdateNow().notNull(),
  },
  table => ({
    departmentIndex: index("학생_마음체크_학과_idx").on(table.department),
    contactConsentIndex: index("학생_마음체크_상담동의_idx").on(table.counselingContactConsent),
  }),
);

export const mallangiQuestions = mysqlTable(
  "mallangi_questions",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    sortOrder: int("sortOrder").notNull(),
    questionKo: text("questionKo").notNull(),
    questionEn: text("questionEn").notNull(),
    questionJa: text("questionJa").notNull(),
    optionsJson: text("optionsJson").notNull(),
    isActive: boolean("isActive").notNull().default(true),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => ({
    sortOrderIndex: index("mallangi_questions_sort_order_idx").on(table.sortOrder),
  }),
);

/**
 * Editable satisfaction questions. Public delivery uses a fixed 5-point Likert scale,
 * while the owner controls up to five translated question prompts.
 */
export const satisfactionQuestions = mysqlTable(
  "satisfaction_questions",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    sortOrder: int("sortOrder").notNull(),
    questionKo: text("questionKo").notNull(),
    questionEn: text("questionEn").notNull(),
    questionJa: text("questionJa").notNull(),
    questionType: mysqlEnum("questionType", ["likert", "textarea"]).notNull().default("likert"),
    isActive: boolean("isActive").notNull().default(true),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => ({
    sortOrderIndex: index("satisfaction_questions_sort_order_idx").on(table.sortOrder),
  }),
);

/** Owner-managed public-service settings such as the individual counselling application URL. */
export const stationSettings = mysqlTable("station_settings", {
  settingKey: varchar("settingKey", { length: 64 }).primaryKey(),
  settingValue: text("settingValue").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AnonymousSession = typeof anonymousSessions.$inferSelect;
export type AssessmentResponse = typeof assessmentResponses.$inferSelect;
export type StudentAssessmentProfile = typeof studentAssessmentProfiles.$inferSelect;
export type StudentMindCheckRecord = typeof studentMindCheckRecords.$inferSelect;
export type MallangiQuestion = typeof mallangiQuestions.$inferSelect;
export type SatisfactionQuestion = typeof satisfactionQuestions.$inferSelect;
export type StationSetting = typeof stationSettings.$inferSelect;

// TODO: Add your tables here
