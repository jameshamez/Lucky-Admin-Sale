import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  Plus, 
  Phone, 
  Mail, 
  MapPin,
  Calendar,
  Package,
  UserPlus,
  FileText,
  Clock,
  Filter,
  CalendarIcon,
  Receipt,
  Check,
  ChevronsUpDown
} from "lucide-react";

// Thai provinces list
const thaiProvinces = [
  "กรุงเทพมหานคร", "กระบี่", "กาญจนบุรี", "กาฬสินธุ์", "กำแพงเพชร", "ขอนแก่น",
  "จันทบุรี", "ฉะเชิงเทรา", "ชลบุรี", "ชัยนาท", "ชัยภูมิ", "ชุมพร", "เชียงราย",
  "เชียงใหม่", "ตรัง", "ตราด", "ตาก", "นครนายก", "นครปฐม", "นครพนม", "นครราชสีมา",
  "นครศรีธรรมราช", "นครสวรรค์", "นนทบุรี", "นราธิวาส", "น่าน", "บึงกาฬ", "บุรีรัมย์",
  "ปทุมธานี", "ประจวบคีรีขันธ์", "ปราจีนบุรี", "ปัตตานี", "พระนครศรีอยุธยา", "พังงา",
  "พัทลุง", "พิจิตร", "พิษณุโลก", "เพชรบุรี", "เพชรบูรณ์", "แพร่", "ภูเก็ต", "มหาสารคาม",
  "มุกดาหาร", "แม่ฮ่องสอน", "ยโสธร", "ยะลา", "ร้อยเอ็ด", "ระนอง", "ระยอง", "ราชบุรี",
  "ลพบุรี", "ลำปาง", "ลำพูน", "เลย", "ศรีสะเกษ", "สกลนคร", "สงขลา", "สตูล", "สมุทรปราการ",
  "สมุทรสงคราม", "สมุทรสาคร", "สระแก้ว", "สระบุรี", "สิงห์บุรี", "สุโขทัย", "สุพรรณบุรี",
  "สุราษฎร์ธานี", "สุรินทร์", "หนองคาย", "หนองบัวลำภู", "อ่างทอง", "อำนาจเจริญ",
  "อุดรธานี", "อุตรดิตถ์", "อุทัยธานี", "อุบลราชธานี"
];

interface Customer {
  id: string;
  name: string;
  contact: string;
  phone: string;
  email: string;
  address: string;
  businessType: string;
  totalOrders: number;
  totalValue: number;
  lastContact: string;
  status: string;
}

