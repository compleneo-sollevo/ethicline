// Auth
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
}

export interface LoginResponse {
  access_token: string | null;
  token_type: string | null;
  requires_2fa: boolean;
  requires_2fa_setup: boolean;
  temp_token: string | null;
}

export interface Token {
  access_token: string;
  token_type: string;
}

export interface TwoFactorSetupResponse {
  secret: string;
  qr_code_base64: string;
  otpauth_uri: string;
}

export interface TwoFactorEnableResponse {
  access_token: string;
  token_type: string;
  recovery_codes: string[];
}

export interface Role {
  id: number;
  key: string;
  name: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  status: string;
  totp_enabled: boolean;
  roles: Role[];
  permissions?: string[];
  created_at: string;
  last_login_at: string | null;
}

export interface UserInviteRequest {
  email: string;
  full_name: string;
  role_key: string;
}

export interface UserUpdate {
  full_name?: string;
  role_keys?: string[];
}

export interface UserStatusUpdate {
  status: "active" | "disabled";
}

export interface PasswordResetRequest {
  temporary_password: string;
}

export interface Permission {
  id: number;
  name: string;
  category: string;
  description: string | null;
}

export interface RoleWithPermissions {
  id: number;
  key: string;
  name: string;
  description: string | null;
  created_at: string;
  permissions: Permission[];
}

export interface RoleCreate {
  key: string;
  name: string;
  description?: string;
  permission_ids: number[];
}

export interface RoleUpdate {
  name?: string;
  description?: string;
  permission_ids?: number[];
}

export interface AuditLogEntry {
  id: number;
  actor_id: string | null;
  actor_name: string | null;
  actor_email: string | null;
  action: string;
  target_type: string;
  target_id: string;
  target_label: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}

export interface AuditLogListResponse {
  items: AuditLogEntry[];
  total: number;
}

// Data
export interface Customer {
  id: number;
  kunden_nr: number;
  name: string;
  ic: boolean;
  staat: string | null;
  branche: string | null;
  branche_name: string | null;
  abc_klasse: string | null;
  haupt_vertreter: number | null;
  region: string | null;
  vertreter_name: string | null;
}

export type AbcKlasse = "A" | "B" | "C" | "-";

export interface Part {
  id: number;
  teile_nr: string;
  suchbegriff: string | null;
  selektion: string | null;
  sparte: string | null;
  sparte_teil: string | null;
  sparte_teil_name: string | null;
  teile_grp: string | null;
  produkt_familie: string | null;
  list_price: string | null;
  manufacturing_cost: string | null;
  launch_date: string | null;
  abc_klasse: AbcKlasse | null;
  is_archived: boolean;
  created_at: string;
}

export interface PartCreate {
  teile_nr: string;
  suchbegriff?: string | null;
  sparte?: string | null;
  produkt_familie?: string | null;
  list_price?: string | number | null;
  manufacturing_cost?: string | number | null;
  launch_date?: string | null;
  abc_klasse?: AbcKlasse;
}

export interface PartUpdate {
  suchbegriff?: string | null;
  sparte?: string | null;
  produkt_familie?: string | null;
  list_price?: string | number | null;
  manufacturing_cost?: string | number | null;
  launch_date?: string | null;
  abc_klasse?: AbcKlasse | null;
}

export interface SalesActual {
  id: number;
  mandant: string | null;
  beleg_jahr: number;
  beleg_monat: string;
  beleg_jahr_monat: string | null;
  customer: Customer | null;
  part: Part | null;
  beleg_nr: number | null;
  beleg_art: string | null;
  waehrung: string | null;
  konto: number | null;
  preis_faktor: string | null;
  menge_pos: string | null;
  gesamt_preis_pos_n: string | null;
  preis_n: string | null;
  skonto: string | null;
  ktb_preis_n: string | null;
  abc_teil: string | null;
  created_at: string;
}

export interface Budget {
  id: number;
  beleg_jahr: number;
  beleg_monat: number;
  mandant: string | null;
  customer: Customer | null;
  part: Part | null;
  vertreter_name: string | null;
  anzahl_b: string | null;
  umsatz_b: string | null;
  preis_n_b: string | null;
  created_at: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  skip: number;
  limit: number;
}

