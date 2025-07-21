/**
 * Type definitions for specification-based development documents
 */

// Core specification document types
export interface SpecificationDocument {
  id: string;
  projectId: string;
  type: SpecificationDocumentType;
  title: string;
  content: string;
  version: number;
  status: DocumentStatus;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastModifiedBy: string;
  metadata: DocumentMetadata;
}

export type SpecificationDocumentType = 'requirements' | 'design' | 'tasks';

export type DocumentStatus = 'draft' | 'review' | 'approved' | 'rejected' | 'archived';

export interface DocumentMetadata {
  wordCount: number;
  estimatedReadTime: number;
  completionPercentage: number;
  validationResults: ValidationResult[];
  tags: string[];
  collaborators: string[];
}

// Requirements document specific types
export interface RequirementDocument extends SpecificationDocument {
  type: 'requirements';
  userStories: UserStory[];
  acceptanceCriteria: AcceptanceCriteria[];
  businessRules: BusinessRule[];
  constraints: Constraint[];
}

export interface UserStory {
  id: string;
  title: string;
  description: string;
  role: string;
  goal: string;
  benefit: string;
  priority: Priority;
  estimatedEffort: number;
  acceptanceCriteria: AcceptanceCriteria[];
  tags: string[];
}

export interface AcceptanceCriteria {
  id: string;
  userStoryId: string;
  description: string;
  format: 'EARS' | 'GIVEN_WHEN_THEN' | 'CHECKLIST';
  condition?: string;
  event?: string;
  response: string;
  priority: Priority;
  testable: boolean;
}

export interface BusinessRule {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: Priority;
  source: string;
}

export interface Constraint {
  id: string;
  type: ConstraintType;
  description: string;
  impact: string;
  mitigation?: string;
}

export type ConstraintType = 'technical' | 'business' | 'regulatory' | 'performance' | 'security';

// Design document specific types
export interface DesignDocument extends SpecificationDocument {
  type: 'design';
  architecture: ArchitectureSection;
  components: ComponentSpecification[];
  dataModels: DataModel[];
  interfaces: InterfaceSpecification[];
  diagrams: Diagram[];
  testingStrategy: TestingStrategy;
}

export interface ArchitectureSection {
  overview: string;
  patterns: ArchitecturalPattern[];
  technologies: TechnologyChoice[];
  constraints: ArchitecturalConstraint[];
  decisions: ArchitecturalDecision[];
}

export interface ArchitecturalPattern {
  name: string;
  description: string;
  rationale: string;
  tradeoffs: string[];
}

export interface TechnologyChoice {
  category: string;
  technology: string;
  version?: string;
  rationale: string;
  alternatives: string[];
}

export interface ArchitecturalConstraint {
  type: string;
  description: string;
  impact: string;
}

export interface ArchitecturalDecision {
  id: string;
  title: string;
  status: 'proposed' | 'accepted' | 'deprecated' | 'superseded';
  context: string;
  decision: string;
  consequences: string[];
  date: Date;
}

export interface ComponentSpecification {
  id: string;
  name: string;
  type: ComponentType;
  description: string;
  responsibilities: string[];
  interfaces: string[];
  dependencies: string[];
  constraints: string[];
}

export type ComponentType = 'service' | 'repository' | 'controller' | 'model' | 'utility' | 'middleware';

export interface DataModel {
  id: string;
  name: string;
  type: 'entity' | 'value_object' | 'aggregate' | 'dto';
  description: string;
  attributes: DataAttribute[];
  relationships: DataRelationship[];
  constraints: DataConstraint[];
}

export interface DataAttribute {
  name: string;
  type: string;
  required: boolean;
  description: string;
  validation?: string[];
}

export interface DataRelationship {
  type: 'one_to_one' | 'one_to_many' | 'many_to_many';
  target: string;
  description: string;
  cascading?: boolean;
}

export interface DataConstraint {
  type: 'unique' | 'foreign_key' | 'check' | 'not_null';
  description: string;
  fields: string[];
}

