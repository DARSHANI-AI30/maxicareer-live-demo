import fs from 'node:fs';
import path from 'node:path';
import { MongoClient, Db, Collection } from 'mongodb';

export interface StudentDocument {
  _id: string;
  name: string;
  email: string;
  phone: string;
  city?: string;
  profession: 'school' | 'college' | 'fresher' | 'working_professional';
  professionLabel: string;
  institutionOrCompany: string;
  detail: string;
  planName: string;
  planPrice: number;
  selectedAddOns: string[];
  status: 'pending' | 'contacted' | 'enrolled' | 'completed' | 'cancelled';
  mentorAssigned: string;
  notes: string;
  academicDetails?: Record<string, string | number | boolean | undefined>;
  roadmapProgress: number;
  registeredDate: string;
  createdAt: string;
  updatedAt: string;
  source: 'portal_registration' | 'quick_consultation' | 'synthetic_seed' | 'admin_manual';
}

export interface DatabaseStats {
  mode: 'synthetic' | 'mongodb';
  status: 'connected' | 'disconnected' | 'connecting' | 'fallback_active';
  dbName: string;
  collection: string;
  totalStudents: number;
  totalPipelineRevenue: number;
  cohortBreakdown: Record<string, number>;
  statusBreakdown: Record<string, number>;
  uriHost: string;
  lastPingMs: number;
  isRealMongo: boolean;
  version: string;
}

// Generate valid 24-char hex MongoDB ObjectId
export function generateObjectId(): string {
  const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
  const machineId = Math.random().toString(16).substring(2, 8).padEnd(6, '0');
  const processId = Math.random().toString(16).substring(2, 6).padEnd(4, '0');
  const counter = Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0');
  return (timestamp + machineId + processId + counter).substring(0, 24);
}