export interface SalesFilters {
  beleg_jahr?: number | null;
  beleg_monat?: string | null;
  customer_id?: number | null;
  part_id?: number | null;
}

export interface BudgetFilters {
  beleg_jahr?: number | null;
  beleg_monat?: number | null;
  customer_id?: number | null;
  part_id?: number | null;
}

// Analysis
export interface CustomerAnalysisRow {
  customer_id: number;
  kunden_nr: number;
  name: string;
  abc_klasse: string | null;
  branche: string | null;
  branche_name: string | null;
  region: string | null;
  staat: string | null;
  vertreter_name: string | null;
  umsatz_ist: string;
  umsatz_budget: string;
  abweichung_pct: string | null;
  menge_ist: string;
  menge_budget: string;
  avg_preis: string | null;
  positionen_count: number;
  monthly: MonthlyData[];
}

export interface AnalysisSummary {
  gesamt_umsatz: string;
  anzahl_kunden: number;
  avg_umsatz_pro_kunde: string;
  budget_abweichung_pct: string | null;
  gesamt_budget: string;
  gesamt_menge: string;
  gesamt_menge_budget: string;
}

export interface CustomerAnalysisResponse {
  items: CustomerAnalysisRow[];
  summary: AnalysisSummary;
}

export interface FilterOptions {
  vertreter_names: string[];
  abc_klassen: string[];
  branchen: string[];
  regionen: string[];
  staaten: string[];
}

export interface AnalysisFilters {
  beleg_jahr?: number | null;
  beleg_monat?: string | null;
  vertreter_name?: string | null;
  abc_klasse?: string | null;
  branche?: string | null;
  region?: string | null;
  staat?: string | null;
  sort_by?: string;
  sort_dir?: string;
}

// Customer Detail (hierarchical drill-down)
export interface MonthlyData {
  monat: number;
  monat_label: string;
  umsatz_ist: string;
  umsatz_budget: string;
  menge_ist: string;
  menge_budget: string;
}

export interface ArtikelDetail {
  part_id: number;
  teile_nr: string;
  suchbegriff: string | null;
  selektion: string | null;
  umsatz_ist: string;
  umsatz_budget: string;
  abweichung_pct: string | null;
  menge_ist: string;
  menge_budget: string;
  avg_preis: string | null;
  positionen: number;
  monthly: MonthlyData[];
}

export interface ProduktFamilieDetail {
  produkt_familie: string;
  umsatz_ist: string;
  umsatz_budget: string;
  abweichung_pct: string | null;
  menge_ist: string;
  menge_budget: string;
  avg_preis: string | null;
  positionen: number;
  artikel: ArtikelDetail[];
}

export interface SparteDetail {
  sparte: string;
  umsatz_ist: string;
  umsatz_budget: string;
  abweichung_pct: string | null;
  menge_ist: string;
  menge_budget: string;
  avg_preis: string | null;
  positionen: number;
  produkt_familien: ProduktFamilieDetail[];
}

export interface CustomerDetailSummary {
  umsatz_ist: string;
  umsatz_budget: string;
  abweichung_pct: string | null;
  menge_ist: string;
  menge_budget: string;
  avg_preis: string | null;
}

export interface CustomerInfo {
  customer_id: number;
  kunden_nr: number;
  name: string;
  abc_klasse: string | null;
  branche: string | null;
  branche_name: string | null;
  region: string | null;
  staat: string | null;
  vertreter_name: string | null;
}

export interface CustomerDetailResponse {
  customer: CustomerInfo;
  summary: CustomerDetailSummary;
  sparten: SparteDetail[];
}

// Planning
export interface PlanningCustomerRow {
  customer_id: number;
  kunden_nr: number;
  name: string;
  abc_klasse: string | null;
  branche: string | null;
  branche_name: string | null;
  region: string | null;
  staat: string | null;
  vertreter_name: string | null;
  umsatz_vj: string;
  menge_vj: string;
  umsatz_plan: string;
  menge_plan: string;
  umsatz_ist: string;
  menge_ist: string;
  plan_vs_vj_pct: string | null;
  ist_vs_plan_pct: string | null;
}