export interface InterfaceSpecification {
  id: string;
  name: string;
  type: 'api' | 'event' | 'message' | 'database';
  description: string;
  methods: InterfaceMethod[];
  events?: InterfaceEvent[];
}

export interface InterfaceMethod {
  name: string;
  description: string;
  parameters: Parameter[];
  returnType: string;
  exceptions: string[];
}

export interface InterfaceEvent {
  name: string;
  description: string;
  payload: Parameter[];
  triggers: string[];
}

export interface Parameter {
  name: string;
  type: string;
  required: boolean;
  description: string;
  validation?: string[];
}

export interface Diagram {
  id: string;
  type: DiagramType;
  title: string;
  description: string;
  content: string; // Mermaid syntax or other diagram format
  metadata: DiagramMetadata;
}

export type DiagramType = 'sequence' | 'class' | 'component' | 'deployment' | 'flow' | 'entity_relationship';

export interface DiagramMetadata {
  format: 'mermaid' | 'plantuml' | 'drawio';
  version: string;
  lastUpdated: Date;
}

export interface TestingStrategy {
  overview: string;
  levels: TestLevel[];
  tools: TestingTool[];
  coverage: CoverageRequirement[];
  automation: AutomationStrategy;
}

export interface TestLevel {
  level: 'unit' | 'integration' | 'system' | 'acceptance';
  description: string;
  scope: string[];
  tools: string[];
  coverage: number;
}

export interface TestingTool {
  name: string;
  purpose: string;
  configuration: string;
}

export interface CoverageRequirement {
  type: 'line' | 'branch' | 'function' | 'statement';
  minimum: number;
  target: number;
}

export interface AutomationStrategy {
  cicd: boolean;
  triggers: string[];
  reporting: string[];
}

// Task document specific types
export interface TaskDocument extends SpecificationDocument {
  type: 'tasks';
  tasks: Task[];
  dependencies: TaskDependency[];
  milestones: Milestone[];
  estimations: ProjectEstimation;
}

