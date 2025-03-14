import { users, rechargeRequests, type User, type InsertUser, type RechargeRequest, type InsertRechargeRequest } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const MemoryStore = createMemoryStore(session);
const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

interface Service {
  id: number;
  name: string;
  category: string;
  price: string;
  isActive: boolean;
}

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createRechargeRequest(userId: number, request: InsertRechargeRequest): Promise<RechargeRequest>;
  getRechargeRequests(): Promise<RechargeRequest[]>;
  approveRecharge(requestId: number): Promise<void>;
  rejectRecharge(requestId: number): Promise<void>;
  updateUserBalance(userId: number, amount: number): Promise<void>;
  sessionStore: session.Store;
  getServices(): Promise<Service[]>;
  getService(id: number): Promise<Service | undefined>;
  createService(service: Omit<Service, "id">): Promise<Service>;
  updateService(id: number, service: Partial<Service>): Promise<Service>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private rechargeRequests: Map<number, RechargeRequest>;
  private services: Map<number, Service>;
  currentId: number;
  currentRechargeId: number;
  serviceId: number;
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.rechargeRequests = new Map();
    this.services = new Map();
    this.currentId = 1;
    this.currentRechargeId = 1;
    this.serviceId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });

    this.initializeDefaultAdmin();
    this.initializeDefaultServices();
  }

  private async initializeDefaultAdmin() {
    const hashedPassword = await hashPassword("boss");
    const adminUser: User = {
      id: this.currentId++,
      username: "noobruboss",
      password: hashedPassword,
      walletBalance: "0",
      isAdmin: true,
    };
    this.users.set(adminUser.id, adminUser);
  }

  private async initializeDefaultServices() {
    const defaultServices = [
      // Social Media
      { name: "WhatsApp", category: "Social Media", price: "10" },
      { name: "Telegram", category: "Social Media", price: "10" },
      { name: "Facebook", category: "Social Media", price: "12" },
      { name: "Instagram", category: "Social Media", price: "12" },
      { name: "Twitter (X)", category: "Social Media", price: "12" },
      { name: "Snapchat", category: "Social Media", price: "15" },
      { name: "Discord", category: "Social Media", price: "10" },
      { name: "Signal", category: "Social Media", price: "10" },
      { name: "TikTok", category: "Social Media", price: "15" },
      { name: "WeChat", category: "Social Media", price: "12" },
      { name: "Viber", category: "Social Media", price: "10" },
      { name: "Line", category: "Social Media", price: "10" },
      { name: "Hike Messenger", category: "Social Media", price: "10" },
      { name: "Reddit", category: "Social Media", price: "12" },
      { name: "LinkedIn", category: "Social Media", price: "15" },

      // E-commerce
      { name: "Amazon", category: "E-commerce", price: "15" },
      { name: "Flipkart", category: "E-commerce", price: "15" },
      { name: "eBay", category: "E-commerce", price: "15" },
      { name: "Myntra", category: "E-commerce", price: "12" },
      { name: "Ajio", category: "E-commerce", price: "12" },
      { name: "Nykaa", category: "E-commerce", price: "12" },
      { name: "Meesho", category: "E-commerce", price: "12" },
      { name: "Shopclues", category: "E-commerce", price: "12" },
      { name: "Snapdeal", category: "E-commerce", price: "12" },
      { name: "BigBasket", category: "E-commerce", price: "15" },
      { name: "Blinkit", category: "E-commerce", price: "15" },
      { name: "JioMart", category: "E-commerce", price: "15" },
      { name: "Tata Cliq", category: "E-commerce", price: "15" },
      { name: "Paytm Mall", category: "E-commerce", price: "15" },
      { name: "1mg", category: "E-commerce", price: "15" },
      { name: "Netmeds", category: "E-commerce", price: "15" },
      { name: "PharmEasy", category: "E-commerce", price: "15" },

      // Banking & Payments
      { name: "Paytm", category: "Banking & Payments", price: "20" },
      { name: "Google Pay", category: "Banking & Payments", price: "20" },
      { name: "PhonePe", category: "Banking & Payments", price: "20" },
      { name: "BHIM UPI", category: "Banking & Payments", price: "20" },
      { name: "Mobikwik", category: "Banking & Payments", price: "20" },
      { name: "FreeCharge", category: "Banking & Payments", price: "20" },
      { name: "Amazon Pay", category: "Banking & Payments", price: "20" },
      { name: "SBI YONO", category: "Banking & Payments", price: "25" },
      { name: "HDFC Bank", category: "Banking & Payments", price: "25" },
      { name: "ICICI iMobile", category: "Banking & Payments", price: "25" },
      { name: "Kotak 811", category: "Banking & Payments", price: "25" },
      { name: "Axis Bank", category: "Banking & Payments", price: "25" },
      { name: "Bank of Baroda", category: "Banking & Payments", price: "25" },
      { name: "Yes Bank", category: "Banking & Payments", price: "25" },
      { name: "Federal Bank", category: "Banking & Payments", price: "25" },
      { name: "UCO Bank", category: "Banking & Payments", price: "25" },
      { name: "Canara Bank", category: "Banking & Payments", price: "25" },
      { name: "IDFC FIRST Bank", category: "Banking & Payments", price: "25" },
      { name: "Airtel Payments Bank", category: "Banking & Payments", price: "20" },

      // Food Delivery
      { name: "Zomato", category: "Food Delivery", price: "15" },
      { name: "Swiggy", category: "Food Delivery", price: "15" },
      { name: "Domino's Pizza", category: "Food Delivery", price: "15" },
      { name: "McDonald's", category: "Food Delivery", price: "15" },
      { name: "KFC", category: "Food Delivery", price: "15" },
      { name: "Pizza Hut", category: "Food Delivery", price: "15" },
      { name: "Faasos", category: "Food Delivery", price: "15" },
      { name: "Box8", category: "Food Delivery", price: "15" },
      { name: "EatSure", category: "Food Delivery", price: "15" },
      { name: "Dunzo", category: "Food Delivery", price: "15" },
      { name: "FreshMenu", category: "Food Delivery", price: "15" },

      // Travel & Transport
      { name: "MakeMyTrip", category: "Travel & Transport", price: "20" },
      { name: "Goibibo", category: "Travel & Transport", price: "20" },
      { name: "Yatra", category: "Travel & Transport", price: "20" },
      { name: "Cleartrip", category: "Travel & Transport", price: "20" },
      { name: "IRCTC", category: "Travel & Transport", price: "25" },
      { name: "Uber", category: "Travel & Transport", price: "20" },
      { name: "Ola", category: "Travel & Transport", price: "20" },
      { name: "Rapido", category: "Travel & Transport", price: "15" },
      { name: "RedBus", category: "Travel & Transport", price: "15" },
      { name: "AbhiBus", category: "Travel & Transport", price: "15" },
      { name: "BlaBlaCar", category: "Travel & Transport", price: "20" },
      { name: "Agoda", category: "Travel & Transport", price: "20" },
      { name: "Airbnb", category: "Travel & Transport", price: "25" },
      { name: "Booking.com", category: "Travel & Transport", price: "25" },
      { name: "TripAdvisor", category: "Travel & Transport", price: "20" },

      // Entertainment
      { name: "Netflix", category: "Entertainment", price: "25" },
      { name: "Amazon Prime Video", category: "Entertainment", price: "25" },
      { name: "Disney+ Hotstar", category: "Entertainment", price: "20" },
      { name: "ZEE5", category: "Entertainment", price: "15" },
      { name: "SonyLIV", category: "Entertainment", price: "15" },
      { name: "JioTV", category: "Entertainment", price: "15" },
      { name: "JioCinema", category: "Entertainment", price: "15" },
      { name: "ALT Balaji", category: "Entertainment", price: "15" },
      { name: "MX Player", category: "Entertainment", price: "15" },
      { name: "Voot", category: "Entertainment", price: "15" },
      { name: "Apple TV+", category: "Entertainment", price: "25" },
      { name: "YouTube Premium", category: "Entertainment", price: "20" },
      { name: "Spotify", category: "Entertainment", price: "15" },
      { name: "JioSaavn", category: "Entertainment", price: "12" },
      { name: "Gaana", category: "Entertainment", price: "12" },
      { name: "Wynk Music", category: "Entertainment", price: "12" },
      { name: "Hungama Music", category: "Entertainment", price: "12" },
      { name: "SoundCloud", category: "Entertainment", price: "15" },

      // Gaming
      { name: "PUBG Mobile", category: "Gaming", price: "20" },
      { name: "Free Fire", category: "Gaming", price: "20" },
      { name: "Call of Duty Mobile", category: "Gaming", price: "20" },
      { name: "BGMI", category: "Gaming", price: "20" },
      { name: "Ludo King", category: "Gaming", price: "15" },
      { name: "MPL", category: "Gaming", price: "20" },
      { name: "Dream11", category: "Gaming", price: "25" },
      { name: "My11Circle", category: "Gaming", price: "25" },
      { name: "RummyCircle", category: "Gaming", price: "25" },
      { name: "PokerBaazi", category: "Gaming", price: "25" },
      { name: "Junglee Rummy", category: "Gaming", price: "25" },
      { name: "FanFight", category: "Gaming", price: "20" },
      { name: "Winzo", category: "Gaming", price: "20" },
      { name: "Paytm First Games", category: "Gaming", price: "20" },
      { name: "PokerStars", category: "Gaming", price: "25" },
      { name: "8 Ball Pool", category: "Gaming", price: "15" },

      // Education
      { name: "Unacademy", category: "Education", price: "20" },
      { name: "BYJU'S", category: "Education", price: "20" },
      { name: "Vedantu", category: "Education", price: "20" },
      { name: "Khan Academy", category: "Education", price: "15" },
      { name: "Coursera", category: "Education", price: "25" },
      { name: "Udemy", category: "Education", price: "25" },
      { name: "edX", category: "Education", price: "25" },
      { name: "Duolingo", category: "Education", price: "15" },
      { name: "Toppr", category: "Education", price: "20" },
      { name: "Gradeup", category: "Education", price: "20" },
      { name: "Testbook", category: "Education", price: "20" },
      { name: "Embibe", category: "Education", price: "20" },
      { name: "Oliveboard", category: "Education", price: "20" },
      { name: "CareerWill", category: "Education", price: "20" },
      { name: "PhysicsWallah", category: "Education", price: "15" },

      // Cloud Storage
      { name: "Google Drive", category: "Cloud Storage", price: "15" },
      { name: "Dropbox", category: "Cloud Storage", price: "15" },
      { name: "OneDrive", category: "Cloud Storage", price: "15" },
      { name: "Mega", category: "Cloud Storage", price: "15" },
      { name: "Evernote", category: "Cloud Storage", price: "15" },
      { name: "Notion", category: "Cloud Storage", price: "15" },
      { name: "Google Docs", category: "Cloud Storage", price: "15" },
      { name: "Microsoft Office", category: "Cloud Storage", price: "20" },
      { name: "Zoho Mail", category: "Cloud Storage", price: "15" },
      { name: "ProtonMail", category: "Cloud Storage", price: "15" },
      { name: "Slack", category: "Cloud Storage", price: "15" },
      { name: "Zoom", category: "Cloud Storage", price: "15" },
      { name: "Microsoft Teams", category: "Cloud Storage", price: "20" },

      // Jobs & Freelancing
      { name: "Naukri", category: "Jobs & Freelancing", price: "20" },
      { name: "Indeed", category: "Jobs & Freelancing", price: "20" },
      { name: "Shine", category: "Jobs & Freelancing", price: "20" },
      { name: "LinkedIn Jobs", category: "Jobs & Freelancing", price: "20" },
      { name: "Monster India", category: "Jobs & Freelancing", price: "20" },
      { name: "Freelancer", category: "Jobs & Freelancing", price: "25" },
      { name: "Upwork", category: "Jobs & Freelancing", price: "25" },
      { name: "Fiverr", category: "Jobs & Freelancing", price: "25" },
      { name: "Toptal", category: "Jobs & Freelancing", price: "25" },
      { name: "PeoplePerHour", category: "Jobs & Freelancing", price: "25" },

      // Crypto
      { name: "Binance", category: "Crypto", price: "25" },
      { name: "WazirX", category: "Crypto", price: "25" },
      { name: "CoinDCX", category: "Crypto", price: "25" },
      { name: "ZebPay", category: "Crypto", price: "25" },
      { name: "CoinSwitch Kuber", category: "Crypto", price: "25" },
      { name: "Coinbase", category: "Crypto", price: "25" },
      { name: "KuCoin", category: "Crypto", price: "25" },
      { name: "Unocoin", category: "Crypto", price: "25" },
      { name: "OKX", category: "Crypto", price: "25" },
      { name: "Bitbns", category: "Crypto", price: "25" },
      { name: "FTX", category: "Crypto", price: "25" },

      // VPN
      { name: "NordVPN", category: "VPN", price: "20" },
      { name: "ExpressVPN", category: "VPN", price: "20" },
      { name: "Surfshark", category: "VPN", price: "20" },
      { name: "ProtonVPN", category: "VPN", price: "20" },
      { name: "Hotspot Shield", category: "VPN", price: "20" },
      { name: "Turbo VPN", category: "VPN", price: "15" },
      { name: "Psiphon", category: "VPN", price: "15" },
      { name: "Hola VPN", category: "VPN", price: "15" },

      // Classifieds
      { name: "OLX", category: "Classifieds", price: "15" },
      { name: "Quikr", category: "Classifieds", price: "15" },
      { name: "Facebook Marketplace", category: "Classifieds", price: "15" },
      { name: "CarDekho", category: "Classifieds", price: "20" },
      { name: "BikeDekho", category: "Classifieds", price: "20" },
      { name: "Zigwheels", category: "Classifieds", price: "20" },

      // Government Services
      { name: "Aadhar Services", category: "Government Services", price: "25" },
      { name: "Digilocker", category: "Government Services", price: "20" },
      { name: "UMANG", category: "Government Services", price: "20" },
      { name: "mAadhaar", category: "Government Services", price: "25" },
      { name: "mParivahan", category: "Government Services", price: "20" },
      { name: "Indian Post Payment Bank", category: "Government Services", price: "25" },
      { name: "Bharat Gas", category: "Government Services", price: "20" },
      { name: "HP Gas", category: "Government Services", price: "20" },
      { name: "Indane Gas", category: "Government Services", price: "20" },
      { name: "FASTag", category: "Government Services", price: "20" },
    ];

    for (const service of defaultServices) {
      await this.createService({
        ...service,
        isActive: true,
      });
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = {
      ...insertUser,
      id,
      walletBalance: "0",
      isAdmin: false
    };
    this.users.set(id, user);
    return user;
  }

  async createRechargeRequest(userId: number, request: InsertRechargeRequest): Promise<RechargeRequest> {
    const id = this.currentRechargeId++;
    const rechargeRequest: RechargeRequest = {
      id,
      userId,
      ...request,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    this.rechargeRequests.set(id, rechargeRequest);
    return rechargeRequest;
  }

  async getRechargeRequests(): Promise<RechargeRequest[]> {
    return Array.from(this.rechargeRequests.values());
  }

  async approveRecharge(requestId: number): Promise<void> {
    const request = this.rechargeRequests.get(requestId);
    if (!request || request.status !== "pending") return;

    request.status = "approved";
    this.rechargeRequests.set(requestId, request);

    const user = this.users.get(request.userId);
    if (user) {
      const newBalance = parseFloat(user.walletBalance) + parseFloat(request.amount.toString());
      user.walletBalance = newBalance.toString();
      this.users.set(user.id, user);
    }
  }

  async rejectRecharge(requestId: number): Promise<void> {
    const request = this.rechargeRequests.get(requestId);
    if (!request || request.status !== "pending") return;

    request.status = "rejected";
    this.rechargeRequests.set(requestId, request);
  }

  async updateUserBalance(userId: number, amount: number): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      const newBalance = parseFloat(user.walletBalance) + amount;
      user.walletBalance = newBalance.toString();
      this.users.set(userId, user);
    }
  }

  async getServices(): Promise<Service[]> {
    return Array.from(this.services.values());
  }

  async getService(id: number): Promise<Service | undefined> {
    return this.services.get(id);
  }

  async createService(service: Omit<Service, "id">): Promise<Service> {
    const id = this.serviceId++;
    const newService = { ...service, id };
    this.services.set(id, newService);
    return newService;
  }

  async updateService(id: number, updates: Partial<Service>): Promise<Service> {
    const service = this.services.get(id);
    if (!service) throw new Error("Service not found");

    const updatedService = { ...service, ...updates };
    this.services.set(id, updatedService);
    return updatedService;
  }
}

export const storage = new MemStorage();