// 14 Rich, realistic synthetic student profiles for Maxicareer
export const INITIAL_SYNTHETIC_STUDENTS: StudentDocument[] = [
  {
    _id: '6700c1e8a93e5b4f2c000001',
    name: 'Ananya Rao',
    email: 'ananya.rao@gmail.com',
    phone: '+91 9845012345',
    city: 'Bengaluru, Karnataka',
    profession: 'school',
    professionLabel: 'School Student (12th Grade)',
    institutionOrCompany: 'Delhi Public School (DPS Bangalore South)',
    detail: 'Class 12 Science (PCM). Target: JEE Advanced & IISc Bangalore Research.',
    planName: 'Step-Ready Career Program (School)',
    planPrice: 4999,
    selectedAddOns: ['1:1 Career Counseling Session', 'Entrance & Stream Roadmap'],
    status: 'enrolled',
    mentorAssigned: 'Dr. Priya Nair',
    notes: 'Exceptional math aptitude. Scheduled for stream & college target roadmap next Tuesday.',
    academicDetails: {
      classGrade: '12th Grade',
      stream: 'Science (PCM)',
      schoolName: 'Delhi Public School',
    },
    roadmapProgress: 60,
    registeredDate: 'October 1, 2026',
    createdAt: '2026-10-01T09:30:00.000Z',
    updatedAt: '2026-10-02T14:15:00.000Z',
    source: 'synthetic_seed',
  },
  {
    _id: '6700c1e8a93e5b4f2c000002',
    name: 'Rohan Kulkarni',
    email: 'rohan.kulkarni@nitk.edu.in',
    phone: '+91 9765432109',
    city: 'Mangaluru / Pune',
    profession: 'college',
    professionLabel: 'College Student (B.Tech CS 3rd Year)',
    institutionOrCompany: 'NIT Karnataka, Surathkal',
    detail: 'B.Tech Computer Science & Engineering. Target: Tier-1 SDE Product Roles (Amazon, Uber).',
    planName: 'Step-Next Placement Accelerator (College)',
    planPrice: 9999,
    selectedAddOns: ['Professional Resume Writing', 'Mock Technical Interview'],
    status: 'enrolled',
    mentorAssigned: 'Sneha Sen',
    notes: 'Resume ATS score improved from 58 to 92. Currently practicing System Design & DSA.',
    academicDetails: {
      collegeName: 'NIT Surathkal',
      degree: 'B.Tech CSE',
      yearOfStudy: '3rd Year (2027)',
      targetDomain: 'Software Engineering / SDE',
    },
    roadmapProgress: 85,
    registeredDate: 'September 28, 2026',
    createdAt: '2026-09-28T11:20:00.000Z',
    updatedAt: '2026-10-03T16:00:00.000Z',
    source: 'synthetic_seed',
  },
  {
    _id: '6700c1e8a93e5b4f2c000003',
    name: 'Meera Nambiar',
    email: 'meera.nambiar99@gmail.com',
    phone: '+91 9123456780',
    city: 'Kochi, Kerala',
    profession: 'fresher',
    professionLabel: 'Fresher / PSW (2025 Grad)',
    institutionOrCompany: 'College of Engineering Trivandrum (CET)',
    detail: 'B.Tech Electronics & Communication. Target: Core Embedded Systems & Firmware Engineer.',
    planName: 'Step-In Career Program (Freshers & PSW)',
    planPrice: 7999,
    selectedAddOns: ['LinkedIn Profile Optimization', 'Technical Portfolio Review'],
    status: 'contacted',
    mentorAssigned: 'Rajesh Kumar',
    notes: 'Introductory consultation completed. Reviewing resume for IoT core hiring drives.',
    academicDetails: {
      graduationYear: '2025',
      highestQualification: 'B.Tech ECE',
      targetRole: 'Embedded Systems Engineer',
    },
    roadmapProgress: 40,
    registeredDate: 'October 2, 2026',
    createdAt: '2026-10-02T15:45:00.000Z',
    updatedAt: '2026-10-03T10:30:00.000Z',
    source: 'synthetic_seed',
  },
  {
    _id: '6700c1e8a93e5b4f2c000004',
    name: 'Vikram Aditya',
    email: 'vikram.aditya@outlook.com',
    phone: '+91 9811223344',
    city: 'Hyderabad, Telangana',
    profession: 'working_professional',
    professionLabel: 'Working Professional (Senior Analyst)',
    institutionOrCompany: 'Tata Consultancy Services (TCS)',
    detail: '4.5 Years experience in IT. Transitioning to Product Management in FinTech.',
    planName: 'Step-Up Executive Transition (Working Pro)',
    planPrice: 14999,
    selectedAddOns: ['Executive Resume Writing', 'LinkedIn Profile Optimization', '1:1 Career Counseling Session'],
    status: 'enrolled',
    mentorAssigned: 'Amitav Ghosh',
    notes: 'Completed PM fundamentals roadmap. Working on capstone FinTech case study.',
    academicDetails: {
      company: 'TCS',
      designation: 'Senior Systems Engineer',
      experienceYears: '4.5 Years',
      careerGoal: 'Product Manager (FinTech)',
    },
    roadmapProgress: 75,
    registeredDate: 'September 24, 2026',
    createdAt: '2026-09-24T14:10:00.000Z',
    updatedAt: '2026-10-01T12:00:00.000Z',
    source: 'synthetic_seed',
  },
  {
    _id: '6700c1e8a93e5b4f2c000005',
    name: 'Tanvi Deshmukh',
    email: 'tanvi.deshmukh@yahoo.com',
    phone: '+91 9422019988',
    city: 'Pune, Maharashtra',
    profession: 'school',
    professionLabel: 'School Student (11th Grade)',
    institutionOrCompany: 'The Kalyani School, Pune',
    detail: 'Class 11 Commerce + Mathematics. Target: BBA/B.Com abroad in Singapore/UK.',
    planName: 'Step-Ready Career Program (School)',
    planPrice: 4999,
    selectedAddOns: ['Study Abroad Strategy Session'],
    status: 'pending',
    mentorAssigned: 'Unassigned',
    notes: 'Submitted registration online. Awaiting initial callback to connect with counselor.',
    academicDetails: {
      classGrade: '11th Grade',
      stream: 'Commerce with Math',
      schoolName: 'The Kalyani School',
    },
    roadmapProgress: 15,
    registeredDate: 'October 3, 2026',
    createdAt: '2026-10-03T18:20:00.000Z',
    updatedAt: '2026-10-03T18:20:00.000Z',
    source: 'synthetic_seed',
  },
  {
    _id: '6700c1e8a93e5b4f2c000006',
    name: 'Siddharth Patel',
    email: 'siddharth.patel@gmail.com',
    phone: '+91 9988776655',
    city: 'Ahmedabad / Vellore',
    profession: 'college',
    professionLabel: 'College Student (B.Tech IT Final Year)',
    institutionOrCompany: 'Vellore Institute of Technology (VIT Vellore)',
    detail: 'B.Tech IT. Target: Full Stack Web Developer (Next.js / Node / TypeScript).',
    planName: 'Step-Next Placement Accelerator (College)',
    planPrice: 9999,
    selectedAddOns: ['Professional Resume Writing', 'LinkedIn Profile Optimization'],
    status: 'contacted',
    mentorAssigned: 'Sneha Sen',
    notes: 'Portfolio Github projects reviewed. Scheduling mock interview with frontend specialist.',
    academicDetails: {
      collegeName: 'VIT Vellore',
      degree: 'B.Tech IT',
      yearOfStudy: 'Final Year (2026)',
      targetDomain: 'Full Stack Web Engineering',
    },
    roadmapProgress: 50,
    registeredDate: 'October 2, 2026',
    createdAt: '2026-10-02T08:15:00.000Z',
    updatedAt: '2026-10-03T11:45:00.000Z',
    source: 'synthetic_seed',
  },
  {
    _id: '6700c1e8a93e5b4f2c000007',
    name: 'Pooja Sundaram',
    email: 'pooja.sundaram@gmail.com',
    phone: '+91 9654123456',
    city: 'Chennai, Tamil Nadu',
    profession: 'fresher',
    professionLabel: 'Fresher / PSW (MCA Grad 2025)',
    institutionOrCompany: 'Anna University, Chennai',
    detail: 'Master of Computer Applications. Target: Cloud Computing & AWS Solutions Associate.',
    planName: 'Step-In Career Program (Freshers & PSW)',
    planPrice: 7999,
    selectedAddOns: ['Custom Cover Letter Writing'],
    status: 'pending',
    mentorAssigned: 'Unassigned',
    notes: 'Fresh registration. Interested in AWS certification mentorship & off-campus hiring.',
    academicDetails: {
      graduationYear: '2025',
      highestQualification: 'MCA',
      targetRole: 'Cloud / DevOps Associate',
    },
    roadmapProgress: 20,
    registeredDate: 'October 4, 2026',
    createdAt: '2026-10-04T05:10:00.000Z',
    updatedAt: '2026-10-04T05:10:00.000Z',
    source: 'synthetic_seed',
  },
  {
    _id: '6700c1e8a93e5b4f2c000008',
    name: 'Karthik Ramanathan',
    email: 'karthik.r@cognizant.com',
    phone: '+91 9884422110',
    city: 'Chennai, Tamil Nadu',
    profession: 'working_professional',
    professionLabel: 'Working Professional (2.5 Yrs Exp)',
    institutionOrCompany: 'Cognizant Technology Solutions',
    detail: 'React UI Developer. Looking to break into remote US/EU startups & Tier-1 compensation.',
    planName: 'Step-Up Executive Transition (Working Pro)',
    planPrice: 14999,
    selectedAddOns: ['LinkedIn Profile Optimization', '1:1 Career Counseling Session'],
    status: 'enrolled',
    mentorAssigned: 'Rajesh Kumar',
    notes: 'Completed LinkedIn overhaul. Received 4 in-bounds this week. Preparing for tech screen.',
    academicDetails: {
      company: 'Cognizant',
      designation: 'Software Associate',
      experienceYears: '2.5 Years',
      careerGoal: 'Senior Frontend Engineer (Remote)',
    },
    roadmapProgress: 70,
    registeredDate: 'September 26, 2026',
    createdAt: '2026-09-26T16:00:00.000Z',
    updatedAt: '2026-10-02T19:30:00.000Z',
    source: 'synthetic_seed',
  },
  {
    _id: '6700c1e8a93e5b4f2c000009',
    name: 'Divya Krishnan',
    email: 'divya.krishnan@loyola.edu',
    phone: '+91 9791012399',
    city: 'Chennai, Tamil Nadu',
    profession: 'college',
    professionLabel: 'College Student (B.Sc Data Science 2nd Year)',
    institutionOrCompany: 'Loyola College, Chennai',
    detail: 'B.Sc Data Science. Target: Summer 2027 Research & Industry Analytics Internships.',
    planName: 'Step-Next Placement Accelerator (College)',
    planPrice: 9999,
    selectedAddOns: ['1:1 Career Counseling Session'],
    status: 'completed',
    mentorAssigned: 'Sneha Sen',
    notes: 'Successfully secured summer analytics internship at Mu Sigma! Program completed.',
    academicDetails: {
      collegeName: 'Loyola College',
      degree: 'B.Sc Data Science',
      yearOfStudy: '2nd Year (2028)',
      targetDomain: 'Data Analytics & ML',
    },
    roadmapProgress: 100,
    registeredDate: 'August 15, 2026',
    createdAt: '2026-08-15T10:00:00.000Z',
    updatedAt: '2026-09-30T17:00:00.000Z',
    source: 'synthetic_seed',
  },
  {
    _id: '6700c1e8a93e5b4f2c000010',
    name: 'Aryan Joshi',
    email: 'aryan.joshi@gmail.com',
    phone: '+91 9823055443',
    city: 'Mumbai, Maharashtra',
    profession: 'school',
    professionLabel: 'School Student (12th Grade Humanities)',
    institutionOrCompany: 'Bombay Scottish School, Mahim',
    detail: 'Class 12 Humanities. Target: CLAT Top 3 NLUs (NLSIU Bangalore, NALSAR).',
    planName: 'Step-Ready Career Program (School)',
    planPrice: 4999,
    selectedAddOns: ['1:1 Career Counseling Session'],
    status: 'contacted',
    mentorAssigned: 'Dr. Priya Nair',
    notes: 'Counselor reviewed mock scores. Structured study timeline for upcoming CLAT exam.',
    academicDetails: {
      classGrade: '12th Grade',
      stream: 'Humanities & Legal Studies',
      schoolName: 'Bombay Scottish School',
    },
    roadmapProgress: 45,
    registeredDate: 'September 29, 2026',
    createdAt: '2026-09-29T12:00:00.000Z',
    updatedAt: '2026-10-01T15:20:00.000Z',
    source: 'synthetic_seed',
  },
  {
    _id: '6700c1e8a93e5b4f2c000011',
    name: 'Neha Bansal',
    email: 'neha.bansal@du.ac.in',
    phone: '+91 9910022334',
    city: 'New Delhi',
    profession: 'fresher',
    professionLabel: 'Fresher / PSW (B.Com Hons 2025)',
    institutionOrCompany: 'SRCC (Shri Ram College of Commerce), Delhi University',
    detail: 'B.Com (Hons). Target: Big 4 Financial Advisory or Investment Banking Analyst.',
    planName: 'Step-In Career Program (Freshers & PSW)',
    planPrice: 7999,
    selectedAddOns: ['Professional Resume Writing', '1:1 Career Counseling Session'],
    status: 'enrolled',
    mentorAssigned: 'Amitav Ghosh',
    notes: 'Resume formatted to Wall Street Oasis standard. Scheduled for financial modeling prep.',
    academicDetails: {
      graduationYear: '2025',
      highestQualification: 'B.Com (Hons)',
      targetRole: 'Financial Advisory Analyst',
    },
    roadmapProgress: 65,
    registeredDate: 'September 20, 2026',
    createdAt: '2026-09-20T11:00:00.000Z',
    updatedAt: '2026-10-02T13:40:00.000Z',
    source: 'synthetic_seed',
  },
  {
    _id: '6700c1e8a93e5b4f2c000012',
    name: 'Rahul Verma',
    email: 'rahul.verma88@gmail.com',
    phone: '+91 9840011223',
    city: 'Bengaluru / Coimbatore',
    profession: 'working_professional',
    professionLabel: 'Working Professional (6 Yrs Exp)',
    institutionOrCompany: 'L&T Technology Services',
    detail: 'Mechanical Engineer pivoting to Data Engineering & Big Data Infrastructure.',
    planName: 'Step-Up Executive Transition (Working Pro)',
    planPrice: 14999,
    selectedAddOns: ['Professional Resume Writing', 'LinkedIn Profile Optimization'],
    status: 'pending',
    mentorAssigned: 'Unassigned',
    notes: 'New registration inquiry. Needs evaluation of transferable skills and bridge curriculum.',
    academicDetails: {
      company: 'L&T Tech Services',
      designation: 'Senior Design Engineer',
      experienceYears: '6 Years',
      careerGoal: 'Data Engineer / Big Data Specialist',
    },
    roadmapProgress: 10,
    registeredDate: 'October 4, 2026',
    createdAt: '2026-10-04T03:30:00.000Z',
    updatedAt: '2026-10-04T03:30:00.000Z',
    source: 'synthetic_seed',
  },
];

