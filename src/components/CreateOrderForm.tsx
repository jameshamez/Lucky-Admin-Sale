import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Plus, X, Upload } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

// Define the form schema
const createOrderSchema = z.object({
  // Section 1: Sales Employee
  responsiblePerson: z.string().min(1, "กรุณาระบุพนักงานที่รับผิดชอบ"),
  
  // Section 2: Customer Information
  customerSearch: z.string().optional(),
  customerName: z.string().min(1, "กรุณาระบุชื่อลูกค้า"),
  customerPhone: z.string().min(1, "กรุณาระบุเบอร์โทรศัพท์"),
  customerLine: z.string().optional(),
  customerEmail: z.string().optional(),
  requireTaxInvoice: z.boolean().optional(),
  taxPayerName: z.string().optional(),
  taxId: z.string().optional(),
  taxAddress: z.string().optional(),
  
  // Section 3: Order Information
  jobId: z.string().optional(),
  quotationNumber: z.string().optional(),
  urgencyLevel: z.string().min(1, "กรุณาเลือกความเร่งด่วน"),
  jobName: z.string().min(1, "กรุณาระบุชื่องาน"),
  usageDate: z.date().optional(),
  deliveryDate: z.date().optional(),
  budget: z.string().optional(),
  depositSlip: z.any().optional(),
  fullPaymentSlip: z.any().optional(),
  productType: z.string().min(1, "กรุณาเลือกประเภทสินค้า"),
  material: z.string().optional(),
  
  // Section 4: Job Details (dynamic based on product type)
  jobDetails: z.object({
    customerReferenceImages: z.any().optional(),
    referenceImages: z.any().optional(),
    fileName: z.string().optional(),
    fileChannel: z.string().optional(),
    size: z.string().optional(),
    thickness: z.string().optional(),
    shape: z.string().optional(),
    quantity: z.string().optional(),
    colors: z.array(z.string()).optional(),
    frontDetails: z.array(z.string()).optional(),
    backDetails: z.array(z.string()).optional(),
    lanyardSize: z.string().optional(),
    lanyardQuantity: z.string().optional(),
    moldCost: z.string().optional(),
    notes: z.string().optional(),
    model: z.string().optional(),
    engraving: z.string().optional(),
    engravingDetails: z.string().optional(),
    engravingFiles: z.any().optional(),
    attachedFiles: z.any().optional(),
    customType: z.string().optional(),
  }).optional(),
  
  // Section 5: Delivery Information
  deliveryType: z.string().min(1, "กรุณาเลือกรูปแบบการรับสินค้า"),
  deliveryInfo: z.object({
    recipientName: z.string().optional(),
    recipientPhone: z.string().optional(),
    address: z.string().optional(),
    subdistrict: z.string().optional(),
    district: z.string().optional(),
    province: z.string().optional(),
    postalCode: z.string().optional(),
    deliveryMethod: z.string().optional(),
    preferredDeliveryDate: z.date().optional(),
    paymentMethod: z.string().optional(),
    shippingPaymentProof: z.any().optional(),
    deliveryInstructions: z.string().optional(),
    pickupTime: z.string().optional(),
  }).optional(),
});

type CreateOrderFormData = z.infer<typeof createOrderSchema>;

interface CreateOrderFormProps {
  onSubmit: (data: CreateOrderFormData) => void;
  onCancel: () => void;
  initialData?: any;
}

