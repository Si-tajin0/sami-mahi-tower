export interface DictionaryContent {
  // ... আপনার আগের সব কী এখানে থাকবে
  available: string; // এটি নতুন যোগ হলো
  // নিশ্চিত করুন নিচেরগুলোও আছে
  title: string; contact: string; explore: string; login: string; apply: string;
  floor: string; ground: string; roof: string; viewDetails: string;
  rooms: string; baths: string; balcony: string; size: string; details: string;
  loginTitle: string; userId: string; password: string; loginBtn: string;
  errorMsg: string; idPlaceholder: string; passPlaceholder: string;
  close: string; forgetPass: string; show: string; hide: string;
  managerPanel: string; addTenant: string; tenantName: string; phone: string;
  flatNo: string; rent: string; save: string; potentialRent: string;
  totalExpense: string; balance: string; expenseTitle: string;
  expenseDesc: string; amount: string; saveBtn: string; tenantList: string;
  id: string; name: string; flat: string; joined: string;
  construction: string; maintenance: string; expenseType: string;
  history: string; rentStatus: string; paid: string; unpaid: string;
  selectMonth: string; selectYear: string; action: string;
  nid: string; occupation: string; securityDeposit: string;
  emergencyContact: string; viewFull: string; unit: string;
  jan: string; feb: string; mar: string; apr: string; may: string; jun: string;
  jul: string; aug: string; sep: string; oct: string; nov: string; dec: string;
  monthlyIncome: string; monthlyExpense: string; totalBalance: string;
  markPaid: string; markUnpaid: string; printReport: string;
  monthlyReport: string; expenseList: string; totalIncome: string;
  netProfit: string; authorizedSign: string; expenseDetails: string;
  rentDetails: string; totalFlats: string; occupied: string; vacant: string;
  buildingMap: string; edit: string; delete: string; confirmDelete: string;
  updateBtn: string;
  ownerPanel: string;
  allTimeIncome:string;
  buildingProfit:string;
  constructionSummary:string;
  maintenanceSummary:string;
  monthlyComparison:string;
  allTransactions:string;
  pendingRent:string;
  constructionLog: string;
  dailyMaintenance:string;
  tenantStatusReport:string;
  expectedRent:string;
  profitMargin:string;
  date:string;
  description:string;
  category:string;
  expenseHistory:string;
  incomeSource:string;

}

const en: DictionaryContent = {
  // ... বাকি সব
  available: "Available",
  // অন্য সব আগের মতোই থাকবে
  title: "Sami & Mahi Tower", contact: "Contact: 01813495940", explore: "Explore Floors", login: "Login", apply: "Apply for Rent",
  floor: "Floor", ground: "Ground Floor", roof: "Roof Garden", viewDetails: "View Details",
  rooms: "Rooms", baths: "Baths", balcony: "Balcony", size: "Size", details: "Unit Details",
  loginTitle: "Login to Portal", userId: "User ID", password: "Password", loginBtn: "Sign In",
  errorMsg: "Invalid ID or Password", idPlaceholder: "Enter ID", passPlaceholder: "••••••••",
  close: "Close", forgetPass: "Forget Password?", show: "Show", hide: "Hide",
  managerPanel: "Manager Dashboard", addTenant: "Add New Tenant", tenantName: "Tenant Name", phone: "Phone Number",
  flatNo: "Flat Number", rent: "Rent Amount", save: "Save Information", potentialRent: "Total Potential Rent",
  totalExpense: "Total Expense", balance: "Balance", expenseTitle: "Entry Expense",
  expenseDesc: "Expense Description", amount: "Amount", saveBtn: "Save", tenantList: "Tenant List",
  id: "ID", name: "Name", flat: "Flat", joined: "Joined Date",
  construction: "Construction", maintenance: "Maintenance", expenseType: "Expense Type",
  history: "Expense History", rentStatus: "Monthly Rent Status", paid: "Paid", unpaid: "Unpaid",
  selectMonth: "Select Month", selectYear: "Select Year", action: "Action",
  nid: "NID Number", occupation: "Occupation", securityDeposit: "Security Deposit",
  emergencyContact: "Emergency Contact", viewFull: "View Full Profile", unit: "Unit",
  jan: "January", feb: "February", mar: "March", apr: "April", may: "May", jun: "June",
  jul: "July", aug: "August", sep: "September", oct: "October", nov: "November", dec: "December", 
  monthlyIncome: "Monthly Income", monthlyExpense: "Monthly Expense", totalBalance: "Total Balance",
  markPaid: "Mark as Paid", markUnpaid: "Mark as Unpaid", printReport: "Print Report",
  monthlyReport: "Monthly Financial Report", expenseList: "Expense List", totalIncome: "Total Income",
  netProfit: "Net Profit", rentDetails: "Rent Collection Details", expenseDetails: "Expense Breakdown",
  authorizedSign: "Authorized Signature", buildingMap: "Building Map", vacant: "Vacant",
  occupied: "Occupied", totalFlats: "Total Flats", edit: "Edit", delete: "Delete",
  confirmDelete: "Are you sure you want to delete?", updateBtn: "Update Information",ownerPanel: "Owner Dashboard",
  allTimeIncome: "All-Time Income",
  buildingProfit: "Total Building Profit",
  constructionSummary: "Construction Cost Summary",
  maintenanceSummary: "Maintenance Summary",
  monthlyComparison: "Monthly Growth",allTransactions: "Full Financial Ledger",
  pendingRent: "Arrears / Pending Rent",
  constructionLog: "Construction Raw Material Log",
  dailyMaintenance: "Daily Maintenance Expenses",
  tenantStatusReport: "Tenant Wise Status",
  expectedRent: "Expected Revenue",
  profitMargin: "Net Profit Margin",
  date: "Date",
  description: "Description",
  category: "Category",expenseHistory: "Transaction Ledger", incomeSource: "Income Source",
};

