export enum ComplaintCategory {
  CLEANING = "مخالفات نظافة",
  ROAD_OBSTRUCTION = "مخالفات إشغالات الطرق",
  ABANDONED_CAR = "سيارات مهملة",
  ABANDONED_BOAT = "طراريد مهملة",
  RUBBLE = "أنقاض",
  VIOLATION_9_87 = "مخالفات 9-87",
  STICKERS = "ملصقات",
  VEHICLE_REMOVAL = "رفع مركبات",
  STREET_VENDOR = "بائع متجول",
  WARNING = "أنذارات",
  UNDERTAKING = "تعهدات"
}

export enum VehicleType {
  CAR = "سيارة",
  BOAT = "طراد",
  OTHER = "أخرى",
  NONE = "لا يوجد"
}

export interface Complaint {
  id: string;
  date: string;
  category: ComplaintCategory;
  vehicle: VehicleType;
  details: string;
  inspectorName: string;
  centerName: string;
  complainantName: string;
  complainantPhone?: string;
  complainantSignature?: string;
  images: string[];
  status?: 'done' | 'pending';
  completionDetails?: string;
  completionImages?: string[];
  completionDate?: string;
}

export interface Correspondence {
  id: string;
  title: string;
  date: string;
  description: string;
  files: string[];
  type: 'incoming' | 'outgoing';
}

export interface Note {
  id: string;
  title: string;
  content: string;
  date: string;
  color: string;
  image?: string;
  drawing?: string;
  fontSize?: number;
  appointmentDate?: string;
}

export interface CategorizedItem {
  id: string;
  name: string;
  type: 'group_m' | 'center';
}

export interface Settings {
  inspectors: CategorizedItem[];
  centers: CategorizedItem[];
  defaultInspectorId?: string;
  defaultCenterId?: string;
}

export interface DailyStats {
  id: string;
  date: string; // "من تاريخ" - Period from
  dateTo?: string; // "إلى تاريخ" - Period to
  reportType?: 'weekly' | 'monthly'; // 'weekly' or 'monthly'
  inspectorName: string;
  centerName: string;
  fileNumber?: string; // رقم الملف
  jobTitle?: string; // الوظيفة
  shift?: string; // النوبة

  // المخالفات والتعهدات بالتفاصيل
  hygieneLawCarRemoval?: number; // مخالفات لائحة النظافة قانون 354/2023 - رفع سيارات (محضر)
  hygieneLawPublic?: number; // مخالفات لائحة النظافة قانون 354/2023 - نظافة عامة
  cleaningViolations?: number; // تيسيراً للتوافق الرجعي والتتبع
  law30_2021?: number; // قانون 30 / 2021
  violations9_87: number; // مخالفات 9 / 87
  streetVendors: number; // باعة متجولين
  warnings: number; // إنذارات
  undertakings: number; // تعهدات
  stickers: number; // ملصقات

  // السيارات المرفوعة بالتفصيل
  droppedCarsNeglected?: number; // سيارات مهملة
  droppedCarsScrap?: number; // سيارات سكراب
  droppedCarsForSale?: number; // سيارات معروضة للبيع

  // آليات العمل وعدد الدروب (خاص بالتقرير الشهري)
  tripsWaste?: number; // النفايات
  tripsBigDumper?: number; // نساف كبير
  tripsSmallDumper?: number; // نساف صغير
  tripsLorry?: number; // لوري

  // إحصائيات إضافية خارجية (غير واردة في الجدول الأساسي للتحميل)
  completedComplaints: number; // شكاوي منجزة غائبة عن الجدول الأساسي
  roadObstructions: number; // إشغالات طرق
  vehicleRemovals: number; // الإجمالي العام لرفع المركبات (للتوافق الرجعي)

  // Extra rows for multi-employee layout inside a single report card
  row2_inspectorName?: string;
  row2_jobTitle?: string;
  row2_fileNumber?: string;
  row2_hygieneLawCarRemoval?: number;
  row2_hygieneLawPublic?: number;
  row2_law30_2021?: number;
  row2_violations9_87?: number;
  row2_streetVendors?: number;
  row2_warnings?: number;
  row2_undertakings?: number;
  row2_stickers?: number;
  row2_droppedCarsNeglected?: number;
  row2_droppedCarsScrap?: number;
  row2_droppedCarsForSale?: number;

  row3_inspectorName?: string;
  row3_jobTitle?: string;
  row3_fileNumber?: string;
  row3_hygieneLawCarRemoval?: number;
  row3_hygieneLawPublic?: number;
  row3_law30_2021?: number;
  row3_violations9_87?: number;
  row3_streetVendors?: number;
  row3_warnings?: number;
  row3_undertakings?: number;
  row3_stickers?: number;
  row3_droppedCarsNeglected?: number;
  row3_droppedCarsScrap?: number;
  row3_droppedCarsForSale?: number;

