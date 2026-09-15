export type UserRole = "admin" | "resident";
export type ResidentStatus = "active" | "moved_out" | "temporary";
export type BorrowStatus = "borrowed" | "returned" | "overdue";
export type RepairStatus = "pending" | "in_progress" | "done";
export type BillStatus = "unpaid" | "paid";

export interface IdCard { number: string; issueDate: string; expireDate: string; imageUrl: string; }
export interface Passport { number: string; country: string; expireDate: string; imageUrl: string; }
export interface HouseRegistration { number: string; address: string; imageUrl: string; }

export interface AppUser {
  uid: string; username: string; passwordHash: string; nameTH: string; nameEN: string;
  phone: string; lineId: string; roomNumber: string; faceDescriptor: number[];
  faceImageUrl: string; role: UserRole; status: ResidentStatus; startDate: string;
  endDate: string; birthDate: string; idCard: IdCard; passport: Passport;
  houseRegistration: HouseRegistration; monthlyRent: number; notes: string;
  createdAt: string; updatedAt: string;
}

export interface Bill { id: string; userId: string; month: number; year: number; units: number; amount: number; status: BillStatus; createdAt: string; }
export interface Borrow { id: string; userId: string; item: string; quantity: number; borrowDate: string; dueDate: string; returnDate: string | null; faceVerified: boolean; status: BorrowStatus; }
export interface Repair { id: string; userId: string; type: "ไฟฟ้า" | "แอร์" | "ประปา" | "เฟอร์นิเจอร์" | "อื่นๆ"; description: string; imageUrls: string[]; status: RepairStatus; createdAt: string; updatedAt: string; }
export interface Expense { id: string; userId: string; month: number; year: number; rent: number; electricity: number; common: number; total: number; }
export interface EventLog { id: string; userId: string; event: string; detail: string; timestamp: string; ip: string; }

export interface SessionPayload { uid: string; role: UserRole; username: string; }