/**
 * Synthetic MongoDB Collection Store
 * Operates in-memory and caches to disk when available.
 */
class SyntheticMongoStore {
  private data: StudentDocument[] = [];
  private cachePath: string;
  private rootPath: string;
  private publicPath: string;

  constructor() {
    this.cachePath = path.join(process.cwd(), '.data', 'synthetic_students.json');
    this.rootPath = path.join(process.cwd(), 'synthetic_students.json');
    this.publicPath = path.join(process.cwd(), 'public', 'synthetic_students.json');
    this.loadFromCache();
  }

  private loadFromCache() {
    const candidatePaths = [this.rootPath, this.cachePath, this.publicPath];
    for (const p of candidatePaths) {
      try {
        if (fs.existsSync(p)) {
          const raw = fs.readFileSync(p, 'utf-8');
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.data = parsed;
            this.saveToCache();
            return;
          }
        }
      } catch {
        // continue to next candidate
      }
    }

    // Initialize with default rich synthetic profiles
    this.data = [...INITIAL_SYNTHETIC_STUDENTS];
    this.saveToCache();
  }

  private saveToCache() {
    const jsonStr = JSON.stringify(this.data, null, 2);
    const pathsToSave = [this.cachePath, this.rootPath, this.publicPath];

    for (const p of pathsToSave) {
      try {
        const dir = path.dirname(p);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(p, jsonStr, 'utf-8');
      } catch {
        // In read-only or restricted environments, keep safely in memory
      }
    }
  }

  public getAll(): StudentDocument[] {
    return [...this.data];
  }

  public getById(id: string): StudentDocument | null {
    return this.data.find((s) => s._id === id) || null;
  }

  public insert(student: Partial<StudentDocument>): StudentDocument {
    const now = new Date().toISOString();
    const newDoc: StudentDocument = {
      _id: student._id || generateObjectId(),
      name: student.name || 'Anonymous Student',
      email: student.email || 'student@example.com',
      phone: student.phone || '',
      city: student.city || 'India',
      profession: student.profession || 'college',
      professionLabel:
        student.professionLabel ||
        (student.profession === 'school'
          ? 'School Student'
          : student.profession === 'college'
          ? 'College Student'
          : student.profession === 'fresher'
          ? 'Fresher / PSW'
          : 'Working Professional'),
      institutionOrCompany: student.institutionOrCompany || '',
      detail: student.detail || '',
      planName: student.planName || 'Career Guidance Plan',
      planPrice: typeof student.planPrice === 'number' ? student.planPrice : 4999,
      selectedAddOns: student.selectedAddOns || [],
      status: student.status || 'pending',
      mentorAssigned: student.mentorAssigned || 'Unassigned',
      notes: student.notes || 'Registered through Maxicareer Student Portal.',
      academicDetails: student.academicDetails || {},
      roadmapProgress: typeof student.roadmapProgress === 'number' ? student.roadmapProgress : 25,
      registeredDate:
        student.registeredDate ||
        new Date().toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        }),
      createdAt: student.createdAt || now,
      updatedAt: now,
      source: student.source || 'portal_registration',
    };

    // Prepend to top of list so newest registrations appear first
    this.data.unshift(newDoc);
    this.saveToCache();
    return newDoc;
  }

  public update(id: string, updates: Partial<StudentDocument>): StudentDocument | null {
    const index = this.data.findIndex((s) => s._id === id);
    if (index === -1) return null;

    const updated: StudentDocument = {
      ...this.data[index],
      ...updates,
      _id: this.data[index]._id, // Immutable ID
      updatedAt: new Date().toISOString(),
    };

    this.data[index] = updated;
    this.saveToCache();
    return updated;
  }

  public delete(id: string): boolean {
    const initialLen = this.data.length;
    this.data = this.data.filter((s) => s._id !== id);
    if (this.data.length !== initialLen) {
      this.saveToCache();
      return true;
    }
    return false;
  }

  public resetSeed(): StudentDocument[] {
    this.data = [...INITIAL_SYNTHETIC_STUDENTS];
    this.saveToCache();
    return this.data;
  }
}