export interface PlanningSummary {
  anzahl_kunden: number;
  gesamt_umsatz_vj: string;
  gesamt_umsatz_plan: string;
  gesamt_umsatz_ist: string;
  gesamt_menge_vj: string;
  gesamt_menge_plan: string;
  gesamt_menge_ist: string;
  plan_vs_vj_pct: string | null;
  ist_vs_plan_pct: string | null;
}

export interface PlanningOverviewResponse {
  items: PlanningCustomerRow[];
  summary: PlanningSummary;
}

export interface PlanMonthlyData {
  monat: number;
  monat_label: string;
  umsatz_vj: string;
  menge_vj: string;
  menge_plan: string;
  preis_plan: string;
  umsatz_plan: string;
  umsatz_ist: string;
  menge_ist: string;
  is_locked: boolean;
}

export interface PlanArtikelDetail {
  part_id: number;
  teile_nr: string;
  suchbegriff: string | null;
  selektion: string | null;
  umsatz_vj: string;
  menge_vj: string;
  avg_preis_vj: string | null;
  menge_plan: string;
  preis_plan: string;
  umsatz_plan: string;
  verteilungs_typ: string;
  umsatz_ist: string;
  menge_ist: string;
  monthly: PlanMonthlyData[];
}

export interface PlanProduktFamilieDetail {
  produkt_familie: string;
  umsatz_vj: string;
  menge_vj: string;
  umsatz_plan: string;
  menge_plan: string;
  umsatz_ist: string;
  menge_ist: string;
  artikel: PlanArtikelDetail[];
}

export interface PlanSparteDetail {
  sparte: string;
  umsatz_vj: string;
  menge_vj: string;
  umsatz_plan: string;
  menge_plan: string;
  umsatz_ist: string;
  menge_ist: string;
  produkt_familien: PlanProduktFamilieDetail[];
}

export interface PlanningDetailSummary {
  umsatz_vj: string;
  menge_vj: string;
  umsatz_plan: string;
  menge_plan: string;
  umsatz_ist: string;
  menge_ist: string;
}

export interface PlanningDetailResponse {
  customer: CustomerInfo;
  summary: PlanningDetailSummary;
  sparten: PlanSparteDetail[];
}

export interface PlanArtikelSaveRequest {
  menge: string;
  preis: string;
  verteilungs_typ: string;
  monthly_menge?: string[];
}

export interface PlanArtikelSaveResponse {
  success: boolean;
  umsatz_plan: string;
}

export interface PlanningFilters {
  vertreter_name?: string | null;
  abc_klasse?: string | null;
  branche?: string | null;
  region?: string | null;
  staat?: string | null;
  sort_by?: string;
  sort_dir?: string;
}

// Plan Header
export interface PlanHeader {
  id: number;
  name: string;
  plan_type: "rolling_forecast" | "budget";
  beleg_jahr: number;
  status: "entwurf" | "freigegeben" | "gesperrt" | "archiv";
  created_by: string;
  created_by_name: string | null;
  created_at: string;
  updated_at: string;
  anzahl_kunden: number | null;
  gesamt_umsatz: string | null;
}

export interface PlanHeaderListResponse {
  items: PlanHeader[];
}

export interface PlanHeaderCreate {
  name: string;
  plan_type: "rolling_forecast" | "budget";
  beleg_jahr: number;
  status?: string;
  copy_vj?: boolean;
}

export interface PlanHeaderUpdate {
  name?: string;
  status?: string;
}

// Planning Batch Operations
export interface BatchPriceRequest {
  part_id: number;
  adjustment: string;
  adjustment_type: "absolute" | "percent";
}

export interface BatchPriceResponse {
  affected_customers: number;
  affected_rows: number;
}

export interface BatchCopyVjRequest {
  adjustment_pct: number;
  customer_ids?: number[] | null;
  part_ids?: number[] | null;
}

export interface BatchCopyVjResponse {
  affected_customers: number;
  affected_articles: number;
  total_rows: number;
}

export interface TopDownDistributeRequest {
  level: "sparte" | "produkt_familie";
  level_value: string;
  target_umsatz: string;
  parent_sparte?: string | null;
}

export interface TopDownDistributeResponse {
  distributed_articles: number;
  total_umsatz_plan: string;
}

// Planning Validation
export interface ValidationMissingCustomer {
  customer_id: number;
  name: string;
  umsatz_vj: string;
}

