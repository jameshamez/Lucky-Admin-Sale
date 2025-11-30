import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Upload, Users, Shuffle, FileText } from "lucide-react";

interface JobDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId?: string;
  jobData?: any;
  mode?: "assign" | "action" | "view";
  onAssign?: (employeeId: string) => void;
  onStart?: () => void;
  onReject?: (reason: string) => void;
}

const productTypes = [
  "ป้ายจารึก",
  "เหรียญสำเร็จรูป",
  "เหรียญสั่งผลิต",
  "โล่/ถ้วย/คริสตัล",
  "เสื้อ",
  "บิบ",
  "สายคล้อง",
  "อื่นๆ",
];

const mockEmployees = [
  { id: "1", name: "สมชาย ใจดี" },
  { id: "2", name: "สมหญิง รักงาน" },
  { id: "3", name: "วิชัย มีฝีมือ" },
  { id: "4", name: "สุดา ออกแบบดี" },
];

export function JobDetailDrawer({ 
  open, 
  onOpenChange, 
  jobId, 
  jobData, 
  mode = "view",
  onAssign,
  onStart,
  onReject 
}: JobDetailDrawerProps) {
  const [productType, setProductType] = useState("ป้ายจารึก");
  const [showEmployeeDialog, setShowEmployeeDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [rejectReason, setRejectReason] = useState("");

  // ข้อมูลจริงจาก jobData หรือ Mockup เพื่อแสดงผลใน Section A
  const data = {
    customerName: jobData?.client_name ?? "บริษัท ABC จำกัด",
    jobType: jobData?.job_type ?? "ออกแบบโลโก้",
    urgencyLabel: jobData?.urgency ?? "เร่งด่วน 3-5 ชั่วโมง",
    orderDate: jobData?.order_date ? new Date(jobData.order_date) : new Date("2024-11-28"),
    dueDate: jobData?.due_date ? new Date(jobData.due_date) : new Date("2024-12-01"),
    requester: jobData?.ordered_by ?? "พนักงานขาย สมชาย",
    quotation: jobData?.quotation_no ?? "QT-2024-001",
    detail:
      jobData?.description ??
      "ออกแบบโลโก้สำหรับบริษัท ต้องการดูมีความทันสมัย เน้นสีน้ำเงิน-ขาว",
  };

  const toThaiDate = (d: Date) => {
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear() + 543; // พ.ศ.
    return `${dd}/${mm}/${yyyy}`;
  };

  const today = new Date();
  const diffDays = Math.ceil((data.dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  const handleRandomEmployee = () => {
    const randomIndex = Math.floor(Math.random() * mockEmployees.length);
    setSelectedEmployee(mockEmployees[randomIndex].name);
  };

  const renderSectionB = () => {
    const currentJobType = jobData?.job_type || "ป้ายจารึก";
    
    switch (currentJobType) {
      case "ป้ายจารึก":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>จำนวนป้าย</Label>
              <Input type="number" value={jobData?.quantity || "0"} readOnly className="bg-muted" />
            </div>
            <div>
              <Label>ชนิดฐาน</Label>
              <Input value={jobData?.base_type || "-"} readOnly className="bg-muted" />
            </div>
            <div>
              <Label>ขนาดฐาน</Label>
              <Input value={jobData?.base_size || "-"} readOnly className="bg-muted" />
            </div>
          </div>
        );

      case "เหรียญสำเร็จรูป":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>จำนวน</Label>
              <Input type="number" value={jobData?.quantity || "100"} readOnly className="bg-muted" />
            </div>
            <div>
              <Label>ประเภทเหรียญสำเร็จรูป</Label>
              <Input value={jobData?.medal_model || "เหรียญทอง ขนาด 2 นิ้ว รุ่น A-123"} readOnly className="bg-muted" />
            </div>
            <div>
              <Label>ขนาด</Label>
              <Input value={jobData?.size || "2 นิ้ว (5 ซม.)"} readOnly className="bg-muted" />
            </div>
          </div>
        );

      case "เหรียญสั่งผลิต":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>จำนวน</Label>
              <Input type="number" value={jobData?.quantity || "0"} readOnly className="bg-muted" />
            </div>
            <div>
              <Label>วัสดุ</Label>
              <Input value={jobData?.material || "-"} readOnly className="bg-muted" />
            </div>
            <div>
              <Label>ขนาด</Label>
              <Input value={jobData?.size || "-"} readOnly className="bg-muted" />
            </div>
            <div>
              <Label>สี</Label>
              <Input value={jobData?.color || "-"} readOnly className="bg-muted" />
            </div>
          </div>
        );

      case "โล่/ถ้วย/คริสตัล":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>จำนวน</Label>
              <Input type="number" value={jobData?.quantity || "0"} readOnly className="bg-muted" />
            </div>
            <div>
              <Label>รุ่น</Label>
              <Input value={jobData?.model || "-"} readOnly className="bg-muted" />
            </div>
            <div>
              <Label>ขนาด</Label>
              <Input value={jobData?.size || "-"} readOnly className="bg-muted" />
            </div>
          </div>
        );

      case "เสื้อ":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>จำนวน</Label>
              <Input type="number" value={jobData?.quantity || "0"} readOnly className="bg-muted" />
            </div>
            <div>
              <Label>ประเภทเสื้อ</Label>
              <Input value={jobData?.shirt_type || "-"} readOnly className="bg-muted" />
            </div>
            <div>
              <Label>ไซส์</Label>
              <Input value={jobData?.sizes || "-"} readOnly className="bg-muted" />
            </div>
            <div>
              <Label>สี</Label>
              <Input value={jobData?.color || "-"} readOnly className="bg-muted" />
            </div>
          </div>
        );

      case "บิบ":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>จำนวน</Label>
              <Input type="number" value={jobData?.quantity || "0"} readOnly className="bg-muted" />
            </div>
            <div>
              <Label>วัสดุ</Label>
              <Input value={jobData?.material || "-"} readOnly className="bg-muted" />
            </div>
            <div>
              <Label>ขนาด</Label>
              <Input value={jobData?.size || "-"} readOnly className="bg-muted" />
            </div>
          </div>
        );

      case "สายคล้อง":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>จำนวน</Label>
              <Input type="number" value={jobData?.quantity || "0"} readOnly className="bg-muted" />
            </div>
            <div>
              <Label>ความกว้าง</Label>
              <Input value={jobData?.width || "-"} readOnly className="bg-muted" />
            </div>
            <div>
              <Label>วัสดุ</Label>
              <Input value={jobData?.material || "-"} readOnly className="bg-muted" />
            </div>
            <div>
              <Label>สี</Label>
              <Input value={jobData?.color || "-"} readOnly className="bg-muted" />
            </div>
          </div>
        );

      case "อื่นๆ":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>จำนวน</Label>
              <Input type="number" placeholder="0" />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderSectionC = () => {
    const currentJobType = jobData?.job_type || "ป้ายจารึก";
    
    switch (currentJobType) {
      case "ป้ายจารึก":
        return (
          <div className="space-y-4">
            <div>
              <Label>รายละเอียดการออกแบบ/ข้อความบนป้าย</Label>
              <Textarea 
                placeholder="ระบุรายละเอียดการออกแบบ..."
                className="min-h-[100px]"
              />
            </div>
          </div>
        );

      case "เหรียญสำเร็จรูป":
        return (
          <div className="space-y-4">
            <div>
              <Label>ข้อมูลสติกเกอร์ติดเหรียญ</Label>
              <Textarea 
                value={jobData?.sticker_info || "ข้อความ: รางวัลชนะเลิศ\nชื่อผู้รับรางวัล: คุณสมชาย ใจดี\nปี: 2567"}
                readOnly
                className="min-h-[100px] bg-muted"
              />
            </div>
          </div>
        );

      case "เหรียญสั่งผลิต":
        return (
          <div className="space-y-4">
            <div>
              <Label>รายละเอียดด้านหน้า</Label>
              <Textarea 
                placeholder="ระบุรายละเอียดด้านหน้า..."
                className="min-h-[80px]"
              />
            </div>
            <div>
              <Label>รายละเอียดด้านหลัง</Label>
              <Textarea 
                placeholder="ระบุรายละเอียดด้านหลัง..."
                className="min-h-[80px]"
              />
            </div>
            <div>
              <Label>หมายเหตุ</Label>
              <Textarea 
                placeholder="ระบุหมายเหตุเพิ่มเติม..."
                className="min-h-[60px]"
              />
            </div>
          </div>
        );

      case "โล่/ถ้วย/คริสตัล":
      case "เสื้อ":
      case "บิบ":
      case "สายคล้อง":
        return (
          <div className="space-y-4">
            <div>
              <Label>รายละเอียดการออกแบบ</Label>
              <Textarea 
                placeholder="ระบุรายละเอียดการออกแบบ..."
                className="min-h-[100px]"
              />
            </div>
            <div>
              <Label>หมายเหตุ</Label>
              <Textarea 
                placeholder="ระบุหมายเหตุเพิ่มเติม..."
                className="min-h-[60px]"
              />
            </div>
          </div>
        );

      case "อื่นๆ":
        return (
          <div className="space-y-4">
            <div>
              <Label>รายละเอียดการออกแบบ</Label>
              <Textarea 
                placeholder="ระบุรายละเอียดการออกแบบ..."
                className="min-h-[100px]"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-3xl p-0">
          <SheetHeader className="p-6 pb-4">
            <SheetTitle className="text-2xl">รายละเอียดงานออกแบบ</SheetTitle>
          </SheetHeader>
          
          <ScrollArea className="h-[calc(100vh-140px)] px-6">
            <div className="space-y-6 pb-6">
              {/* Section A: ข้อมูลงานจากฝ่ายขาย */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      A
                    </div>
                    <h3 className="text-lg font-semibold">ข้อมูลงานจากฝ่ายขาย</h3>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Job ID: <span className="font-mono font-medium">{jobData?.job_id || jobId || "JOB-2024-XXX"}</span>
                  </div>
                </div>
                
                <div className="space-y-4 pl-10">
                  {/* ไฟล์อ้างอิงด้านบน */}
                  {jobData?.reference_files && jobData.reference_files.length > 0 && (
                    <div className="mb-4">
                      <Label className="mb-2 block">ไฟล์อ้างอิง</Label>
                      <div className="flex flex-wrap gap-2">
                        {jobData.reference_files.map((file: string, idx: number) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 px-3 py-2 bg-muted rounded-md text-sm hover:bg-muted/80 cursor-pointer transition-colors"
                          >
                            <FileText className="h-4 w-4 text-primary" />
                            <span>{file}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label>ชื่อลูกค้า</Label>
                      <p className="mt-1 font-medium">{data.customerName}</p>
                    </div>
                    <div>
                      <Label>ความเร่งด่วน</Label>
                      <div className="mt-1">
                        <span className="inline-flex items-center rounded-full bg-destructive text-destructive-foreground px-3 py-1 text-xs font-medium">
                          {data.urgencyLabel}
                        </span>
                      </div>
                    </div>
                    <div>
                      <Label>ประเภทงาน</Label>
                      <p className="mt-1">{data.jobType}</p>
                    </div>
                    <div>
                      <Label>วันที่ต้องส่งงาน</Label>
                      <p className="mt-1">{toThaiDate(data.dueDate)}</p>
                    </div>
                    <div>
                      <Label>วันที่สั่งงาน</Label>
                      <p className="mt-1">{toThaiDate(data.orderDate)}</p>
                    </div>
                    <div>
                      <Label>ผู้สั่งงาน</Label>
                      <p className="mt-1">{data.requester}</p>
                    </div>
                    <div>
                      <Label>วันที่เหลือ</Label>
                      <p className={`mt-1 font-medium ${diffDays < 0 ? "text-destructive" : ""}`}>
                        {diffDays < 0 ? `เกิน ${Math.abs(diffDays)} วัน` : `${diffDays} วัน`}
                      </p>
                    </div>
                    <div>
                      <Label>ใบเสนอราคา</Label>
                      <p className="mt-1">{data.quotation}</p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Section B: รายละเอียดงาน (Dynamic) */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-bold">
                    B
                  </div>
                  <h3 className="text-lg font-semibold">รายละเอียดงาน</h3>
                </div>
                
                <div className="space-y-4 pl-10">
                  {renderSectionB()}
                </div>
              </div>

              <Separator />

              {/* Section C: รายละเอียดการออกแบบ (Dynamic) */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold">
                    C
                  </div>
                  <h3 className="text-lg font-semibold">รายละเอียดการออกแบบ</h3>
                </div>
                
                <div className="space-y-4 pl-10">
                  {renderSectionC()}
                </div>
              </div>

              <Separator />

              {/* Section D: ไฟล์แนบ & ไฟล์อ้างอิง */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-bold">
                    D
                  </div>
                  <h3 className="text-lg font-semibold">ไฟล์แนบ & ไฟล์อ้างอิง</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-10">
                  {/* ไฟล์อ้างอิงจากลูกค้า */}
                  <div className="space-y-2">
                    <Label>ไฟล์อ้างอิงจากลูกค้า</Label>
                    {jobData?.reference_files && jobData.reference_files.length > 0 ? (
                      <div className="space-y-2">
                        {jobData.reference_files.map((file: string, idx: number) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 bg-muted rounded-md hover:bg-muted/80 cursor-pointer transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <FileText className="h-5 w-5 text-primary" />
                              <span className="text-sm font-medium">{file}</span>
                            </div>
                            <Button size="sm" variant="ghost">ดาวน์โหลด</Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="border-2 border-dashed rounded-lg p-6">
                        <p className="text-sm text-muted-foreground text-center">ไม่มีไฟล์อ้างอิง</p>
                      </div>
                    )}
                  </div>

                  {/* รูปภาพอ้างอิงจากลูกค้า */}
                  <div className="space-y-2">
                    <Label>รูปภาพอ้างอิงจากลูกค้า</Label>
                    {jobData?.reference_images && jobData.reference_images.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {jobData.reference_images.map((img: string, idx: number) => (
                          <div
                            key={idx}
                            className="aspect-video bg-muted rounded-md overflow-hidden hover:opacity-80 cursor-pointer transition-opacity"
                          >
                            <img src={img} alt={`รูปอ้างอิง ${idx + 1}`} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="border-2 border-dashed rounded-lg p-6">
                        <p className="text-sm text-muted-foreground text-center">ไม่มีรูปภาพอ้างอิง</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>

          {/* Footer Buttons */}
          {mode !== "view" && (
            <div className="absolute bottom-0 left-0 right-0 p-6 border-t bg-background">
              {mode === "assign" ? (
                <>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button 
                      variant="outline" 
                      onClick={handleRandomEmployee}
                      className="flex-1"
                    >
                      <Shuffle className="mr-2 h-4 w-4" />
                      สุ่มพนักงาน
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowEmployeeDialog(true)}
                      className="flex-1"
                    >
                      <Users className="mr-2 h-4 w-4" />
                      เลือกพนักงาน
                    </Button>
                    <Button 
                      className="flex-1 sm:flex-[1.5]"
                      onClick={() => {
                        if (selectedEmployee && onAssign) {
                          onAssign(selectedEmployee);
                          onOpenChange(false);
                        }
                      }}
                      disabled={!selectedEmployee}
                    >
                      ยืนยันการมอบหมาย
                    </Button>
                  </div>
                  {selectedEmployee && (
                    <div className="mt-3 text-sm text-center text-muted-foreground">
                      พนักงานที่เลือก: <span className="font-medium text-foreground">{selectedEmployee}</span>
                    </div>
                  )}
                </>
              ) : mode === "action" ? (
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowRejectDialog(true)}
                  >
                    ปฏิเสธงาน
                  </Button>
                  <Button 
                    className="flex-1"
                    onClick={() => {
                      if (onStart) {
                        onStart();
                        onOpenChange(false);
                      }
                    }}
                  >
                    เริ่มงาน
                  </Button>
                </div>
              ) : null}
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Employee Selection Dialog */}
      <Dialog open={showEmployeeDialog} onOpenChange={setShowEmployeeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>เลือกพนักงานออกแบบ</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-4">
            {mockEmployees.map((emp) => (
              <button
                key={emp.id}
                onClick={() => {
                  setSelectedEmployee(emp.name);
                  setShowEmployeeDialog(false);
                }}
                className="w-full p-3 text-left border rounded-md hover:bg-accent transition-colors"
              >
                {emp.name}
              </button>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEmployeeDialog(false)}>
              ยกเลิก
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Job Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ปฏิเสธงาน</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reject-reason">เหตุผลในการปฏิเสธงาน</Label>
              <Textarea
                id="reject-reason"
                placeholder="กรุณาระบุเหตุผลในการปฏิเสธงาน..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowRejectDialog(false);
              setRejectReason("");
            }}>
              ยกเลิก
            </Button>
            <Button 
              variant="destructive"
              onClick={() => {
                if (rejectReason.trim() && onReject) {
                  onReject(rejectReason);
                  setShowRejectDialog(false);
                  setRejectReason("");
                  onOpenChange(false);
                }
              }}
              disabled={!rejectReason.trim()}
            >
              ยืนยันการปฏิเสธ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