const bn: DictionaryContent = {
  // ... বাকি সব
  available: "খালি আছে",
  // অন্য সব আগের মতোই থাকবে
  title: "সামি ও মাহী টাওয়ার", contact: "যোগাযোগ: ০১৮১৩৪৯৫৯৪০", explore: "ফ্লোরগুলো দেখুন", login: "লগইন", apply: "ভাড়ার আবেদন",
  floor: "তলা", ground: "নিচ তলা", roof: "ছাদ বাগান", viewDetails: "বিস্তারিত দেখুন",
  rooms: "রুম", baths: "বাথরুম", balcony: "বারান্দা", size: "আয়তন", details: "ফ্ল্যাটের বিস্তারিত",
  loginTitle: "পোর্টালে প্রবেশ করুন", userId: "ইউজার আইডি", password: "পাসওয়ার্ড", loginBtn: "লগইন করুন",
  errorMsg: "ভুল আইডি বা পাসওয়ার্ড", idPlaceholder: "আইডি দিন", passPlaceholder: "••••••••",
  close: "বন্ধ করুন", forgetPass: "পাসওয়ার্ড ভুলে গেছেন?", show: "দেখুন", hide: "লুকান",
  managerPanel: "ম্যানেজার ড্যাশবোর্ড", addTenant: "নতুন ভাড়াটিয়া যোগ করুন", tenantName: "ভাড়াটিয়ার নাম", phone: "মোবাইল নম্বর",
  flatNo: "ফ্ল্যাট নম্বর", rent: "ভাড়ার পরিমাণ", save: "তথ্য সংরক্ষণ করুন", potentialRent: "মোট সম্ভাব্য ভাড়া",
  totalExpense: "মোট খরচ", balance: "ব্যালেন্স", expenseTitle: "খরচের হিসাব লিখুন",
  expenseDesc: "খরচের বর্ণনা", amount: "টাকার পরিমাণ", saveBtn: "সেভ করুন", tenantList: "ভাড়াটিয়া তালিকা",
  id: "আইডি", name: "নাম", flat: "ফ্ল্যাট", joined: "যোগদানের তারিখ",
  construction: "নির্মাণ কাজ", maintenance: "মেইনটেন্যান্স", expenseType: "খরচের ধরণ",
  history: "খরচের ইতিহাস", rentStatus: "মাসিক ভাড়ার অবস্থা", paid: "পরিশোধিত", unpaid: "বাকি",
  selectMonth: "মাস সিলেক্ট করুন", selectYear: "বছর সিলেক্ট করুন", action: "অ্যাকশন",
  nid: "এনআইডি নম্বর", occupation: "পেশা", securityDeposit: "জামানত/অ্যাডভান্স",
  emergencyContact: "জরুরি যোগাযোগ নম্বর", viewFull: "সম্পূর্ণ প্রোফাইল দেখুন", unit: "ইউনিট",
  jan: "জানুয়ারি", feb: "ফেব্রুয়ারি", mar: "মার্চ", apr: "এপ্রিল", may: "মে", jun: "জুন",
  jul: "জুলাই", aug: "আগস্ট", sep: "সেপ্টেম্বর", oct: "অক্টোবর", nov: "নভেম্বর", dec: "ডিসেম্বর",  
  monthlyIncome: "মাসিক ইনকাম", monthlyExpense: "মাসিক খরচ", totalBalance: "মোট ব্যালেন্স",
  markPaid: "পেইড করুন", markUnpaid: "বাকি করুন", printReport: "রিপোর্ট প্রিন্ট করুন",
  monthlyReport: "মাসিক আর্থিক প্রতিবেদন", expenseList: "খরচের তালিকা", totalIncome: "মোট আয় (ভাড়া)",
  netProfit: "নিট লাভ", rentDetails: "ভাড়া আদায়ের বিবরণ", expenseDetails: "খরচের বিবরণ",
  authorizedSign: "কর্তৃপক্ষের স্বাক্ষর", buildingMap: "বিল্ডিং ম্যাপ", vacant: "খালি",
  occupied: "ভাড়া হয়েছে", totalFlats: "মোট ফ্ল্যাট", edit: "এডিট", delete: "মুছে ফেলুন",
  confirmDelete: "আপনি কি নিশ্চিত যে এটি মুছে ফেলতে চান?", updateBtn: "তথ্য আপডেট করুন",ownerPanel: "মালিকের ড্যাশবোর্ড",
  allTimeIncome: "সর্বমোট আয় (ভাড়া)",
  buildingProfit: "বিল্ডিংয়ের মোট লাভ",
  constructionSummary: "নির্মাণ ব্যয়ের সারসংক্ষেপ",
  maintenanceSummary: "মেইনটেন্যান্স সারসংক্ষেপ",
  monthlyComparison: "মাসিক তুলনামূলক চিত্র",allTransactions: "পূর্ণাঙ্গ আর্থিক লেজার",
  pendingRent: "বকেয়া ভাড়ার তালিকা",
  constructionLog: "নির্মাণ সামগ্রীর খরচের লগ",
  dailyMaintenance: "দৈনিক মেইনটেন্যান্স খরচ",
  tenantStatusReport: "ভাড়াটিয়া ভিত্তিক রিপোর্ট",
  expectedRent: "প্রত্যাশিত মোট ভাড়া",
  profitMargin: "নিট মুনাফার হার",
  date: "তারিখ",
  description: "বিবরণ",
  category: "বিভাগ",expenseHistory: "আয়-ব্যয় লেজার", incomeSource: "আয়ের উৎস",
};

export const dictionary = { en, bn };
export type Language = "en" | "bn";