export interface Task {
  id: string;
  number: string; // e.g., "1.1", "2.3"
  title: string;
  description: string;
  type: TaskType;
  status: TaskStatus;
  priority: Priority;
  estimatedHours: number;
  actualHours?: number;
  assignee?: string;
  requirements: string[]; // References to requirement IDs
  dependencies: string[]; // References to other task IDs
  subtasks: Task[];
  acceptanceCriteria: string[];
  notes: string[];
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export type TaskType = 'development' | 'testing' | 'documentation' | 'research' | 'review' | 'deployment';

export type TaskStatus = 'not_started' | 'in_progress' | 'blocked' | 'review' | 'completed' | 'cancelled';

export interface TaskDependency {
  fromTaskId: string;
  toTaskId: string;
  type: DependencyType;
  description?: string;
}

export type DependencyType = 'finish_to_start' | 'start_to_start' | 'finish_to_finish' | 'start_to_finish';

export interface Milestone {
  id: string;
  name: string;
  description: string;
  targetDate: Date;
  actualDate?: Date;
  status: MilestoneStatus;
  tasks: string[]; // Task IDs
  criteria: string[];
}

export type MilestoneStatus = 'planned' | 'in_progress' | 'completed' | 'delayed' | 'cancelled';

export interface ProjectEstimation {
  totalHours: number;
  totalTasks: number;
  completedTasks: number;
  completedHours: number;
  estimatedCompletion: Date;
  confidence: number; // 0-100
  methodology: EstimationMethodology;
}

export interface EstimationMethodology {
  technique: 'story_points' | 'hours' | 'tshirt_sizes' | 'planning_poker';
  baselineData?: string;
  assumptions: string[];
}

// Common types
export type Priority = 'low' | 'medium' | 'high' | 'critical';

export interface ValidationResult {
  id: string;
  type: ValidationType;
  severity: ValidationSeverity;
  message: string;
  location?: ValidationLocation;
  suggestion?: string;
  rule: string;
}

export type ValidationType = 'format' | 'completeness' | 'consistency' | 'quality' | 'methodology';

export type ValidationSeverity = 'error' | 'warning' | 'info' | 'suggestion';

export interface ValidationLocation {
  line?: number;
  column?: number;
  section?: string;
  element?: string;
}

// Specification project types
export interface SpecificationProject {
  id: string;
  name: string;
  description: string;
  domain: string;
  complexity: ProjectComplexity;
  methodology: MethodologyType;
  status: ProjectStatus;
  currentPhase: SpecificationPhase;
  documents: SpecificationDocument[];
  team: ProjectMember[];
  settings: ProjectSettings;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export type ProjectComplexity = 'simple' | 'moderate' | 'complex' | 'enterprise';

export type MethodologyType = 'waterfall' | 'agile' | 'lean' | 'hybrid';

export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';

export type SpecificationPhase = 'requirements' | 'design' | 'tasks' | 'implementation' | 'review' | 'completed';

export interface ProjectMember {
  userId: string;
  role: ProjectRole;
  permissions: Permission[];
  joinedAt: Date;
}

export type ProjectRole = 'owner' | 'lead' | 'contributor' | 'reviewer' | 'observer';

export type Permission = 'read' | 'write' | 'review' | 'approve' | 'admin';

export interface ProjectSettings {
  visibility: 'private' | 'team' | 'public';
  collaboration: CollaborationSettings;
  validation: ValidationSettings;
  templates: TemplateSettings;
  notifications: NotificationSettings;
}

export interface CollaborationSettings {
  realTimeEditing: boolean;
  commentingEnabled: boolean;
  reviewWorkflow: boolean;
  approvalRequired: boolean;
  maxCollaborators: number;
}

export interface ValidationSettings {
  autoValidation: boolean;
  validationRules: string[];
  customRules: CustomValidationRule[];
  strictMode: boolean;
}

export interface CustomValidationRule {
  id: string;
  name: string;
  description: string;
  pattern: string;
  severity: ValidationSeverity;
  enabled: boolean;
}

export interface TemplateSettings {
  defaultTemplates: string[];
  customTemplates: string[];
  templateValidation: boolean;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  inAppNotifications: boolean;
  webhooks: WebhookConfig[];
}

export interface WebhookConfig {
  url: string;
  events: string[];
  enabled: boolean;
}

// Template and example types
export interface SpecificationTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  type: SpecificationDocumentType;
  content: string;
  variables: TemplateVariable[];
  examples: SpecificationExample[];
  metadata: TemplateMetadata;
}

export type TemplateCategory = 'web_application' | 'mobile_app' | 'api' | 'microservice' | 'data_pipeline' | 'ml_model' | 'generic';

export interface TemplateVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description: string;
  required: boolean;
  defaultValue?: any;
  validation?: string;
}

export interface SpecificationExample {
  id: string;
  name: string;
  description: string;
  domain: string;
  complexity: ProjectComplexity;
  content: string;
  annotations: ExampleAnnotation[];
  bestPractices: string[];
}

export interface ExampleAnnotation {
  location: ValidationLocation;
  type: 'best_practice' | 'common_mistake' | 'explanation' | 'alternative';
  content: string;
  references: string[];
}

export interface TemplateMetadata {
  version: string;
  author: string;
  createdAt: Date;
  updatedAt: Date;
  usageCount: number;
  rating: number;
  tags: string[];
  prerequisites: string[];
}

// AI and analysis types
export interface AIReviewResult {
  documentId: string;
  analysisId: string;
  timestamp: Date;
  overallScore: number;
  sections: SectionAnalysis[];
  suggestions: AISuggestion[];
  bestPractices: BestPracticeRecommendation[];
  qualityMetrics: QualityMetric[];
}

export interface SectionAnalysis {
  section: string;
  score: number;
  issues: AIIssue[];
  strengths: string[];
  improvements: string[];
}