export default function CreateOrderForm({ onSubmit, onCancel, initialData }: CreateOrderFormProps) {
  const [productItems, setProductItems] = useState<any[]>([]);
  const [savedProducts, setSavedProducts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showTaxFields, setShowTaxFields] = useState(false);
  const [deliveryType, setDeliveryType] = useState<string>("parcel");
  const [customSize, setCustomSize] = useState("");
  const [showCustomSize, setShowCustomSize] = useState(false);
  const [selectedSize, setSelectedSize] = useState("");
  const [shapeFiles, setShapeFiles] = useState<File[]>([]);
  
  const form = useForm<CreateOrderFormData>({
    resolver: zodResolver(createOrderSchema),
    defaultValues: initialData || {
      responsiblePerson: "",
      urgencyLevel: "",
      productType: "",
      deliveryInfo: {
        recipientName: "",
        recipientPhone: "",
        address: "",
        subdistrict: "",
        district: "",
        province: "",
        postalCode: "",
        deliveryMethod: "",
        paymentMethod: "",
        deliveryInstructions: "",
      },
    },
  });

  const watchedProductType = form.watch("productType");
  const watchedMaterial = form.watch("material");
  const watchedCustomerName = form.watch("customerName");
  const watchedCustomerPhone = form.watch("customerPhone");
  const watchedDeliveryDate = form.watch("deliveryDate");
  const watchedCustomerSearch = form.watch("customerSearch");

  // Load customers on component mount
  useEffect(() => {
    const loadCustomers = async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*');
      
      if (data && !error) {
        setCustomers(data);
      }
    };
    
    loadCustomers();
  }, []);

  // Search customers
  useEffect(() => {
    if (watchedCustomerSearch && watchedCustomerSearch.length > 2) {
      const filtered = customers.filter(customer => 
        customer.contact_name?.toLowerCase().includes(watchedCustomerSearch.toLowerCase()) ||
        customer.company_name?.toLowerCase().includes(watchedCustomerSearch.toLowerCase()) ||
        customer.line_id?.toLowerCase().includes(watchedCustomerSearch.toLowerCase()) ||
        customer.phone_numbers?.some((phone: string) => phone.includes(watchedCustomerSearch))
      );
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  }, [watchedCustomerSearch, customers]);

  // Select customer from search results
  const selectCustomer = (customer: any) => {
    form.setValue("customerName", customer.contact_name);
    form.setValue("customerPhone", customer.phone_numbers?.[0] || "");
    form.setValue("customerLine", customer.line_id || "");
    form.setValue("customerEmail", customer.emails?.[0] || "");
    setSearchResults([]);
    form.setValue("customerSearch", "");
  };

  // Update recipient info when customer info changes
  const updateRecipientInfo = () => {
    form.setValue("deliveryInfo.recipientName", watchedCustomerName);
    form.setValue("deliveryInfo.recipientPhone", watchedCustomerPhone);
  };

  // Material options based on product type
  const getMaterialOptions = (productType: string) => {
    switch (productType) {
      case "Medal":
        return ["ซิงค์อัลลอย", "อะคริลิค", "คริสตัล", "PVC", "ไม้", "อื่นๆ (โปรดระบุ)"];
      case "Award":
        return ["อะคริลิค", "คริสตัล", "ซิงค์อัลลอย", "อื่นๆ (โปรดระบุ)"];
      case "Trophy":
        return ["ถ้วยดีบุก", "ถ้วยเบญจรงค์", "เรซิน", "อลูมิเนียม", "ตะกั่ว", "อื่นๆ (โปรดระบุ)"];
      case "Lanyard":
        return ["โพลีสกรีน", "ยาง (ริสแบรน)", "กระดาษ (ริสแบรน)", "ผ้าไมโครเรียบ", "ผ้าดาวกระจาย", "ผ้าเม็ดข้าวสาร", "โฟม", "อื่นๆ (โปรดระบุ)"];
      default:
        return [];
    }
  };

  const renderJobDetails = () => {
    switch (watchedProductType) {
      case "Medal":
        return (
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">รายละเอียดเหรียญสั่งผลิต</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="jobDetails.customerReferenceImages"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>รูปอ้างอิงจากลูกค้า</FormLabel>
                    <FormControl>
                      <div className="border-2 border-dashed border-border rounded-lg p-4">
                        <Button type="button" variant="outline" className="w-full">
                          <Upload className="w-4 h-4 mr-2" />
                          อัพโหลดไฟล์ (ได้มากกว่า 1 ไฟล์)
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="jobDetails.referenceImages"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ไฟล์ภาพอ้างอิง</FormLabel>
                    <FormControl>
                      <div className="border-2 border-dashed border-border rounded-lg p-4">
                        <Button type="button" variant="outline" className="w-full">
                          <Upload className="w-4 h-4 mr-2" />
                          อัพโหลดไฟล์ (ได้มากกว่า 1 ไฟล์)
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="jobDetails.fileName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ชื่อไฟล์งาน</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="jobDetails.fileChannel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ช่องทางของไฟล์งาน</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="jobDetails.size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ขนาด</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        setSelectedSize(value);
                        setShowCustomSize(value === "other");
                      }} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="เลือกขนาด" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="6">6 ซม</SelectItem>
                        <SelectItem value="6.5">6.5 ซม</SelectItem>
                        <SelectItem value="7">7 ซม</SelectItem>
                        <SelectItem value="7.5">7.5 ซม</SelectItem>
                        <SelectItem value="other">อื่นๆ</SelectItem>
                      </SelectContent>
                    </Select>
                    {showCustomSize && (
                      <Input 
                        placeholder="ระบุขนาด" 
                        value={customSize}
                        onChange={(e) => {
                          setCustomSize(e.target.value);
                          field.onChange(e.target.value);
                        }}
                        className="mt-2"
                      />
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="jobDetails.thickness"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ความหนา</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="ระบุความหนา" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="jobDetails.quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>จำนวน</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="jobDetails.shape"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>รูปภาพ</FormLabel>
                  <FormControl>
                    <div className="border-2 border-dashed border-border rounded-lg p-4">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          setShapeFiles(files);
                          field.onChange(files);
                        }}
                        className="hidden"
                        id="shape-upload"
                      />
                      <label htmlFor="shape-upload" className="cursor-pointer">
                        <div className="flex flex-col items-center gap-2">
                          <Upload className="w-6 h-6 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {shapeFiles.length > 0 ? `${shapeFiles.length} ไฟล์` : "แนบไฟล์รูป"}
                          </span>
                        </div>
                      </label>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <Label className="text-sm font-medium">สี (เลือกได้มากกว่า 1 รายการ)</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                {[
                  { value: "shinny_gold", label: "สีทองเงา" },
                  { value: "shinny_silver", label: "สีเงินเงา" },
                  { value: "shinny_copper", label: "สีทองแดงเงา" },
                  { value: "antique_gold", label: "สีทองรมดำ" },
                  { value: "antique_silver", label: "สีเงินรมดำ" },
                  { value: "antique_copper", label: "สีทองแดงรมดำ" },
                  { value: "misty_gold", label: "สีทองด้าน" },
                  { value: "misty_silver", label: "สีเงินด้าน" },
                  { value: "misty_copper", label: "สีทองแดงด้าน" },
                ].map((color) => (
                  <div key={color.value} className="flex items-center space-x-2">
                    <Checkbox id={color.value} />
                    <Label htmlFor={color.value} className="text-sm">{color.label}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="jobDetails.frontDetails"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>รายละเอียดด้านหน้า</FormLabel>
                    <Select>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="เลือกรายละเอียด (ได้มากกว่า 1 รายการ)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="option1">ตัวเลือก 1</SelectItem>
                        <SelectItem value="option2">ตัวเลือก 2</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="jobDetails.backDetails"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>รายละเอียดด้านหลัง</FormLabel>
                    <Select>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="เลือกรายละเอียด (ได้มากกว่า 1 รายการ)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="option1">ตัวเลือก 1</SelectItem>
                        <SelectItem value="option2">ตัวเลือก 2</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="jobDetails.lanyardSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ขนาดสายคล้อง</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="เลือกขนาดสายคล้อง" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1.5x90">1.5 × 90 ซม</SelectItem>
                        <SelectItem value="2x90">2 × 90 ซม</SelectItem>
                        <SelectItem value="2.5x90">2.5 × 90 ซม</SelectItem>
                        <SelectItem value="3x90">3 × 90 ซม</SelectItem>
                        <SelectItem value="3.5x90">3.5 × 90 ซม</SelectItem>
                        <SelectItem value="no_lanyard">ไม่รับสาย</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="jobDetails.lanyardQuantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>จำนวนแบบสายคล้อง</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="jobDetails.moldCost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ค่าโมล เพิ่มเติม</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="jobDetails.notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>หมายเหตุ</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case "Trophy":
        return (
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">รายละเอียดถ้วยรางวัล</h4>
            
            <FormField
              control={form.control}
              name="jobDetails.model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>รุ่นโมเดล</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="jobDetails.engraving"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ป้ายจารึก</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกป้ายจารึก" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="accept">รับ</SelectItem>
                      <SelectItem value="decline">ไม่รับ</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch("jobDetails.engraving") === "accept" && (
              <>
                <FormField
                  control={form.control}
                  name="jobDetails.engravingDetails"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>รายละเอียดจารึก</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="jobDetails.engravingFiles"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>แนบไฟล์ป้ายจารึก</FormLabel>
                      <FormControl>
                        <div className="border-2 border-dashed border-border rounded-lg p-4">
                          <Button type="button" variant="outline" className="w-full">
                            <Upload className="w-4 h-4 mr-2" />
                            อัพโหลดไฟล์ (ได้มากกว่า 1 ไฟล์)
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <FormField
              control={form.control}
              name="jobDetails.quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>จำนวน</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="jobDetails.notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>หมายเหตุ</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case "Award":
        return (
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">รายละเอียดโล่</h4>
            
            <FormField
              control={form.control}
              name="jobDetails.model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>รุ่นโมเดล</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="jobDetails.engraving"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ป้ายจารึก</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกป้ายจารึก" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="accept">รับ</SelectItem>
                      <SelectItem value="decline">ไม่รับ</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch("jobDetails.engraving") === "accept" && (
              <>
                <FormField
                  control={form.control}
                  name="jobDetails.engravingDetails"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>รายละเอียดจารึก</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="jobDetails.engravingFiles"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>แนบไฟล์ป้ายจารึก</FormLabel>
                      <FormControl>
                        <div className="border-2 border-dashed border-border rounded-lg p-4">
                          <Button type="button" variant="outline" className="w-full">
                            <Upload className="w-4 h-4 mr-2" />
                            อัพโหลดไฟล์ (ได้มากกว่า 1 ไฟล์)
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <FormField
              control={form.control}
              name="jobDetails.quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>จำนวน</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="jobDetails.notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>หมายเหตุ</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case "Shirt":
      case "Bib":
        return (
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">รายละเอียด{watchedProductType === "Shirt" ? "เสื้อ" : "ป้ายบิบ"}</h4>
            
            <FormField
              control={form.control}
              name="jobDetails.quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>จำนวน</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="jobDetails.attachedFiles"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ไฟล์แนบ</FormLabel>
                  <FormControl>
                    <div className="border-2 border-dashed border-border rounded-lg p-4">
                      <Button type="button" variant="outline" className="w-full">
                        <Upload className="w-4 h-4 mr-2" />
                        อัพโหลดไฟล์
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case "Keychain":
      case "Doll":
      case "Lanyard":
      case "Box packaging":
      case "Bag":
      case "Bottle":
      case "อื่นๆ":
        return (
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">รายละเอียด{watchedProductType}</h4>
            
            {watchedProductType === "อื่นๆ" && (
              <FormField
                control={form.control}
                name="jobDetails.customType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ระบุประเภทสินค้า</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="โปรดระบุประเภทสินค้า" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <FormField
              control={form.control}
              name="jobDetails.quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>จำนวน</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="jobDetails.attachedFiles"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ไฟล์แนบ</FormLabel>
                  <FormControl>
                    <div className="border-2 border-dashed border-border rounded-lg p-4">
                      <Button type="button" variant="outline" className="w-full">
                        <Upload className="w-4 h-4 mr-2" />
                        อัพโหลดไฟล์
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      default:
        return null;
    }
  };

  const saveCurrentProduct = () => {
    const currentProduct = {
      id: Date.now(),
      productType: watchedProductType,
      material: watchedMaterial,
      details: form.getValues("jobDetails"),
    };
    setSavedProducts([...savedProducts, currentProduct]);
    
    // Reset product type and material to allow adding new product
    form.setValue("productType", "");
    form.setValue("material", "");
    form.setValue("jobDetails", {});
  };

  const removeProductItem = (id: number) => {
    setSavedProducts(savedProducts.filter(item => item.id !== id));
  };

  const handleSubmit = (data: CreateOrderFormData) => {
    console.log("Form submitted:", data);
    onSubmit(data);
  };

  const handleEstimatePrice = () => {
    // Auto-save before estimate
    form.handleSubmit(handleSubmit)();
    console.log("Estimating price...");
  };

  const handleOrderProduction = () => {
    // Auto-save before order production
    form.handleSubmit(handleSubmit)();
    console.log("Ordering production...");
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Section 1: Sales Employee */}
        <Card>
          <CardHeader>
            <CardTitle>ส่วนที่ 1: ข้อมูลพนักงานขาย</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="responsiblePerson"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>พนักงานที่รับผิดชอบ</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกพนักงาน" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="employee1">พนักงาน 1</SelectItem>
                      <SelectItem value="employee2">พนักงาน 2</SelectItem>
                      <SelectItem value="employee3">พนักงาน 3</SelectItem>
                      <SelectItem value="employee4">พนักงาน 4</SelectItem>
                      <SelectItem value="employee5">พนักงาน 5</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Section 2: Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle>ส่วนที่ 2: ข้อมูลลูกค้า</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="customerSearch"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ช่องค้นหาลูกค้า</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input {...field} placeholder="ค้นหาจากเบอร์โทร ชื่อลูกค้า หรือชื่อไลน์" />
                      {searchResults.length > 0 && (
                        <div className="absolute z-10 w-full bg-background border border-border rounded-md mt-1 max-h-48 overflow-y-auto">
                          {searchResults.map((customer) => (
                            <div
                              key={customer.id}
                              className="p-2 hover:bg-muted cursor-pointer border-b last:border-b-0"
                              onClick={() => selectCustomer(customer)}
                            >
                              <div className="font-medium">{customer.contact_name}</div>
                              <div className="text-sm text-muted-foreground">
                                {customer.company_name} - {customer.phone_numbers?.[0]}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="customerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ชื่อลูกค้า</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customerPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>เบอร์โทร</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customerLine"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ไลน์</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customerEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>อีเมล</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="requireTaxInvoice" 
                checked={showTaxFields}
                onCheckedChange={(checked) => setShowTaxFields(checked === true)}
              />
              <Label htmlFor="requireTaxInvoice">ออกใบกำกับภาษี</Label>
            </div>

            {showTaxFields && (
              <div className="space-y-4 p-4 border border-border rounded-lg">
                <h4 className="font-medium">ข้อมูลผู้เสียภาษี</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="taxPayerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ชื่อผู้เสียภาษี</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="taxId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>เลขประจำตัวผู้เสียภาษี</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="taxAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ที่อยู่ผู้เสียภาษี</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section 3: Order Information */}
        <Card>
          <CardHeader>
            <CardTitle>ส่วนที่ 3: ข้อมูลการสั่งงาน</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="jobId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>JOB ID</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="JOB-2024-XXX" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quotationNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ใบเสนอราคา</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="urgencyLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ความเร่งด่วน</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกความเร่งด่วน" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="emergency">เร่งด่วน 3-5 ชั่วโมง</SelectItem>
                      <SelectItem value="urgent_1day">ด่วน 1 วัน</SelectItem>
                      <SelectItem value="urgent_2days">ด่วน 2 วัน</SelectItem>
                      <SelectItem value="normal">ปกติ</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="jobName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ชื่องาน</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="usageDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>วันที่ใช้งาน</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>เลือกวันที่</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="deliveryDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>วันที่จัดส่ง</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>เลือกวันที่</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="budget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>งบประมาณ (ถ้าลูกค้ามีงบที่ต้องการ)</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" placeholder="ระบุงบประมาณ" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="depositSlip"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>แนบสลิปค่ามัดจำ</FormLabel>
                    <FormControl>
                      <div className="border-2 border-dashed border-border rounded-lg p-4">
                        <Button type="button" variant="outline" className="w-full">
                          <Upload className="w-4 h-4 mr-2" />
                          อัพโหลดสลิปค่ามัดจำ
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fullPaymentSlip"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>แนบสลิปเต็มจำนวน</FormLabel>
                    <FormControl>
                      <div className="border-2 border-dashed border-border rounded-lg p-4">
                        <Button type="button" variant="outline" className="w-full">
                          <Upload className="w-4 h-4 mr-2" />
                          อัพโหลดสลิปเต็มจำนวน
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="productType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ประเภทสินค้า</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="เลือกประเภทสินค้า" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Medal">Medal (เหรียญรางวัล)</SelectItem>
                        <SelectItem value="Trophy">Trophy (ถ้วยรางวัล)</SelectItem>
                        <SelectItem value="Award">Award (โล่)</SelectItem>
                        <SelectItem value="Shirt">Shirt (เสื้อ)</SelectItem>
                        <SelectItem value="Bib">Bib (ป้ายบิบ)</SelectItem>
                        <SelectItem value="Keychain">Keychain (พวงกุญแจ) ตีราคา</SelectItem>
                        <SelectItem value="Doll">Doll (ตุ๊กตา) ตีราคา</SelectItem>
                        <SelectItem value="Lanyard">Lanyard (สายคล้อง) ตีราคา</SelectItem>
                        <SelectItem value="Box packaging">Box packaging (บรรจุภัณฑ์) ตีราคา</SelectItem>
                        <SelectItem value="Bag">Bag (กระเป๋า) ตีราคา</SelectItem>
                        <SelectItem value="Bottle">Bottle (ขวดน้ำ) ตีราคา</SelectItem>
                        <SelectItem value="อื่นๆ">อื่นๆ</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {watchedProductType && (
                <FormField
                  control={form.control}
                  name="material"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>วัสดุ</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="เลือกวัสดุ" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {getMaterialOptions(watchedProductType).map((material) => (
                            <SelectItem key={material} value={material}>
                              {material}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Saved Products Display */}
        {savedProducts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>สินค้าที่บันทึกแล้ว</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {savedProducts.map((product, index) => (
                  <div key={product.id} className="flex items-center justify-between p-3 border border-border rounded-lg bg-muted/50">
                    <div className="flex-1">
                      <p className="font-medium">สินค้าที่ {index + 1}: {product.productType}</p>
                      <p className="text-sm text-muted-foreground">วัสดุ: {product.material}</p>
                      {product.details?.quantity && (
                        <p className="text-sm text-muted-foreground">จำนวน: {product.details.quantity}</p>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeProductItem(product.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Section 4: Job Details (Dynamic) */}
        {watchedProductType && watchedMaterial && (
          <Card>
            <CardHeader>
              <CardTitle>ส่วนที่ 4: รายละเอียดในการสั่งงาน</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {renderJobDetails()}
                
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button
                    type="button"
                    variant="default"
                    onClick={saveCurrentProduct}
                    className="flex items-center gap-2"
                  >
                    บันทึกสินค้า
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Section 5: Delivery Information */}
        {((watchedProductType && watchedMaterial) || savedProducts.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>ส่วนที่ 5: การจัดส่ง</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Delivery Type Selection */}
            <div>
              <h4 className="font-semibold mb-4">รูปแบบการรับสินค้า</h4>
              <FormField
                control={form.control}
                name="deliveryType"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormControl>
                      <RadioGroup
                        onValueChange={(value) => {
                          field.onChange(value);
                          setDeliveryType(value);
                        }}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="parcel" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            จัดส่งพัสดุ
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="pickup" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            รับที่ร้าน
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Show pickup time if "รับที่ร้าน" is selected */}
            {deliveryType === "pickup" && (
              <div>
                <FormField
                  control={form.control}
                  name="deliveryInfo.pickupTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>เวลาที่จะมารับ</FormLabel>
                      <FormControl>
                        <Input {...field} type="time" placeholder="เลือกเวลา" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Show delivery form if "จัดส่งพัสดุ" is selected */}
            {deliveryType === "parcel" && (
              <>
                {/* 5.1 Recipient Information */}
                <div>
                  <h4 className="font-semibold mb-4">5.1 ข้อมูลผู้รับสินค้า</h4>
              <div className="mb-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={updateRecipientInfo}
                  className="text-sm"
                >
                  ใช้ข้อมูลลูกค้า
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="deliveryInfo.recipientName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ชื่อ-นามสกุลผู้รับ</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="deliveryInfo.recipientPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>เบอร์โทรศัพท์ติดต่อ</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

              </div>
            </div>

            {/* 5.2 Delivery Address */}
            <div>
              <h4 className="font-semibold mb-4">5.2 ที่อยู่สำหรับจัดส่ง</h4>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="deliveryInfo.address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>บ้านเลขที่ / หมู่บ้าน / อาคาร / ห้องเลขที่ ซอย / ถนน</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <FormField
                    control={form.control}
                    name="deliveryInfo.province"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>จังหวัด</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="เลือกจังหวัด" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="bangkok">กรุงเทพมหานคร</SelectItem>
                            <SelectItem value="chiangmai">เชียงใหม่</SelectItem>
                            <SelectItem value="phuket">ภูเก็ต</SelectItem>
                            {/* Add more provinces */}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="deliveryInfo.district"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>เขต/อำเภอ</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="เลือกเขต/อำเภอ" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="district1">เขต/อำเภอ 1</SelectItem>
                            <SelectItem value="district2">เขต/อำเภอ 2</SelectItem>
                            {/* Add more districts based on selected province */}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="deliveryInfo.subdistrict"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>แขวง/ตำบล</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="เลือกแขวง/ตำบล" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="subdistrict1">แขวง/ตำบล 1</SelectItem>
                            <SelectItem value="subdistrict2">แขวง/ตำบล 2</SelectItem>
                            {/* Add more subdistricts based on selected district */}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="deliveryInfo.postalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>รหัสไปรษณีย์</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* 5.3 Delivery Options */}
            <div>
              <h4 className="font-semibold mb-4">5.3 ตัวเลือกการจัดส่ง</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="deliveryInfo.deliveryMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>วิธีการจัดส่ง</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="เลือกวิธีการจัดส่ง" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ems">EMS</SelectItem>
                          <SelectItem value="kerry">Kerry</SelectItem>
                          <SelectItem value="flash">Flash</SelectItem>
                          <SelectItem value="private_transport">ขนส่งเอกชน</SelectItem>
                          <SelectItem value="pickup">นัดรับ</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="deliveryInfo.preferredDeliveryDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>วันที่/เวลาที่ต้องการให้จัดส่ง</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>{watchedDeliveryDate ? format(watchedDeliveryDate, "PPP") : "เลือกวันที่"}</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value || watchedDeliveryDate}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date(new Date().setHours(0, 0, 0, 0))
                            }
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* 5.4 Payment Information */}
            <div>
              <h4 className="font-semibold mb-4">5.4 ข้อมูลการชำระเงิน</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="deliveryInfo.paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>เลือกวิธีชำระเงิน</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="เลือกวิธีชำระเงิน" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="source">ต้นทาง</SelectItem>
                          <SelectItem value="destination">ปลายทาง</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="deliveryInfo.shippingPaymentProof"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>แนบหลักฐานการชำระเงินค่าขนส่ง</FormLabel>
                      <FormControl>
                        <div className="border-2 border-dashed border-border rounded-lg p-4">
                          <Button type="button" variant="outline" className="w-full">
                            <Upload className="w-4 h-4 mr-2" />
                            อัพโหลดหลักฐานการชำระ
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

                {/* 5.5 Additional Instructions */}
                <div>
                  <h4 className="font-semibold mb-4">5.5 คำแนะนำเพิ่มเติมในการจัดส่ง</h4>
                  <FormField
                    control={form.control}
                    name="deliveryInfo.deliveryInstructions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>คำแนะนำเพิ่มเติม</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="เช่น ฝากไว้กับ รปภ., โทรหาก่อนส่ง" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            ปุ่มยกเลิก
          </Button>
          
          <Button type="submit" variant="secondary">
            ปุ่มบันทึก
          </Button>

          {/* Conditional buttons based on product type */}
          {(watchedProductType === "Medal" || watchedProductType === "Award" || 
            ["Keychain", "Doll", "Lanyard", "Box packaging", "Bag", "Bottle", "อื่นๆ"].includes(watchedProductType)) && (
            <Button type="button" onClick={handleEstimatePrice}>
              ปุ่มประเมินราคา
            </Button>
          )}

          {(watchedProductType === "Trophy" || watchedProductType === "Shirt" || watchedProductType === "Bib") && (
            <Button type="button" onClick={handleOrderProduction}>
              ปุ่มสั่งผลิต
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}