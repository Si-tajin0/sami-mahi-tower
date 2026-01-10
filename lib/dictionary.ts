// lib/dictionary.ts

// ১. ডিকশনারির জন্য পূর্ণাঙ্গ ইন্টারফেস (সবগুলো string টাইপ)
export interface DictionaryContent {
  available: string;
  title: string;
  contact: string;
  explore: string;
  login: string;
  apply: string;
  floor: string;
  ground: string;
  roof: string;
  viewDetails: string;
  rooms: string;
  baths: string;
  balcony: string;
  size: string;
  details: string;
  loginTitle: string;
  userId: string;
  password: string;
  loginBtn: string;
  errorMsg: string;
  idPlaceholder: string;
  passPlaceholder: string;
  close: string;
  forgetPass: string;
  show: string;
  hide: string;
  managerPanel: string;
  addTenant: string;
  tenantName: string;
  phone: string;
  flatNo: string;
  rent: string;
  save: string;
  potentialRent: string;
  totalExpense: string;
  balance: string;
  expenseTitle: string;
  expenseDesc: string;
  amount: string;
  saveBtn: string;
  tenantList: string;
  id: string;
  name: string;
  flat: string;
  joined: string;
  construction: string;
  maintenance: string;
  expenseType: string;
  history: string;
  rentStatus: string;
  paid: string;
  unpaid: string;
  selectMonth: string;
  selectYear: string;
  action: string;
  nid: string;
  occupation: string;
  securityDeposit: string;
  emergencyContact: string;
  viewFull: string;
  unit: string;
  jan: string;
  feb: string;
  mar: string;
  apr: string;
  may: string;
  jun: string;
  jul: string;
  aug: string;
  sep: string;
  oct: string;
  nov: string;
  dec: string;
  monthlyIncome: string;
  monthlyExpense: string;
  totalBalance: string;
  markPaid: string;
  markUnpaid: string;
  printReport: string;
  monthlyReport: string;
  expenseList: string;
  totalIncome: string;
  netProfit: string;
  authorizedSign: string;
  expenseDetails: string;
  rentDetails: string;
  totalFlats: string;
  occupied: string;
  vacant: string;
  buildingMap: string;
  edit: string;
  delete: string;
  confirmDelete: string;
  updateBtn: string;
  ownerPanel: string;
  allTimeIncome: string;
  buildingProfit: string;
  constructionSummary: string;
  maintenanceSummary: string;
  monthlyComparison: string;
  allTransactions: string;
  pendingRent: string;
  constructionLog: string;
  dailyMaintenance: string;
  tenantStatusReport: string;
  expectedRent: string;
  profitMargin: string;
  date: string;
  description: string;
  category: string;
  expenseHistory: string;
  incomeSource: string;
  myProfile: string;
  myRentHistory: string;
  noticeBoard: string;
  noNotice: string;
  welcomeTenant: string;
  addNotice: string;
  noticeTitle: string;
  noticeMessage: string;
  publish: string;
  serviceCharge: string;
  totalPayable: string;
  confirmPayment: string;
  paymentMethod: string;
  cash: string;
  online: string;
  method: string;
  totalServiceCharge: string;
  rentCollection: string;
  incomeBreakdown: string;
  tenant: string;
  totalPaid: string;
  printStatement: string;
  contactManager: string;
  complaints: string;
  sendComplaint: string;
  subject: string;
   message: string;
   submit: string;
   pending: string;
   solved: string;
   complaintList: string;
   manager: string;
   security: string;
   callNow: string;
   changePassword: string;
   currentPassword: string;
   newPassword: string;
   updatePassword: string;
   passChanged: string;
   passError: string;
   moveOut:string;
   confirmMoveOut: string;
   active: string;
   exited: string;
   previousTenants: string;
   exitDate: string;
   loginSuccess:string;
   handoverMoney: string;
   handoverHistory: string;
   cashWithManager: string;
   confirmedFund:string;
   amountToHandover: string;
   confirmHandover:string;
   confirmed:string;
   handoverSuccess:string;
   receiveSuccess:string;
}