export interface AIIssue {
  type: string;
  severity: ValidationSeverity;
  description: string;
  location: ValidationLocation;
  suggestion: string;
  confidence: number;
}

export interface AISuggestion {
  id: string;
  type: SuggestionType;
  title: string;
  description: string;
  impact: ImpactLevel;
  effort: EffortLevel;
  priority: Priority;
  examples: string[];
  references: string[];
}

export type SuggestionType = 'completeness' | 'clarity' | 'consistency' | 'best_practice' | 'methodology' | 'quality';

export type ImpactLevel = 'low' | 'medium' | 'high' | 'critical';

export type EffortLevel = 'minimal' | 'low' | 'medium' | 'high' | 'significant';

export interface BestPracticeRecommendation {
  practice: string;
  description: string;
  rationale: string;
  examples: string[];
  applicability: string[];
}

export interface QualityMetric {
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: 'improving' | 'stable' | 'declining';
  description: string;
}

// Collaboration types
export interface CollaborationSession {
  sessionId: string;
  documentId: string;
  participants: Participant[];
  startTime: Date;
  endTime?: Date;
  changes: DocumentChange[];
  comments: Comment[];
  status: SessionStatus;
}

export interface Participant {
  userId: string;
  username: string;
  role: ProjectRole;
  joinTime: Date;
  leaveTime?: Date;
  isActive: boolean;
  cursor?: CursorPosition;
}

export interface CursorPosition {
  line: number;
  column: number;
  selection?: TextSelection;
}

export interface TextSelection {
  startLine: number;
  startColumn: number;
  endLine: number;
  endColumn: number;
}

export interface DocumentChange {
  id: string;
  userId: string;
  timestamp: Date;
  type: ChangeType;
  location: ValidationLocation;
  oldContent: string;
  newContent: string;
  metadata: ChangeMetadata;
}

export type ChangeType = 'insert' | 'delete' | 'replace' | 'format' | 'move';

export interface ChangeMetadata {
  source: 'user' | 'ai' | 'template' | 'import';
  confidence?: number;
  reasoning?: string;
}

export interface Comment {
  id: string;
  documentId: string;
  userId: string;
  username: string;
  content: string;
  location: ValidationLocation;
  type: CommentType;
  status: CommentStatus;
  replies: CommentReply[];
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  resolvedBy?: string;
}

export type CommentType = 'general' | 'suggestion' | 'question' | 'issue' | 'approval' | 'rejection';

export type CommentStatus = 'open' | 'resolved' | 'dismissed';