  row4_inspectorName?: string;
  row4_jobTitle?: string;
  row4_fileNumber?: string;
  row4_hygieneLawCarRemoval?: number;
  row4_hygieneLawPublic?: number;
  row4_law30_2021?: number;
  row4_violations9_87?: number;
  row4_streetVendors?: number;
  row4_warnings?: number;
  row4_undertakings?: number;
  row4_stickers?: number;
  row4_droppedCarsNeglected?: number;
  row4_droppedCarsScrap?: number;
  row4_droppedCarsForSale?: number;

  row5_inspectorName?: string;
  row5_jobTitle?: string;
  row5_fileNumber?: string;
  row5_hygieneLawCarRemoval?: number;
  row5_hygieneLawPublic?: number;
  row5_law30_2021?: number;
  row5_violations9_87?: number;
  row5_streetVendors?: number;
  row5_warnings?: number;
  row5_undertakings?: number;
  row5_stickers?: number;
  row5_droppedCarsNeglected?: number;
  row5_droppedCarsScrap?: number;
  row5_droppedCarsForSale?: number;

  row6_inspectorName?: string;
  row6_jobTitle?: string;
  row6_fileNumber?: string;
  row6_hygieneLawCarRemoval?: number;
  row6_hygieneLawPublic?: number;
  row6_law30_2021?: number;
  row6_violations9_87?: number;
  row6_streetVendors?: number;
  row6_warnings?: number;
  row6_undertakings?: number;
  row6_stickers?: number;
  row6_droppedCarsNeglected?: number;
  row6_droppedCarsScrap?: number;
  row6_droppedCarsForSale?: number;

  row7_inspectorName?: string;
  row7_jobTitle?: string;
  row7_fileNumber?: string;
  row7_hygieneLawCarRemoval?: number;
  row7_hygieneLawPublic?: number;
  row7_law30_2021?: number;
  row7_violations9_87?: number;
  row7_streetVendors?: number;
  row7_warnings?: number;
  row7_undertakings?: number;
  row7_stickers?: number;
  row7_droppedCarsNeglected?: number;
  row7_droppedCarsScrap?: number;
  row7_droppedCarsForSale?: number;

  row8_inspectorName?: string;
  row8_jobTitle?: string;
  row8_fileNumber?: string;
  row8_hygieneLawCarRemoval?: number;
  row8_hygieneLawPublic?: number;
  row8_law30_2021?: number;
  row8_violations9_87?: number;
  row8_streetVendors?: number;
  row8_warnings?: number;
  row8_undertakings?: number;
  row8_stickers?: number;
  row8_droppedCarsNeglected?: number;
  row8_droppedCarsScrap?: number;
  row8_droppedCarsForSale?: number;

  row9_inspectorName?: string;
  row9_jobTitle?: string;
  row9_fileNumber?: string;
  row9_hygieneLawCarRemoval?: number;
  row9_hygieneLawPublic?: number;
  row9_law30_2021?: number;
  row9_violations9_87?: number;
  row9_streetVendors?: number;
  row9_warnings?: number;
  row9_undertakings?: number;
  row9_stickers?: number;
  row9_droppedCarsNeglected?: number;
  row9_droppedCarsScrap?: number;
  row9_droppedCarsForSale?: number;

  row10_inspectorName?: string;
  row10_jobTitle?: string;
  row10_fileNumber?: string;
  row10_hygieneLawCarRemoval?: number;
  row10_hygieneLawPublic?: number;
  row10_law30_2021?: number;
  row10_violations9_87?: number;
  row10_streetVendors?: number;
  row10_warnings?: number;
  row10_undertakings?: number;
  row10_stickers?: number;
  row10_droppedCarsNeglected?: number;
  row10_droppedCarsScrap?: number;
  row10_droppedCarsForSale?: number;

  inspectorCount?: number;
}

export interface FieldInspectionReport {
  id: string;
  date: string;
  dayOfWeek?: string;
  inspectorName: string;
  seizureNumber: string;
  centerName: string;
  phoneNumber: string;
  exitTime: string;
  returnTime: string;
  area: string;
  block: string;
  street: string;
  notes: string;
  shift?: string;
  jobTitle?: string;
  administration?: string;
  
  employeeName: string;
  
  supervisorName: string;
  supervisorDate: string;
  supervisorTime: string;
  
  sectionHeadName: string;
  sectionHeadDate: string;
  sectionHeadSignature: string; // signature fallback/text
  
  controllerName: string;
  controllerDate: string;
  controllerSignature: string;
  
  directorName: string;
  directorDate: string;
  directorSignature: string;
}

export interface CompanyAbsentWorker {
  id: string;
  civilId: string;
  fullName: string;
  notes: string;
}

export interface CompanyAbsentMachinery {
  id: string;
  type: string;
  days: number;
  notes: string;
}

export interface CompanyReport {
  id: string;
  date: string;
  companyName: string;
  inspectorName: string;
  centerName: string;
  absentWorkers: CompanyAbsentWorker[];
  absentMachinery: CompanyAbsentMachinery[];
  generalNotes: string;
  image?: string;
}