export interface ValidationCompleteness {
  total_customers_with_vj: number;
  customers_with_plan: number;
  completeness_pct: number;
  missing_customers: ValidationMissingCustomer[];
}

export interface ValidationIssue {
  type: string;
  severity: "error" | "warning";
  customer_id: number;
  customer_name: string;
  part_id?: number | null;
  teile_nr?: string | null;
  message: string;
  plan_value?: string | null;
  vj_value?: string | null;
  delta_pct?: number | null;
}

export interface ValidationSummary {
  total_warnings: number;
  total_errors: number;
  is_valid: boolean;
}

export interface ValidationResponse {
  completeness: ValidationCompleteness;
  outliers: ValidationIssue[];
  price_warnings: ValidationIssue[];
  consistency_warnings: ValidationIssue[];
  summary: ValidationSummary;
}

// Comparison (Analyse)
export interface ComparisonMonthlyData {
  monat: number;
  monat_label: string;
  umsatz_a: string;
  menge_a: string;
  umsatz_b: string;
  menge_b: string;
}

export interface ComparisonCustomerRow {
  customer_id: number;
  kunden_nr: number;
  name: string;
  abc_klasse: string | null;
  branche: string | null;
  branche_name: string | null;
  region: string | null;
  staat: string | null;
  vertreter_name: string | null;
  monthly: ComparisonMonthlyData[];
  gesamt_umsatz_a: string;
  gesamt_menge_a: string;
  gesamt_umsatz_b: string;
  gesamt_menge_b: string;
  abweichung_pct: string | null;
}

export interface ComparisonOverviewResponse {
  items: ComparisonCustomerRow[];
  beleg_jahr: number;
  source_a_label: string;
}

export interface ComparisonArtikelDetail {
  part_id: number;
  teile_nr: string;
  suchbegriff: string | null;
  selektion: string | null;
  monthly: ComparisonMonthlyData[];
  gesamt_umsatz_a: string;
  gesamt_menge_a: string;
  gesamt_umsatz_b: string;
  gesamt_menge_b: string;
  abweichung_pct: string | null;
}

export interface ComparisonProduktFamilieDetail {
  produkt_familie: string;
  monthly: ComparisonMonthlyData[];
  gesamt_umsatz_a: string;
  gesamt_menge_a: string;
  gesamt_umsatz_b: string;
  gesamt_menge_b: string;
  abweichung_pct: string | null;
  artikel: ComparisonArtikelDetail[];
}

export interface ComparisonSparteDetail {
  sparte: string;
  monthly: ComparisonMonthlyData[];
  gesamt_umsatz_a: string;
  gesamt_menge_a: string;
  gesamt_umsatz_b: string;
  gesamt_menge_b: string;
  abweichung_pct: string | null;
  produkt_familien: ComparisonProduktFamilieDetail[];
}

export interface ComparisonCustomerDetailResponse {
  customer: CustomerInfo;
  monthly: ComparisonMonthlyData[];
  gesamt_umsatz_a: string;
  gesamt_menge_a: string;
  gesamt_umsatz_b: string;
  gesamt_menge_b: string;
  abweichung_pct: string | null;
  sparten: ComparisonSparteDetail[];
}

// Cockpit types
export interface CockpitKPIs {
  ist_total: string;
  budget_total: string;
  zielerreichung_pct: string | null;
  ist_vj_total: string;
  vj_veraenderung_pct: string | null;
}

export interface CockpitMonthlyData {
  monat: number;
  typ: "ist" | "prognose";
  wert: string;
  budget: string;
  vj: string;
}

export interface CockpitForecast {
  year_end_prognose: string;
  methode: string;
  gap_to_budget: string | null;
  required_monthly_avg: string | null;
  budget_reachable: boolean | null;
  monthly: CockpitMonthlyData[];
}

export interface CockpitCustomerRow {
  customer_id: number;
  kunden_nr: number;
  name: string;
  ist: string;
  budget: string;
  delta_pct: string | null;
}

export interface CockpitTopKunden {
  aufsteiger: CockpitCustomerRow[];
  sorgenkinder: CockpitCustomerRow[];
}

export interface CockpitOverviewResponse {
  year: number;
  current_month: number;
  kpis: CockpitKPIs;
  forecast: CockpitForecast;
  top_kunden: CockpitTopKunden;
}