export default function CustomerManagement() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [businessTypeFilter, setBusinessTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [isQuotationOpen, setIsQuotationOpen] = useState(false);
  const [provinceOpen, setProvinceOpen] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCustomer, setNewCustomer] = useState({
    // ส่วนที่ 1: ข้อมูลบริษัท/องค์กร
    companyName: "",
    customerType: "เจ้าของงาน",
    province: "",
    address: "",
    taxId: "",
    
    // ส่วนที่ 2: ข้อมูลผู้ติดต่อหลัก
    contactName: "",
    phoneNumbers: [""],
    emails: [""],
    lineId: "",
    
    // ข้อมูลผู้ติดต่อเพิ่มเติม
    additionalContacts: [],
    
    // ส่วนที่ 3: การนำเสนอ
    presentationStatus: "เสนอขาย",
    contactCount: 1,
    lastContactDate: new Date(),
    interestedProducts: "",
    
    // ส่วนที่ 4: ข้อมูลภายใน
    responsiblePerson: "พนักงานขายปัจจุบัน",
    customerStatus: "ลูกค้าใหม่",
    howFoundUs: "Facebook",
    otherChannel: "",
    notes: ""
  });
  const { toast } = useToast();

  // Fetch customers from database
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching customers:', error);
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถดึงข้อมูลลูกค้าได้",
          variant: "destructive"
        });
        return;
      }

      // Transform data to match interface
      const transformedCustomers: Customer[] = data.map(customer => ({
        id: customer.id,
        name: customer.company_name,
        contact: customer.contact_name,
        phone: customer.phone_numbers?.[0] || '',
        email: customer.emails?.[0] || '',
        address: customer.province || '',
        businessType: customer.business_type || 'ไม่ระบุ',
        totalOrders: customer.total_orders,
        totalValue: customer.total_value,
        lastContact: customer.last_contact_date?.split('T')[0] || '',
        status: customer.customer_status
      }));

      setCustomers(transformedCustomers);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const addPhoneNumber = () => {
    setNewCustomer(prev => ({
      ...prev,
      phoneNumbers: [...prev.phoneNumbers, ""]
    }));
  };

  const addEmail = () => {
    setNewCustomer(prev => ({
      ...prev,
      emails: [...prev.emails, ""]
    }));
  };

  const updatePhoneNumber = (index: number, value: string) => {
    setNewCustomer(prev => ({
      ...prev,
      phoneNumbers: prev.phoneNumbers.map((phone, i) => i === index ? value : phone)
    }));
  };

  const updateEmail = (index: number, value: string) => {
    setNewCustomer(prev => ({
      ...prev,
      emails: prev.emails.map((email, i) => i === index ? value : email)
    }));
  };

  const removePhoneNumber = (index: number) => {
    if (newCustomer.phoneNumbers.length > 1) {
      setNewCustomer(prev => ({
        ...prev,
        phoneNumbers: prev.phoneNumbers.filter((_, i) => i !== index)
      }));
    }
  };

  const removeEmail = (index: number) => {
    if (newCustomer.emails.length > 1) {
      setNewCustomer(prev => ({
        ...prev,
        emails: prev.emails.filter((_, i) => i !== index)
      }));
    }
  };

  // Additional contacts functions
  const addAdditionalContact = () => {
    setNewCustomer(prev => ({
      ...prev,
      additionalContacts: [...prev.additionalContacts, {
        contactName: "",
        lineId: "",
        phoneNumber: "",
        email: ""
      }]
    }));
  };

  const updateAdditionalContact = (index: number, field: string, value: string) => {
    setNewCustomer(prev => ({
      ...prev,
      additionalContacts: prev.additionalContacts.map((contact, i) => 
        i === index ? { ...contact, [field]: value } : contact
      )
    }));
  };

  const removeAdditionalContact = (index: number) => {
    setNewCustomer(prev => ({
      ...prev,
      additionalContacts: prev.additionalContacts.filter((_, i) => i !== index)
    }));
  };

  const handleAddCustomer = async () => {
    // Basic validation
    if (!newCustomer.companyName || !newCustomer.contactName || !newCustomer.phoneNumbers[0] || !newCustomer.interestedProducts) {
      toast({
        title: "ข้อมูลไม่ครบถ้วน",
        description: "กรุณากรอกข้อมูลในช่องที่จำเป็นทั้งหมด",
        variant: "destructive"
      });
      return;
    }

    try {
      // Filter out empty phone numbers and emails
      const filteredPhoneNumbers = newCustomer.phoneNumbers.filter(phone => phone.trim() !== '');
      const filteredEmails = newCustomer.emails.filter(email => email.trim() !== '');

      const customerData = {
        company_name: newCustomer.companyName,
        customer_type: newCustomer.customerType,
        province: newCustomer.province,
        address: newCustomer.address,
        tax_id: newCustomer.taxId,
        contact_name: newCustomer.contactName,
        phone_numbers: filteredPhoneNumbers,
        emails: filteredEmails,
        line_id: newCustomer.lineId,
        presentation_status: newCustomer.presentationStatus,
        contact_count: newCustomer.contactCount,
        last_contact_date: newCustomer.lastContactDate.toISOString(),
        interested_products: newCustomer.interestedProducts,
        responsible_person: newCustomer.responsiblePerson,
        customer_status: newCustomer.customerStatus,
        how_found_us: newCustomer.howFoundUs,
        other_channel: newCustomer.otherChannel,
        notes: newCustomer.notes,
        business_type: newCustomer.customerType === 'เจ้าของงาน' ? 'องค์กร' : 'ตัวแทน'
      };

      const { data: insertedCustomer, error } = await supabase
        .from('customers')
        .insert([customerData])
        .select()
        .single();

      if (error) {
        console.error('Error adding customer:', error);
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถเพิ่มลูกค้าใหม่ได้",
          variant: "destructive"
        });
        return;
      }

      // Insert additional contacts if any
      if (newCustomer.additionalContacts.length > 0) {
        const validAdditionalContacts = newCustomer.additionalContacts.filter(
          contact => contact.contactName.trim() !== '' && contact.phoneNumber.trim() !== ''
        );
        
        if (validAdditionalContacts.length > 0) {
          const contactsData = validAdditionalContacts.map(contact => ({
            customer_id: insertedCustomer.id,
            contact_name: contact.contactName,
            line_id: contact.lineId,
            phone_number: contact.phoneNumber,
            email: contact.email
          }));

          const { error: contactsError } = await supabase
            .from('customer_contacts')
            .insert(contactsData);

          if (contactsError) {
            console.error('Error adding additional contacts:', contactsError);
            // Don't fail the entire operation, just log the error
          }
        }
      }

      toast({
        title: "เพิ่มลูกค้าใหม่สำเร็จ!",
        description: `เพิ่มข้อมูลลูกค้า ${newCustomer.companyName} เรียบร้อยแล้ว`,
      });
      
      setIsAddCustomerOpen(false);
      
      // Refresh customer list
      await fetchCustomers();
      
      // Reset form
      setNewCustomer({
        companyName: "",
        customerType: "เจ้าของงาน",
        province: "",
        address: "",
        taxId: "",
        contactName: "",
        phoneNumbers: [""],
        emails: [""],
        lineId: "",
        additionalContacts: [],
        presentationStatus: "เสนอขาย",
        contactCount: 1,
        lastContactDate: new Date(),
        interestedProducts: "",
        responsiblePerson: "พนักงานขายปัจจุบัน",
        customerStatus: "ลูกค้าใหม่",
        howFoundUs: "Facebook",
        otherChannel: "",
        notes: ""
      });
    } catch (error) {
      console.error('Error adding customer:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถเพิ่มลูกค้าใหม่ได้",
        variant: "destructive"
      });
    }
  };

  const handleCreateQuotation = () => {
    if (!selectedCustomer) {
      toast({
        title: "กรุณาเลือกลูกค้า",
        description: "โปรดเลือกลูกค้าก่อนสร้างใบเสนอราคา",
        variant: "destructive"
      });
      return;
    }
    
    console.log("Creating quotation for:", selectedCustomer);
    toast({
      title: "สร้างใบเสนอราคา",
      description: `กำลังสร้างใบเสนอราคาสำหรับ ${selectedCustomer.name}`,
    });
    setIsQuotationOpen(false);
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.phone.includes(searchTerm);
    
    const matchesBusinessType = businessTypeFilter === "all" || customer.businessType === businessTypeFilter;
    const matchesStatus = statusFilter === "all" || customer.status === statusFilter;
    
    // Date range filtering
    let matchesDate = true;
    if (dateRange?.from || dateRange?.to) {
      const customerDate = new Date(customer.lastContact + "T00:00:00");
      
      if (dateRange.from && dateRange.to) {
        matchesDate = customerDate >= dateRange.from && customerDate <= dateRange.to;
      } else if (dateRange.from) {
        matchesDate = customerDate >= dateRange.from;
      } else if (dateRange.to) {
        matchesDate = customerDate <= dateRange.to;
      }
    }
    
    return matchesSearch && matchesBusinessType && matchesStatus && matchesDate;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ลูกค้า VIP": return "bg-accent text-accent-foreground";
      case "ลูกค้าประจำ": return "bg-primary text-primary-foreground";
      case "ลูกค้าใหม่": return "bg-secondary text-secondary-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  // Calculate KPI metrics
  const calculateKPIs = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    // New customers this month
    const newCustomersThisMonth = customers.filter(customer => {
      const createdDate = new Date(customer.lastContact); // Using lastContact as proxy for creation date
      return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear;
    }).length;

    // Outstanding quotes (customers with presentation status "เสนอขาย")
    const outstandingQuotes = customers.filter(customer => 
      customer.status === "ลูกค้าใหม่" || customer.businessType === "เสนอขาย"
    ).length;

    // Customers not contacted for over 30 days
    const inactiveCustomers = customers.filter(customer => {
      const lastContactDate = new Date(customer.lastContact + "T00:00:00");
      return lastContactDate < thirtyDaysAgo;
    }).length;

    return {
      newCustomersThisMonth,
      outstandingQuotes,
      inactiveCustomers
    };
  };

  const kpis = calculateKPIs();

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center pb-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">จัดการลูกค้า</h1>
          <p className="text-muted-foreground">ค้นหาและจัดการข้อมูลลูกค้าทั้งหมด</p>
        </div>
        <div className="flex gap-3">
          <Dialog open={isAddCustomerOpen} onOpenChange={setIsAddCustomerOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                เพิ่มลูกค้าใหม่
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>เพิ่มลูกค้าใหม่</DialogTitle>
                <DialogDescription>
                  กรอกข้อมูลครบถ้วนสำหรับลูกค้าใหม่ แบ่งออกเป็น 4 ส่วนหลัก
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                {/* ส่วนที่ 1: ข้อมูลบริษัท/องค์กร */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">1</div>
                    <h3 className="text-lg font-semibold">ข้อมูลบริษัท / องค์กร</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-8">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">ชื่อบริษัท <span className="text-red-500">*</span></Label>
                      <Input
                        id="companyName"
                        value={newCustomer.companyName}
                        onChange={(e) => setNewCustomer({...newCustomer, companyName: e.target.value})}
                        placeholder="กรอกชื่อบริษัทหรือองค์กร"
                        className="bg-background"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="customerType">ประเภทลูกค้า</Label>
                      <Select value={newCustomer.customerType} onValueChange={(value) => setNewCustomer({...newCustomer, customerType: value})}>
                        <SelectTrigger className="bg-background">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-background">
                          <SelectItem value="เจ้าของงาน">เจ้าของงาน</SelectItem>
                          <SelectItem value="ตัวแทน">ตัวแทน</SelectItem>
                          <SelectItem value="ออแกนไนเซอร์">ออแกนไนเซอร์</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                     <div className="space-y-2">
                       <Label htmlFor="province">จังหวัด</Label>
                       <Popover open={provinceOpen} onOpenChange={setProvinceOpen}>
                         <PopoverTrigger asChild>
                           <Button
                             variant="outline"
                             role="combobox"
                             aria-expanded={provinceOpen}
                             className="w-full justify-between bg-background"
                           >
                             {newCustomer.province
                               ? thaiProvinces.find((province) => province === newCustomer.province)
                               : "เลือกจังหวัด..."}
                             <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                           </Button>
                         </PopoverTrigger>
                         <PopoverContent className="w-full p-0 bg-background">
                           <Command className="bg-background">
                             <CommandInput placeholder="ค้นหาจังหวัด..." className="bg-background" />
                             <CommandEmpty>ไม่พบจังหวัดที่ค้นหา</CommandEmpty>
                             <CommandGroup className="max-h-64 overflow-auto">
                               {thaiProvinces.map((province) => (
                                 <CommandItem
                                   key={province}
                                   value={province}
                                   onSelect={(currentValue) => {
                                     setNewCustomer({...newCustomer, province: currentValue === newCustomer.province ? "" : province});
                                     setProvinceOpen(false);
                                   }}
                                   className="cursor-pointer"
                                 >
                                   <Check
                                     className={cn(
                                       "mr-2 h-4 w-4",
                                       newCustomer.province === province ? "opacity-100" : "opacity-0"
                                     )}
                                   />
                                   {province}
                                 </CommandItem>
                               ))}
                             </CommandGroup>
                           </Command>
                         </PopoverContent>
                       </Popover>
                     </div>

                     <div className="space-y-2">
                       <Label htmlFor="address">ที่อยู่</Label>
                       <Textarea
                         id="address"
                         value={newCustomer.address}
                         onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})}
                         placeholder="กรอกที่อยู่..."
                         rows={2}
                         className="bg-background"
                       />
                     </div>

                     <div className="space-y-2 md:col-span-2">
                       <Label htmlFor="taxId">เลขประจำตัวผู้เสียภาษี</Label>
                       <Input
                         id="taxId"
                         value={newCustomer.taxId}
                         onChange={(e) => setNewCustomer({...newCustomer, taxId: e.target.value})}
                         placeholder="เลขประจำตัวผู้เสียภาษี 13 หลัก (ไม่บังคับ)"
                         className="bg-background"
                       />
                     </div>
                  </div>
                </div>

                <Separator />

                {/* ส่วนที่ 2: ข้อมูลผู้ติดต่อหลัก */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">2</div>
                    <h3 className="text-lg font-semibold">ข้อมูลผู้ติดต่อหลัก</h3>
                  </div>
                  
                  <div className="space-y-4 ml-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="contactName">ชื่อ-นามสกุล <span className="text-red-500">*</span></Label>
                        <Input
                          id="contactName"
                          value={newCustomer.contactName}
                          onChange={(e) => setNewCustomer({...newCustomer, contactName: e.target.value})}
                          placeholder="กรอกชื่อ-นามสกุลผู้ติดต่อ"
                          className="bg-background"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="lineId">ID Line</Label>
                        <Input
                          id="lineId"
                          value={newCustomer.lineId}
                          onChange={(e) => setNewCustomer({...newCustomer, lineId: e.target.value})}
                          placeholder="Line ID (ไม่บังคับ)"
                          className="bg-background"
                        />
                      </div>
                    </div>

                    {/* เบอร์โทรศัพท์ (หลายเบอร์) */}
                    <div className="space-y-2">
                      <Label>เบอร์โทรศัพท์ <span className="text-red-500">*</span></Label>
                      {newCustomer.phoneNumbers.map((phone, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={phone}
                            onChange={(e) => updatePhoneNumber(index, e.target.value)}
                            placeholder="08X-XXX-XXXX"
                            className="bg-background"
                          />
                          {newCustomer.phoneNumbers.length > 1 && (
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="icon"
                              onClick={() => removePhoneNumber(index)}
                            >
                              ×
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={addPhoneNumber}
                      >
                        + เพิ่มเบอร์โทรศัพท์
                      </Button>
                    </div>

                    {/* อีเมล (หลายอีเมล) */}
                    <div className="space-y-2">
                      <Label>อีเมล</Label>
                      {newCustomer.emails.map((email, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            type="email"
                            value={email}
                            onChange={(e) => updateEmail(index, e.target.value)}
                            placeholder="email@example.com"
                            className="bg-background"
                          />
                          {newCustomer.emails.length > 1 && (
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="icon"
                              onClick={() => removeEmail(index)}
                            >
                              ×
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={addEmail}
                      >
                       + เพิ่มอีเมล
                       </Button>
                     </div>

                     {/* ข้อมูลผู้ติดต่อเพิ่มเติม */}
                     <div className="space-y-4">
                       <div className="flex items-center justify-between">
                         <Label>ข้อมูลผู้ติดต่อเพิ่มเติม</Label>
                         <Button 
                           type="button" 
                           variant="outline" 
                           size="sm" 
                           onClick={addAdditionalContact}
                         >
                           + เพิ่มผู้ติดต่อ
                         </Button>
                       </div>
                       
                       {newCustomer.additionalContacts.map((contact, index) => (
                         <div key={index} className="border rounded-lg p-4 space-y-3">
                           <div className="flex items-center justify-between">
                             <span className="text-sm font-medium">ผู้ติดต่อที่ {index + 2}</span>
                             <Button 
                               type="button" 
                               variant="outline" 
                               size="sm"
                               onClick={() => removeAdditionalContact(index)}
                             >
                               ลบ
                             </Button>
                           </div>
                           
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                             <div className="space-y-2">
                               <Label>ชื่อ-นามสกุล <span className="text-red-500">*</span></Label>
                               <Input
                                 value={contact.contactName}
                                 onChange={(e) => updateAdditionalContact(index, 'contactName', e.target.value)}
                                 placeholder="กรอกชื่อ-นามสกุล"
                                 className="bg-background"
                               />
                             </div>
                             
                             <div className="space-y-2">
                               <Label>ID Line</Label>
                               <Input
                                 value={contact.lineId}
                                 onChange={(e) => updateAdditionalContact(index, 'lineId', e.target.value)}
                                 placeholder="Line ID (ไม่บังคับ)"
                                 className="bg-background"
                               />
                             </div>
                             
                             <div className="space-y-2">
                               <Label>เบอร์โทรศัพท์ <span className="text-red-500">*</span></Label>
                               <Input
                                 value={contact.phoneNumber}
                                 onChange={(e) => updateAdditionalContact(index, 'phoneNumber', e.target.value)}
                                 placeholder="08X-XXX-XXXX"
                                 className="bg-background"
                               />
                             </div>
                             
                             <div className="space-y-2">
                               <Label>อีเมล</Label>
                               <Input
                                 type="email"
                                 value={contact.email}
                                 onChange={(e) => updateAdditionalContact(index, 'email', e.target.value)}
                                 placeholder="email@example.com"
                                 className="bg-background"
                               />
                             </div>
                           </div>
                         </div>
                       ))}
                     </div>
                   </div>
                 </div>

                <Separator />

                {/* ส่วนที่ 3: การนำเสนอ */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">3</div>
                    <h3 className="text-lg font-semibold">การนำเสนอ (สำหรับฝ่ายขาย)</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-8">
                    <div className="space-y-2">
                      <Label htmlFor="presentationStatus">สถานะการเสนอ</Label>
                      <Select value={newCustomer.presentationStatus} onValueChange={(value) => setNewCustomer({...newCustomer, presentationStatus: value})}>
                        <SelectTrigger className="bg-background">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-background">
                          <SelectItem value="เสนอขาย">เสนอขาย</SelectItem>
                          <SelectItem value="ติดตาม">ติดตาม</SelectItem>
                          <SelectItem value="ปิดการขาย">ปิดการขาย</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="contactCount">จำนวนครั้งที่ติดต่อ</Label>
                      <Input
                        id="contactCount"
                        type="number"
                        min="1"
                        value={newCustomer.contactCount}
                        onChange={(e) => setNewCustomer({...newCustomer, contactCount: parseInt(e.target.value) || 1})}
                        className="bg-background"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>วันที่และเวลาติดต่อ</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal bg-background",
                              !newCustomer.lastContactDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {newCustomer.lastContactDate ? format(newCustomer.lastContactDate, "dd/MM/yyyy") : "เลือกวันที่"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-background" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={newCustomer.lastContactDate}
                            onSelect={(date) => setNewCustomer({...newCustomer, lastContactDate: date || new Date()})}
                            initialFocus
                            className={cn("p-3 pointer-events-auto")}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="interestedProducts">สินค้าที่สนใจ <span className="text-red-500">*</span></Label>
                      <Textarea
                        id="interestedProducts"
                        value={newCustomer.interestedProducts}
                        onChange={(e) => setNewCustomer({...newCustomer, interestedProducts: e.target.value})}
                        placeholder="ระบุสินค้าหรือบริการที่ลูกค้าสนใจ..."
                        rows={3}
                        className="bg-background"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* ส่วนที่ 4: ข้อมูลภายใน */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">4</div>
                    <h3 className="text-lg font-semibold">ข้อมูลภายใน (สำหรับฝ่ายขาย)</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-8">
                    <div className="space-y-2">
                      <Label htmlFor="responsiblePerson">ผู้รับผิดชอบ</Label>
                      <Select value={newCustomer.responsiblePerson} onValueChange={(value) => setNewCustomer({...newCustomer, responsiblePerson: value})}>
                        <SelectTrigger className="bg-background">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-background">
                          <SelectItem value="พนักงานขายปัจจุบัน">พนักงานขายปัจจุบัน</SelectItem>
                          <SelectItem value="สมชาย ใจดี">สมชาย ใจดี</SelectItem>
                          <SelectItem value="สมหญิง รักลูกค้า">สมหญิง รักลูกค้า</SelectItem>
                          <SelectItem value="วิเชียร ชนะใจ">วิเชียร ชนะใจ</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="customerStatus">สถานะลูกค้า</Label>
                      <Select value={newCustomer.customerStatus} onValueChange={(value) => setNewCustomer({...newCustomer, customerStatus: value})}>
                        <SelectTrigger className="bg-background">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-background">
                          <SelectItem value="ลูกค้าใหม่">ลูกค้าใหม่</SelectItem>
                          <SelectItem value="ลูกค้าเก่า">ลูกค้าเก่า</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="howFoundUs">ช่องทางที่รู้จักเรา</Label>
                      <Select value={newCustomer.howFoundUs} onValueChange={(value) => setNewCustomer({...newCustomer, howFoundUs: value})}>
                        <SelectTrigger className="bg-background">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-background">
                          <SelectItem value="Facebook">Facebook</SelectItem>
                          <SelectItem value="Google">Google</SelectItem>
                          <SelectItem value="ลูกค้าแนะนำ">ลูกค้าแนะนำ</SelectItem>
                          <SelectItem value="อื่นๆ">อื่นๆ</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {newCustomer.howFoundUs === "อื่นๆ" && (
                      <div className="space-y-2">
                        <Label htmlFor="otherChannel">โปรดระบุ</Label>
                        <Input
                          id="otherChannel"
                          value={newCustomer.otherChannel}
                          onChange={(e) => setNewCustomer({...newCustomer, otherChannel: e.target.value})}
                          placeholder="ระบุช่องทางอื่นๆ"
                          className="bg-background"
                        />
                      </div>
                    )}

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="notes">หมายเหตุ</Label>
                      <Textarea
                        id="notes"
                        value={newCustomer.notes}
                        onChange={(e) => setNewCustomer({...newCustomer, notes: e.target.value})}
                        placeholder="บันทึกข้อมูลเพิ่มเติมที่สำคัญ..."
                        rows={3}
                        className="bg-background"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-6 border-t">
                <Button variant="outline" onClick={() => setIsAddCustomerOpen(false)}>
                  ยกเลิก
                </Button>
                <Button onClick={handleAddCustomer} className="bg-primary hover:bg-primary/90">
                  บันทึกลูกค้าใหม่
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Dashboard */}
      <div className="mb-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-foreground">สรุปภาพรวม</h2>
          <p className="text-muted-foreground text-sm">ตัวเลขสำคัญของลูกค้าในความดูแล</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatsCard
            title="จำนวนลูกค้าใหม่ในเดือนนี้"
            value={kpis.newCustomersThisMonth}
            icon={<UserPlus className="w-4 h-4" />}
            trend="neutral"
            className="bg-card hover:bg-accent/5"
          />
          
          <StatsCard
            title="ใบเสนอราคาที่ยังไม่ปิดการขาย"
            value={kpis.outstandingQuotes}
            icon={<FileText className="w-4 h-4" />}
            trend="neutral"
            className="bg-card hover:bg-accent/5"
          />
          
          <StatsCard
            title="ลูกค้าไม่ได้ติดต่อเกิน 30 วัน"
            value={kpis.inactiveCustomers}
            icon={<Clock className="w-4 h-4" />}
            trend={kpis.inactiveCustomers > 0 ? "down" : "neutral"}
            change={kpis.inactiveCustomers > 0 ? "ต้องการติดตาม" : "อัปเดต"}
            className="bg-card hover:bg-accent/5"
          />
        </div>
      </div>

      {/* Main Content - Use remaining space */}
      <div className="flex-1 flex flex-col min-h-0">
        <Card className="flex-1 flex flex-col">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              ค้นหาลูกค้า
            </CardTitle>

            {/* Search and Filters */}
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="ค้นหาลูกค้า (ชื่อ, ผู้ติดต่อ, เบอร์โทร)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Filter className="w-4 h-4" />
                  <span>ตัวกรอง:</span>
                </div>
                
                <div className="flex flex-wrap gap-3 flex-1">
                  <Select value={businessTypeFilter} onValueChange={setBusinessTypeFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="ประเภทธุรกิจ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">ทุกประเภท</SelectItem>
                      <SelectItem value="องค์กร">องค์กร</SelectItem>
                      <SelectItem value="โรงเรียน">โรงเรียน</SelectItem>
                      <SelectItem value="หน่วยงาน">หน่วยงาน</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-36">
                      <SelectValue placeholder="สถานะ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">ทุกสถานะ</SelectItem>
                      <SelectItem value="ลูกค้าใหม่">ลูกค้าใหม่</SelectItem>
                      <SelectItem value="ลูกค้าประจำ">ลูกค้าประจำ</SelectItem>
                      <SelectItem value="ลูกค้า VIP">ลูกค้า VIP</SelectItem>
                    </SelectContent>
                  </Select>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="date"
                        variant="outline"
                        className={cn(
                          "w-56 justify-start text-left font-normal",
                          !dateRange && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange?.from ? (
                          dateRange.to ? (
                            <>
                              {format(dateRange.from, "dd/MM/yyyy")} -{" "}
                              {format(dateRange.to, "dd/MM/yyyy")}
                            </>
                          ) : (
                            format(dateRange.from, "dd/MM/yyyy")
                          )
                        ) : (
                          <span>เลือกช่วงวันที่</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange?.from}
                        selected={dateRange}
                        onSelect={setDateRange}
                        numberOfMonths={2}
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>

                  {(businessTypeFilter !== "all" || statusFilter !== "all" || dateRange) && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setBusinessTypeFilter("all");
                        setStatusFilter("all");
                        setDateRange(undefined);
                      }}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      ล้างตัวกรอง
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 p-0 overflow-hidden">
            <div className="h-full overflow-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-background z-10">
                  <TableRow>
                    <TableHead className="w-[300px]">ชื่อลูกค้า/บริษัท</TableHead>
                    <TableHead className="w-[250px]">ผู้ติดต่อ</TableHead>
                    <TableHead className="w-[150px]">ประเภทธุรกิจ</TableHead>
                    <TableHead className="w-[130px]">สถานะ</TableHead>
                    <TableHead className="w-[160px]">วันที่ติดต่อล่าสุด</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                          <span className="ml-2">กำลังโหลดข้อมูล...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredCustomers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <p className="text-muted-foreground">ไม่พบข้อมูลลูกค้า</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCustomers.map((customer) => (
                      <TableRow 
                        key={customer.id}
                        className={`cursor-pointer transition-colors hover:bg-accent/50 ${
                          selectedCustomer?.id === customer.id ? 'bg-accent' : ''
                        }`}
                        onClick={() => navigate(`/sales/customers/${customer.id}`)}
                      >
                        <TableCell className="font-medium">
                          <div>
                            <div className="font-semibold">{customer.name}</div>
                            <div className="text-sm text-muted-foreground">{customer.phone}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div>{customer.contact}</div>
                            <div className="text-sm text-muted-foreground">{customer.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{customer.businessType}</span>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(customer.status)}>
                            {customer.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{customer.lastContact}</div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