// Global singleton for SyntheticMongoStore across Next.js API calls
declare global {
  // eslint-disable-next-line no-var
  var __maxicareer_synthetic_db: SyntheticMongoStore | undefined;
  // eslint-disable-next-line no-var
  var __maxicareer_mongo_client: MongoClient | undefined;
}

const syntheticStore: SyntheticMongoStore =
  global.__maxicareer_synthetic_db ||
  (global.__maxicareer_synthetic_db = new SyntheticMongoStore());

/**
 * MongoDB Client Singleton Manager
 */
class MongoDbManager {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private collection: Collection<StudentDocument> | null = null;
  private isConnected = false;
  private connectionError: string | null = null;
  private lastPing = 0;

  constructor() {
    this.init();
  }

  private async init() {
    const uri = process.env.MONGODB_URI;
    if (!uri || uri.includes('<username>') || uri.includes('<password>')) {
      // No valid real URI supplied, synthetic fallback is active
      return;
    }

    try {
      this.client = new MongoClient(uri, {
        serverSelectionTimeoutMS: 3000,
        connectTimeoutMS: 3000,
      });

      const start = Date.now();
      await this.client.connect();
      this.lastPing = Date.now() - start;

      const dbName = process.env.MONGODB_DB_NAME || 'maxicareer_db';
      this.db = this.client.db(dbName);
      this.collection = this.db.collection<StudentDocument>('students');
      this.isConnected = true;
      this.connectionError = null;
      console.log(`[mongodb] Connected to real MongoDB at ${dbName}.students`);

      // Ensure indexes
      await this.collection.createIndex({ email: 1 });
      await this.collection.createIndex({ profession: 1 });
      await this.collection.createIndex({ status: 1 });
    } catch (err: any) {
      console.warn('[mongodb] Real MongoDB connection failed, using synthetic engine:', err?.message || err);
      this.isConnected = false;
      this.connectionError = err?.message || 'Connection failed';
      this.client = null;
    }
  }