export interface CommentReply {
  id: string;
  userId: string;
  username: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export type SessionStatus = 'active' | 'paused' | 'ended' | 'error';

// Learning and progress types
export interface MethodologyLesson {
  id: string;
  title: string;
  description: string;
  category: LessonCategory;
  difficulty: DifficultyLevel;
  duration: number; // minutes
  objectives: string[];
  prerequisites: string[];
  content: LessonContent;
  exercises: Exercise[];
  resources: Resource[];
  metadata: LessonMetadata;
}

export type LessonCategory = 'requirements' | 'design' | 'tasks' | 'methodology' | 'tools' | 'best_practices';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface LessonContent {
  sections: LessonSection[];
  examples: LessonExample[];
  interactiveElements: InteractiveElement[];
}

export interface LessonSection {
  id: string;
  title: string;
  content: string;
  type: SectionType;
  order: number;
}

export type SectionType = 'text' | 'code' | 'diagram' | 'video' | 'interactive' | 'quiz';

export interface LessonExample {
  id: string;
  title: string;
  description: string;
  content: string;
  annotations: ExampleAnnotation[];
  type: ExampleType;
}

export type ExampleType = 'good' | 'bad' | 'before_after' | 'comparison' | 'template';

export interface InteractiveElement {
  id: string;
  type: InteractiveType;
  title: string;
  description: string;
  configuration: any;
  validation: ValidationRule[];
}

export type InteractiveType = 'editor' | 'quiz' | 'drag_drop' | 'form' | 'simulation' | 'assessment';

export interface ValidationRule {
  rule: string;
  message: string;
  severity: ValidationSeverity;
}

export interface Exercise {
  id: string;
  title: string;
  description: string;
  type: ExerciseType;
  difficulty: DifficultyLevel;
  estimatedTime: number;
  instructions: string[];
  startingCode?: string;
  solution?: string;
  hints: Hint[];
  validation: ExerciseValidation;
}

export type ExerciseType = 'coding' | 'specification' | 'review' | 'analysis' | 'design' | 'planning';

export interface Hint {
  id: string;
  content: string;
  order: number;
  unlockCondition?: string;
}

export interface ExerciseValidation {
  automated: boolean;
  criteria: ValidationCriteria[];
  rubric?: AssessmentRubric;
}

export interface ValidationCriteria {
  criterion: string;
  weight: number;
  validator: string;
  threshold: number;
}

export interface AssessmentRubric {
  criteria: RubricCriterion[];
  scoring: ScoringMethod;
}

export interface RubricCriterion {
  name: string;
  description: string;
  levels: RubricLevel[];
  weight: number;
}

export interface RubricLevel {
  level: string;
  description: string;
  points: number;
}

export type ScoringMethod = 'weighted_average' | 'total_points' | 'percentage' | 'pass_fail';

export interface Resource {
  id: string;
  title: string;
  type: ResourceType;
  url?: string;
  content?: string;
  description: string;
  tags: string[];
}

export type ResourceType = 'article' | 'video' | 'book' | 'tool' | 'template' | 'example' | 'reference';

export interface LessonMetadata {
  version: string;
  author: string;
  createdAt: Date;
  updatedAt: Date;
  completionRate: number;
  averageRating: number;
  reviewCount: number;
  tags: string[];
  language: string;
}

export interface LearningProgress {
  userId: string;
  lessonId: string;
  status: ProgressStatus;
  startedAt: Date;
  completedAt?: Date;
  timeSpent: number; // minutes
  score?: number;
  attempts: number;
  currentSection: string;
  completedSections: string[];
  exerciseResults: ExerciseResult[];
  notes: string[];
}

export type ProgressStatus = 'not_started' | 'in_progress' | 'completed' | 'abandoned';

export interface ExerciseResult {
  exerciseId: string;
  status: ExerciseStatus;
  score: number;
  attempts: number;
  timeSpent: number;
  feedback: string[];
  submittedAt: Date;
}

export type ExerciseStatus = 'not_attempted' | 'in_progress' | 'completed' | 'failed' | 'skipped';

export interface SpecificationMetrics {
  userId: string;
  period: MetricsPeriod;
  projectsCreated: number;
  documentsCreated: number;
  averageQualityScore: number;
  methodologyAdherence: number;
  collaborationScore: number;
  skillProgression: SkillProgression[];
  achievements: Achievement[];
  trends: MetricTrend[];
}

export type MetricsPeriod = 'week' | 'month' | 'quarter' | 'year' | 'all_time';

export interface SkillProgression {
  skill: SpecificationSkill;
  level: SkillLevel;
  progress: number; // 0-100
  lastAssessment: Date;
  trajectory: 'improving' | 'stable' | 'declining';
}

export type SpecificationSkill = 'requirements_writing' | 'design_documentation' | 'task_breakdown' | 'methodology_application' | 'collaboration' | 'quality_assurance';

export type SkillLevel = 'novice' | 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'master';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  level: AchievementLevel;
  earnedAt: Date;
  criteria: string[];
}

export type AchievementCategory = 'quality' | 'productivity' | 'collaboration' | 'methodology' | 'learning' | 'mentoring';

export type AchievementLevel = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export interface MetricTrend {
  metric: string;
  period: MetricsPeriod;
  values: TrendDataPoint[];
  trend: 'up' | 'down' | 'stable';
  changePercentage: number;
}

export interface TrendDataPoint {
  date: Date;
  value: number;
  context?: string;
}