// ২. ইংরেজি ডিকশনারি
const en: DictionaryContent = {
  available: "Available",
  title: "Sami & Mahi Tower",
  contact: "Contact: 01813495940",
  explore: "Explore Floors",
  login: "Login",
  apply: "Apply for Rent",
  floor: "Floor",
  ground: "Ground Floor",
  roof: "Roof Garden",
  viewDetails: "View Details",
  rooms: "Rooms",
  baths: "Baths",
  balcony: "Balcony",
  size: "Size",
  details: "Unit Details",
  loginTitle: "Login to Portal",
  userId: "User ID",
  password: "Password",
  loginBtn: "Sign In",
  errorMsg: "Invalid ID or Password",
  idPlaceholder: "Enter ID",
  passPlaceholder: "••••••••",
  close: "Close",
  forgetPass: "Forget Password?",
  show: "Show",
  hide: "Hide",
  managerPanel: "Manager Dashboard",
  addTenant: "Add New Tenant",
  tenantName: "Tenant Name",
  phone: "Phone Number",
  flatNo: "Flat Number",
  rent: "Rent Amount",
  save: "Save Information",
  potentialRent: "Total Potential Rent",
  totalExpense: "Total Expense",
  balance: "Balance",
  expenseTitle: "Entry Expense",
  expenseDesc: "Expense Description",
  amount: "Amount",
  saveBtn: "Save",
  tenantList: "Tenant List",
  id: "ID",
  name: "Name",
  flat: "Flat",
  joined: "Joined Date",
  construction: "Construction",
  maintenance: "Maintenance",
  expenseType: "Expense Type",
  history: "Expense History",
  rentStatus: "Monthly Rent Status",
  paid: "Paid",
  unpaid: "Unpaid",
  selectMonth: "Select Month",
  selectYear: "Select Year",
  action: "Action",
  nid: "NID Number",
  occupation: "Occupation",
  securityDeposit: "Security Deposit",
  emergencyContact: "Emergency Contact",
  viewFull: "View Full Profile",
  unit: "Unit",
  jan: "January",
  feb: "February",
  mar: "March",
  apr: "April",
  may: "May",
  jun: "June",
  jul: "July",
  aug: "August",
  sep: "September",
  oct: "October",
  nov: "November",
  dec: "December",
  monthlyIncome: "Monthly Income",
  monthlyExpense: "Monthly Expense",
  totalBalance: "Total Balance",
  markPaid: "Mark as Paid",
  markUnpaid: "Mark as Unpaid",
  printReport: "Print Report",
  monthlyReport: "Monthly Financial Report",
  expenseList: "Expense List",
  totalIncome: "Total Income",
  netProfit: "Net Profit",
  rentDetails: "Rent Collection Details",
  expenseDetails: "Expense Breakdown",
  authorizedSign: "Authorized Signature",
  buildingMap: "Building Map",
  vacant: "Vacant",
  occupied: "Occupied",
  totalFlats: "Total Flats",
  edit: "Edit",
  delete: "Delete",
  confirmDelete: "Are you sure you want to delete?",
  updateBtn: "Update Information",
  ownerPanel: "Owner Dashboard",
  allTimeIncome: "All-Time Income",
  buildingProfit: "Total Building Profit",
  constructionSummary: "Construction Summary",
  maintenanceSummary: "Maintenance Summary",
  monthlyComparison: "Monthly Comparison",
  allTransactions: "Full Financial Ledger",
  pendingRent: "Arrears / Pending Rent",
  constructionLog: "Construction Raw Material Log",
  dailyMaintenance: "Daily Maintenance Expenses",
  tenantStatusReport: "Tenant Wise Status",
  expectedRent: "Expected Revenue",
  profitMargin: "Net Profit Margin",
  date: "Date",
  description: "Description",
  category: "Category",
  expenseHistory: "Transaction Ledger",
  incomeSource: "Income Source",
  myProfile: "My Profile",
  myRentHistory: "My Rent History",
  noticeBoard: "Notice Board",
  noNotice: "No new notices at the moment.",
  welcomeTenant: "Welcome to your portal",
  addNotice: "Post New Notice",
  noticeTitle: "Title",
  noticeMessage: "Message",
  publish: "Publish Notice",
  serviceCharge: "Service Charge",
  totalPayable: "Total Payable",
  confirmPayment: "Confirm Payment Details",
  paymentMethod: "Payment Method",
  cash: "Cash / Offline",
  online: "Online (Mobile/Bank)",
  method: "Method",
  totalServiceCharge: "Total Service Charge",
  rentCollection: "Rent Collection",incomeBreakdown: "Income Breakdown (Rent Collection)",
  tenant: "Tenant",
  totalPaid: "Total Paid",
   printStatement: "Print Statement",
  contactManager: "Contact Manager",
  complaints: "Complaints to Owner",
  sendComplaint: "Send Message to Owner",
  subject: "Subject",
  message: "Your Message",
  submit: "Submit Complaint",
  pending: "Pending",
  solved: "Solved",
  complaintList: "Tenant Complaints",
  manager: "Manager",
  security: "Security Guard",
  callNow: "Call Now",
   changePassword: "Change Password",
  currentPassword: "Current Password",
  newPassword: "New Password",
  updatePassword: "Update Password",
  passChanged: "Password changed successfully!",
  passError: "Current password is incorrect!",
    moveOut: "Move Out / Exit",
  confirmMoveOut: "Are you sure this tenant is moving out?",
  active: "Active",
  exited: "Exited",
  previousTenants: "Previous Tenants",
  exitDate: "Exit Date",
  loginSuccess: "Login Successful! Redirecting...", handoverMoney: "Handover Money",
  handoverHistory: "Handover History",
  cashWithManager: "Cash with Manager",
  confirmedFund: "Confirmed Fund (Owner)",
  amountToHandover: "Amount to Handover",
  confirmHandover: "Confirm Receipt",
  confirmed: "Confirmed",
  handoverSuccess: "Handover request sent to owner.",
  receiveSuccess: "Amount confirmed and received."
};