  public isRealMongoActive(): boolean {
    return this.isConnected && this.collection !== null;
  }

  public getLastPing(): number {
    return this.lastPing || 2;
  }

  public async getStudents(filters?: {
    search?: string;
    profession?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<StudentDocument[]> {
    if (this.isRealMongoActive() && this.collection) {
      try {
        const query: any = {};
        if (filters?.profession && filters.profession !== 'all') {
          query.profession = filters.profession;
        }
        if (filters?.status && filters.status !== 'all') {
          query.status = filters.status;
        }
        if (filters?.search) {
          const s = filters.search;
          query.$or = [
            { name: { $regex: s, $options: 'i' } },
            { email: { $regex: s, $options: 'i' } },
            { phone: { $regex: s, $options: 'i' } },
            { institutionOrCompany: { $regex: s, $options: 'i' } },
          ];
        }

        const sortField = filters?.sortBy || 'createdAt';
        const sortDirection = filters?.sortOrder === 'asc' ? 1 : -1;

        const docs = await this.collection.find(query).sort({ [sortField]: sortDirection }).toArray();
        return docs;
      } catch (err) {
        console.warn('[mongodb] Query failed, falling back to synthetic store:', err);
      }
    }

    // Synthetic Store Querying
    let list = syntheticStore.getAll();

    if (filters?.profession && filters.profession !== 'all') {
      list = list.filter((s) => s.profession === filters.profession);
    }
    if (filters?.status && filters.status !== 'all') {
      list = list.filter((s) => s.status === filters.status);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          s.phone.toLowerCase().includes(q) ||
          s.institutionOrCompany.toLowerCase().includes(q) ||
          s.detail.toLowerCase().includes(q) ||
          s.planName.toLowerCase().includes(q)
      );
    }

    // Sorting
    const sortField = (filters?.sortBy || 'createdAt') as keyof StudentDocument;
    const isAsc = filters?.sortOrder === 'asc';

    list.sort((a, b) => {
      const valA = a[sortField] ?? '';
      const valB = b[sortField] ?? '';

      if (typeof valA === 'number' && typeof valB === 'number') {
        return isAsc ? valA - valB : valB - valA;
      }
      return isAsc
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });

    return list;
  }

  public async getStudentById(id: string): Promise<StudentDocument | null> {
    if (this.isRealMongoActive() && this.collection) {
      try {
        return await this.collection.findOne({ _id: id });
      } catch {
        // fallback
      }
    }
    return syntheticStore.getById(id);
  }

  public async createStudent(data: Partial<StudentDocument>): Promise<StudentDocument> {
    const student = syntheticStore.insert(data);

    if (this.isRealMongoActive() && this.collection) {
      try {
        await this.collection.insertOne(student);
      } catch (err) {
        console.error('[mongodb] insert error:', err);
      }
    }

    return student;
  }

  public async updateStudent(id: string, updates: Partial<StudentDocument>): Promise<StudentDocument | null> {
    const updated = syntheticStore.update(id, updates);

    if (this.isRealMongoActive() && this.collection && updated) {
      try {
        await this.collection.updateOne({ _id: id }, { $set: { ...updates, updatedAt: new Date().toISOString() } });
      } catch (err) {
        console.error('[mongodb] update error:', err);
      }
    }

    return updated;
  }

  public async deleteStudent(id: string): Promise<boolean> {
    const deleted = syntheticStore.delete(id);

    if (this.isRealMongoActive() && this.collection) {
      try {
        await this.collection.deleteOne({ _id: id });
      } catch (err) {
        console.error('[mongodb] delete error:', err);
      }
    }

    return deleted;
  }

  public resetSyntheticSeed(): StudentDocument[] {
    return syntheticStore.resetSeed();
  }

  public async getStats(): Promise<DatabaseStats> {
    const isReal = this.isRealMongoActive();
    const students = await this.getStudents();

    const cohortBreakdown: Record<string, number> = {
      school: 0,
      college: 0,
      fresher: 0,
      working_professional: 0,
    };

    const statusBreakdown: Record<string, number> = {
      pending: 0,
      contacted: 0,
      enrolled: 0,
      completed: 0,
      cancelled: 0,
    };

    let totalRevenue = 0;

    for (const s of students) {
      if (cohortBreakdown[s.profession] !== undefined) {
        cohortBreakdown[s.profession]++;
      }
      if (statusBreakdown[s.status] !== undefined) {
        statusBreakdown[s.status]++;
      }
      totalRevenue += s.planPrice || 0;
    }

    let uriHost = 'mongodb-synthetic://in-memory.cluster.local:27017';
    if (isReal && process.env.MONGODB_URI) {
      try {
        const parsed = new URL(process.env.MONGODB_URI.replace('mongodb+srv://', 'https://'));
        uriHost = `mongodb+srv://${parsed.hostname}`;
      } catch {
        uriHost = 'mongodb-atlas-cluster.cloud';
      }
    }

    return {
      mode: isReal ? 'mongodb' : 'synthetic',
      status: isReal ? 'connected' : 'fallback_active',
      dbName: process.env.MONGODB_DB_NAME || 'maxicareer_db',
      collection: 'students',
      totalStudents: students.length,
      totalPipelineRevenue: totalRevenue,
      cohortBreakdown,
      statusBreakdown,
      uriHost,
      lastPingMs: isReal ? this.getLastPing() : 1,
      isRealMongo: isReal,
      version: isReal ? 'MongoDB v7.0.x (Atlas / WiredTiger)' : 'Maxicareer Synthetic Mongo Engine v2.4 (BSON/In-Memory)',
    };
  }

  public async testUriConnection(testUri: string): Promise<{ success: boolean; message: string; pingMs?: number }> {
    if (!testUri || !testUri.startsWith('mongodb')) {
      return {
        success: false,
        message: 'Invalid URI format. MongoDB URI must begin with mongodb:// or mongodb+srv://',
      };
    }

    let tempClient: MongoClient | null = null;
    try {
      const start = Date.now();
      tempClient = new MongoClient(testUri, {
        serverSelectionTimeoutMS: 4000,
        connectTimeoutMS: 4000,
      });

      await tempClient.connect();
      const pingMs = Date.now() - start;
      const dbs = await tempClient.db().admin().listDatabases();
      await tempClient.close();

      return {
        success: true,
        message: `Successfully connected to MongoDB Cluster! Found ${dbs.databases.length} databases.`,
        pingMs,
      };
    } catch (err: any) {
      if (tempClient) {
        try {
          await tempClient.close();
        } catch {}
      }
      return {
        success: false,
        message: `Connection failed: ${err?.message || 'Server timeout'}`,
      };
    }
  }
}

export const dbManager = new MongoDbManager();