// ৩. বাংলা ডিকশনারি
const bn: DictionaryContent = {
  available: "খালি আছে",
  title: "সামি ও মাহী টাওয়ার",
  contact: "যোগাযোগ: ০১৮১৩৪৯৫৯৪০",
  explore: "ফ্লোরগুলো দেখুন",
  login: "লগইন",
  apply: "ভাড়ার আবেদন",
  floor: "তলা",
  ground: "নিচ তলা",
  roof: "ছাদ বাগান",
  viewDetails: "বিস্তারিত দেখুন",
  rooms: "রুম",
  baths: "বাথরুম",
  balcony: "বারান্দা",
  size: "আয়তন",
  details: "ফ্ল্যাটের বিস্তারিত",
  loginTitle: "পোর্টালে প্রবেশ করুন",
  userId: "ইউজার আইডি",
  password: "পাসওয়ার্ড",
  loginBtn: "লগইন করুন",
  errorMsg: "ভুল আইডি বা পাসওয়ার্ড",
  idPlaceholder: "আইডি দিন",
  passPlaceholder: "••••••••",
  close: "বন্ধ করুন",
  forgetPass: "পাসওয়ার্ড ভুলে গেছেন?",
  show: "দেখুন",
  hide: "লুকান",
  managerPanel: "ম্যানেজার ড্যাশবোর্ড",
  addTenant: "নতুন ভাড়াটিয়া যোগ করুন",
  tenantName: "ভাড়াটিয়ার নাম",
  phone: "মোবাইল নম্বর",
  flatNo: "ফ্ল্যাট নম্বর",
  rent: "ভাড়ার পরিমাণ",
  save: "তথ্য সংরক্ষণ করুন",
  potentialRent: "মোট সম্ভাব্য ভাড়া",
  totalExpense: "মোট খরচ",
  balance: "ব্যালেন্স",
  expenseTitle: "খরচের হিসাব লিখুন",
  expenseDesc: "খরচের বর্ণনা",
  amount: "টাকার পরিমাণ",
  saveBtn: "সেভ করুন",
  tenantList: "ভাড়াটিয়া তালিকা",
  id: "আইডি",
  name: "নাম",
  flat: "ফ্ল্যাট",
  joined: "যোগদানের তারিখ",
  construction: "নির্মাণ কাজ",
  maintenance: "মেইনটেন্যান্স",
  expenseType: "খরচের ধরণ",
  history: "খরচের ইতিহাস",
  rentStatus: "মাসিক ভাড়ার অবস্থা",
  paid: "পরিশোধিত",
  unpaid: "বাকি",
  selectMonth: "মাস সিলেক্ট করুন",
  selectYear: "বছর সিলেক্ট করুন",
  action: "অ্যাকশন",
  nid: "এনআইডি নম্বর",
  occupation: "পেশা",
  securityDeposit: "জামানত/অ্যাডভান্স",
  emergencyContact: "জরুরি যোগাযোগ নম্বর",
  viewFull: "সম্পূর্ণ প্রোফাইল দেখুন",
  unit: "ইউনিট",
  jan: "জানুয়ারি",
  feb: "ফেব্রুয়ারি",
  mar: "মার্চ",
  apr: "এপ্রিল",
  may: "মে",
  jun: "জুন",
  jul: "জুলাই",
  aug: "আগস্ট",
  sep: "সেপ্টেম্বর",
  oct: "অক্টোবর",
  nov: "নভেম্বর",
  dec: "ডিসেম্বর",
  monthlyIncome: "মাসিক ইনকাম",
  monthlyExpense: "মাসিক খরচ",
  totalBalance: "মোট ব্যালেন্স",
  markPaid: "পেইড করুন",
  markUnpaid: "বাকি করুন",
  printReport: "রিপোর্ট প্রিন্ট করুন",
  monthlyReport: "মাসিক আর্থিক প্রতিবেদন",
  expenseList: "খরচের তালিকা",
  totalIncome: "মোট আয় (ভাড়া)",
  netProfit: "নিট লাভ",
  rentDetails: "ভাড়া আদায়ের বিবরণ",
  expenseDetails: "খরচের বিবরণ",
  authorizedSign: "কর্তৃপক্ষের স্বাক্ষর",
  buildingMap: "বিল্ডিং ম্যাপ",
  vacant: "খালি",
  occupied: "ভাড়া হয়েছে",
  totalFlats: "মোট ফ্ল্যাট",
  edit: "এডিট",
  delete: "মুছে ফেলুন",
  confirmDelete: "আপনি কি নিশ্চিত যে এটি মুছে ফেলতে চান?",
  updateBtn: "তথ্য আপডেট করুন",
  ownerPanel: "মালিকের ড্যাশবোর্ড",
  allTimeIncome: "সর্বমোট আয় (ভাড়া)",
  buildingProfit: "বিল্ডিংয়ের মোট লাভ",
  constructionSummary: "নির্মাণ ব্যয়ের সারসংক্ষেপ",
  maintenanceSummary: "মেইনটেন্যান্স সারসংক্ষেপ",
  monthlyComparison: "মাসিক তুলনামূলক চিত্র",
  allTransactions: "পূর্ণাঙ্গ আর্থিক লেজার",
  pendingRent: "বকেয়া ভাড়ার তালিকা",
  constructionLog: "নির্মাণ সামগ্রীর খরচের লগ",
  dailyMaintenance: "দৈনিক মেইনটেন্যান্স খরচ",
  tenantStatusReport: "ভাড়াটিয়া ভিত্তিক রিপোর্ট",
  expectedRent: "প্রত্যাশিত মোট ভাড়া",
  profitMargin: "নিট মুনাফার হার",
  date: "তারিখ",
  description: "বিবরণ",
  category: "বিভাগ",
  expenseHistory: "আয়-ব্যয় লেজার",
  incomeSource: "আয়ের উৎস",
  myProfile: "আমার প্রোফাইল",
  myRentHistory: "আমার ভাড়ার ইতিহাস",
  noticeBoard: "নোটিশ বোর্ড",
  noNotice: "বর্তমানে কোনো নোটিশ নেই।",
  welcomeTenant: "আপনার পোর্টালে স্বাগতম",
  addNotice: "নতুন নোটিশ দিন",
  noticeTitle: "নোটিশের বিষয়",
  noticeMessage: "বিস্তারিত মেসেজ",
  publish: "নোটিশ প্রকাশ করুন",
  serviceCharge: "সার্ভিস চার্জ",
  totalPayable: "সর্বমোট দেয় টাকা",
  confirmPayment: "পেমেন্টের তথ্য নিশ্চিত করুন",
  paymentMethod: "পেমেন্টের মাধ্যম",
  cash: "নগদ / অফলাইন",
  online: "অনলাইন (বিকাশ/ব্যাংক)",
  method: "মাধ্যম",
  rentCollection: "ভাড়া আদায়",
  totalServiceCharge: "মোট সার্ভিস চার্জ",
  incomeBreakdown: "আয়ের বিবরণ (ভাড়া আদায়)",
  tenant: "ভাড়াটিয়া",
  totalPaid: "মোট পরিশোধিত",
  printStatement: "স্টেটমেন্ট প্রিন্ট করুন",
  contactManager: "ম্যানেজারের সাথে যোগাযোগ",
  complaints: "মালিকের কাছে অভিযোগ",
  sendComplaint: "মালিককে সরাসরি মেসেজ দিন",
  subject: "অভিযোগের বিষয়",
  message: "আপনার মেসেজ",
  submit: "অভিযোগ জমা দিন",
  pending: "অপেক্ষমান",
  solved: "সমাধান হয়েছে",
  complaintList: "ভাড়াটিয়াদের অভিযোগ তালিকা",
   manager: "ম্যানেজার",
  security: "নিরাপত্তা গার্ড",
  callNow: "কল করুন",
  changePassword: "পাসওয়ার্ড পরিবর্তন",
  currentPassword: "বর্তমান পাসওয়ার্ড",
  newPassword: "নতুন পাসওয়ার্ড",
  updatePassword: "পাসওয়ার্ড আপডেট করুন",
  passChanged: "পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে!",
  passError: "বর্তমান পাসওয়ার্ডটি সঠিক নয়!",
  moveOut: "বাসা ছেড়ে দেওয়া",
  confirmMoveOut: "আপনি কি নিশ্চিত যে এই ভাড়াটিয়া বাসা ছেড়ে দিচ্ছেন?",
  active: "বর্তমান",
  exited: "প্রাক্তন",
  previousTenants: "প্রাক্তন ভাড়াটিয়া তালিকা",
  exitDate: "ছেড়ে দেওয়ার তারিখ",
  loginSuccess: "লগইন সফল হয়েছে! ড্যাশবোর্ডে নিয়ে যাওয়া হচ্ছে...", 
   handoverMoney: "টাকা জমা দিন (মালিককে)",
  handoverHistory: "টাকা স্থানান্তরের ইতিহাস",
  cashWithManager: "ম্যানেজারের কাছে নগদ",
  confirmedFund: "মালিকের কাছে প্রাপ্ত টাকা",
  amountToHandover: "হ্যান্ডওভারের পরিমাণ",
  confirmHandover: "প্রাপ্তি নিশ্চিত করুন",
  confirmed: "গৃহীত",
  handoverSuccess: "টাকা জমা দেওয়ার অনুরোধ মালিকের কাছে পাঠানো হয়েছে।",
  receiveSuccess: "টাকা প্রাপ্তি নিশ্চিত করা হয়েছে।"
};

export const dictionary = { en, bn };
export type Language = "en" | "bn";