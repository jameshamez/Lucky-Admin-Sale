import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Upload } from "lucide-react";

interface JobUpdateFormProps {
  jobId: string;
  quotationNo?: string;
  clientName: string;
  jobType: string;
  onSubmit: (data: any) => void;
}

// ประเภทงานแบบแรก: เหรียญซิงค์อัลลอย, PVC, เหรียญไม้
const isMetalCoinType = (jobType: string) => {
  return ["เหรียญซิงค์อัลลอย", "PVC", "เหรียญไม้"].some(type => 
    jobType.toLowerCase().includes(type.toLowerCase())
  );
};

// ประเภทงานแบบสอง: โล่สั่งผลิต, เหรียญอะคริลิก, เสื้อ, บิบ
const isExternalProductionType = (jobType: string) => {
  return ["โล่สั่งผลิต", "เหรียญอะคริลิก", "เสื้อ", "บิบ"].some(type => 
    jobType.toLowerCase().includes(type.toLowerCase())
  );
};

// ประเภทงานแบบสาม: ป้ายจารึก, สติกเกอร์
const isInternalProductionType = (jobType: string) => {
  return ["ป้ายจารึก", "สติกเกอร์"].some(type => 
    jobType.toLowerCase().includes(type.toLowerCase())
  );
};

interface Revision {
  id: string;
  detail: string;
  reason: string;
  date: string;
}

export function JobUpdateForm({ jobId, quotationNo, clientName, jobType, onSubmit }: JobUpdateFormProps) {
  const [formData, setFormData] = useState({
    quantity: "",
    workStatus: "กำลังดำเนินการ",
    pendingReviewStatus: "",
    completedStatus: "",
    googleDriveLink: "",
    layoutImage: null as File | null,
    artworkImage: null as File | null,
    firstDraftDate: "",
    finalFileName: "",
    completedImage: null as File | null,
  });

  const [revisions, setRevisions] = useState<Revision[]>([]);
  
  // สำหรับฟอร์ม CNC และตรวจสอบชิ้นงาน
  const [cncApproval, setCncApproval] = useState<"approved" | "rejected" | "">("");
  const [cncNotes, setCncNotes] = useState("");
  const [physicalCheckApproval, setPhysicalCheckApproval] = useState<"approved" | "rejected" | "">("");
  const [physicalCheckNotes, setPhysicalCheckNotes] = useState("");
  const [defectReasons, setDefectReasons] = useState({
    wrongColor: false,
    scratches: false,
    wrongSize: false,
    insufficientQuantity: false,
    other: false,
  });
  const [otherDefectReason, setOtherDefectReason] = useState("");

  const addRevision = () => {
    const newRevision: Revision = {
      id: Date.now().toString(),
      detail: "",
      reason: "",
      date: new Date().toISOString().split('T')[0],
    };
    setRevisions([...revisions, newRevision]);
  };

  const removeRevision = (id: string) => {
    setRevisions(revisions.filter(r => r.id !== id));
  };

  const updateRevision = (id: string, field: keyof Omit<Revision, 'id'>, value: string) => {
    setRevisions(revisions.map(r => 
      r.id === id ? { ...r, [field]: value } : r
    ));
  };

  const handleFileChange = (field: string, file: File | null) => {
    setFormData(prev => ({ ...prev, [field]: file }));
  };

  const handleSubmit = () => {
    const submitData = {
      ...formData,
      revisions,
      cncApproval,
      cncNotes,
      physicalCheckApproval,
      physicalCheckNotes,
      defectReasons: physicalCheckApproval === "rejected" ? {
        ...defectReasons,
        otherReason: defectReasons.other ? otherDefectReason : ""
      } : null,
    };
    onSubmit(submitData);
  };

  const showMetalCoinForm = isMetalCoinType(jobType);
  const showExternalForm = isExternalProductionType(jobType);
  const showInternalForm = isInternalProductionType(jobType);

  return (
    <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
      {/* ข้อมูลพื้นฐาน */}
      <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
        <div>
          <Label className="text-xs text-muted-foreground">Job ID</Label>
          <p className="font-semibold">{jobId}</p>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">เลขใบเสนอราคา</Label>
          <p className="font-semibold">{quotationNo || "-"}</p>
        </div>
        <div className="col-span-2">
          <Label className="text-xs text-muted-foreground">ชื่อลูกค้า</Label>
          <p className="font-semibold">{clientName}</p>
        </div>
      </div>

      {/* จำนวนชิ้นงาน */}
      <div>
        <Label htmlFor="quantity">จำนวนชิ้นงาน</Label>
        <Input
          id="quantity"
          type="number"
          placeholder="กรอกจำนวนชิ้นงาน"
          value={formData.quantity}
          onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
        />
      </div>

      {/* สถานะงาน */}
      <div className="space-y-3">
        <Label>สถานะงาน</Label>
        <RadioGroup value={formData.workStatus} onValueChange={(value) => setFormData(prev => ({ ...prev, workStatus: value }))}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="กำลังดำเนินการ" id="status-progress" />
            <Label htmlFor="status-progress" className="font-normal cursor-pointer">งานที่กำลังดำเนินการ</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="รอตรวจสอบ" id="status-review" />
            <Label htmlFor="status-review" className="font-normal cursor-pointer">งานที่รอตรวจสอบ</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="เสร็จสิ้น" id="status-completed" />
            <Label htmlFor="status-completed" className="font-normal cursor-pointer">งานที่เสร็จสิ้น</Label>
          </div>
        </RadioGroup>
      </div>

      {/* ลิงค์ Google Drive */}
      <div>
        <Label htmlFor="driveLink">ลิงค์ Google Drive</Label>
        <Input
          id="driveLink"
          type="url"
          placeholder="https://drive.google.com/..."
          value={formData.googleDriveLink}
          onChange={(e) => setFormData(prev => ({ ...prev, googleDriveLink: e.target.value }))}
        />
      </div>

      {/* แนบภาพการวางแบบ */}
      <div>
        <Label htmlFor="layoutImage">แนบภาพการวางแบบ</Label>
        <div className="mt-2">
          <label htmlFor="layoutImage" className="flex items-center gap-2 cursor-pointer">
            <Button type="button" variant="outline" size="sm" asChild>
              <span>
                <Upload className="h-4 w-4 mr-2" />
                เลือกไฟล์
              </span>
            </Button>
            <span className="text-sm text-muted-foreground">
              {formData.layoutImage ? formData.layoutImage.name : "ยังไม่ได้เลือกไฟล์"}
            </span>
          </label>
          <input
            id="layoutImage"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileChange('layoutImage', e.target.files?.[0] || null)}
          />
        </div>
      </div>

      {/* แนบภาพ Artwork */}
      <div>
        <Label htmlFor="artworkImage">แนบภาพ Artwork</Label>
        <div className="mt-2">
          <label htmlFor="artworkImage" className="flex items-center gap-2 cursor-pointer">
            <Button type="button" variant="outline" size="sm" asChild>
              <span>
                <Upload className="h-4 w-4 mr-2" />
                เลือกไฟล์
              </span>
            </Button>
            <span className="text-sm text-muted-foreground">
              {formData.artworkImage ? formData.artworkImage.name : "ยังไม่ได้เลือกไฟล์"}
            </span>
          </label>
          <input
            id="artworkImage"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileChange('artworkImage', e.target.files?.[0] || null)}
          />
        </div>
      </div>

      {/* วันที่ส่งดราฟแรก */}
      <div>
        <Label htmlFor="firstDraftDate">วันที่ส่งดราฟแรก</Label>
        <Input
          id="firstDraftDate"
          type="date"
          value={formData.firstDraftDate}
          onChange={(e) => setFormData(prev => ({ ...prev, firstDraftDate: e.target.value }))}
        />
      </div>

      {/* การแก้ไขงาน */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>การแก้ไขงาน</Label>
          <Button type="button" size="sm" variant="outline" onClick={addRevision}>
            <Plus className="h-4 w-4 mr-1" />
            เพิ่มการแก้ไข
          </Button>
        </div>
        
        {revisions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4 bg-muted/30 rounded-lg">
            ยังไม่มีการแก้ไขงาน
          </p>
        ) : (
          <div className="space-y-4">
            {revisions.map((revision, index) => (
              <div key={revision.id} className="p-4 border rounded-lg space-y-3 relative">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-semibold">การแก้ไขครั้งที่ {index + 1}</Label>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => removeRevision(revision.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                
                <div>
                  <Label htmlFor={`revision-detail-${revision.id}`} className="text-xs">รายละเอียดการแก้ไข</Label>
                  <Textarea
                    id={`revision-detail-${revision.id}`}
                    placeholder="ระบุรายละเอียดการแก้ไข"
                    value={revision.detail}
                    onChange={(e) => updateRevision(revision.id, 'detail', e.target.value)}
                    rows={2}
                  />
                </div>
                
                <div>
                  <Label htmlFor={`revision-reason-${revision.id}`} className="text-xs">สาเหตุที่สั่งแก้</Label>
                  <Textarea
                    id={`revision-reason-${revision.id}`}
                    placeholder="ระบุสาเหตุ"
                    value={revision.reason}
                    onChange={(e) => updateRevision(revision.id, 'reason', e.target.value)}
                    rows={2}
                  />
                </div>
                
                <div>
                  <Label htmlFor={`revision-date-${revision.id}`} className="text-xs">วันที่สั่งแก้</Label>
                  <Input
                    id={`revision-date-${revision.id}`}
                    type="date"
                    value={revision.date}
                    onChange={(e) => updateRevision(revision.id, 'date', e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ชื่อไฟล์ Final */}
      <div>
        <Label htmlFor="finalFileName">ชื่อไฟล์ Final</Label>
        <Input
          id="finalFileName"
          placeholder="ระบุชื่อไฟล์ Final"
          value={formData.finalFileName}
          onChange={(e) => setFormData(prev => ({ ...prev, finalFileName: e.target.value }))}
        />
      </div>

      {/* ส่วนตรวจสอบ CNC (สำหรับงานเหรียญซิงค์อัลลอย) */}
      {showMetalCoinForm && (
        <div className="space-y-4 p-4 border-2 border-primary/20 rounded-lg bg-primary/5">
          <h3 className="font-semibold text-lg">ตรวจสอบ CNC</h3>
          
          <RadioGroup value={cncApproval} onValueChange={(value: any) => setCncApproval(value)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="approved" id="cnc-approved" />
              <Label htmlFor="cnc-approved" className="font-normal cursor-pointer">อนุมัติ</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="rejected" id="cnc-rejected" />
              <Label htmlFor="cnc-rejected" className="font-normal cursor-pointer">ไม่อนุมัติ</Label>
            </div>
          </RadioGroup>

          {cncApproval === "rejected" && (
            <div>
              <Label htmlFor="cncNotes">หมายเหตุ</Label>
              <Textarea
                id="cncNotes"
                placeholder="ระบุหมายเหตุ..."
                value={cncNotes}
                onChange={(e) => setCncNotes(e.target.value)}
                rows={3}
              />
            </div>
          )}

          <div className="pt-4 border-t">
            <h4 className="font-semibold mb-3">สุ่มตรวจสอบชิ้นงานจริง</h4>
            <Label className="text-sm font-medium mb-2 block">งานจริงตรงตาม Proof - สี</Label>
            
            <RadioGroup value={physicalCheckApproval} onValueChange={(value: any) => setPhysicalCheckApproval(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="approved" id="physical-approved" />
                <Label htmlFor="physical-approved" className="font-normal cursor-pointer">อนุมัติ</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="rejected" id="physical-rejected" />
                <Label htmlFor="physical-rejected" className="font-normal cursor-pointer">ไม่อนุมัติ</Label>
              </div>
            </RadioGroup>

            {physicalCheckApproval === "rejected" && (
              <div className="mt-4 space-y-3">
                <Label className="text-sm font-medium">ใส่หมายเหตุ</Label>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="wrongColor"
                      checked={defectReasons.wrongColor}
                      onCheckedChange={(checked) => 
                        setDefectReasons(prev => ({ ...prev, wrongColor: checked as boolean }))
                      }
                    />
                    <Label htmlFor="wrongColor" className="font-normal cursor-pointer">สีไม่ตรง</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="scratches"
                      checked={defectReasons.scratches}
                      onCheckedChange={(checked) => 
                        setDefectReasons(prev => ({ ...prev, scratches: checked as boolean }))
                      }
                    />
                    <Label htmlFor="scratches" className="font-normal cursor-pointer">รอย</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="wrongSize"
                      checked={defectReasons.wrongSize}
                      onCheckedChange={(checked) => 
                        setDefectReasons(prev => ({ ...prev, wrongSize: checked as boolean }))
                      }
                    />
                    <Label htmlFor="wrongSize" className="font-normal cursor-pointer">ขนาดผิด</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="insufficientQuantity"
                      checked={defectReasons.insufficientQuantity}
                      onCheckedChange={(checked) => 
                        setDefectReasons(prev => ({ ...prev, insufficientQuantity: checked as boolean }))
                      }
                    />
                    <Label htmlFor="insufficientQuantity" className="font-normal cursor-pointer">จำนวนไม่ครบ</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="other"
                      checked={defectReasons.other}
                      onCheckedChange={(checked) => 
                        setDefectReasons(prev => ({ ...prev, other: checked as boolean }))
                      }
                    />
                    <Label htmlFor="other" className="font-normal cursor-pointer">อื่นๆ (โปรดระบุ)</Label>
                  </div>
                  
                  {defectReasons.other && (
                    <Textarea
                      placeholder="ระบุรายละเอียด..."
                      value={otherDefectReason}
                      onChange={(e) => setOtherDefectReason(e.target.value)}
                      rows={2}
                      className="mt-2"
                    />
                  )}
                </div>

                <div className="mt-3">
                  <Label htmlFor="physicalCheckNotes">หมายเหตุเพิ่มเติม</Label>
                  <Textarea
                    id="physicalCheckNotes"
                    placeholder="ระบุหมายเหตุเพิ่มเติม..."
                    value={physicalCheckNotes}
                    onChange={(e) => setPhysicalCheckNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ส่วนตรวจสอบชิ้นงานจริงทั้งหมด (สำหรับงานประเภทอื่น) */}
      {(showExternalForm || showInternalForm) && (
        <div className="space-y-4 p-4 border-2 border-primary/20 rounded-lg bg-primary/5">
          <h3 className="font-semibold text-lg">ตรวจสอบชิ้นงานจริงทั้งหมด</h3>
          <Label className="text-sm font-medium">งานจริงตรงตาม Proof - จำนวน/สี</Label>
          
          <RadioGroup value={physicalCheckApproval} onValueChange={(value: any) => setPhysicalCheckApproval(value)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="approved" id="check-approved" />
              <Label htmlFor="check-approved" className="font-normal cursor-pointer">อนุมัติ</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="rejected" id="check-rejected" />
              <Label htmlFor="check-rejected" className="font-normal cursor-pointer">ไม่อนุมัติ</Label>
            </div>
          </RadioGroup>

          {physicalCheckApproval === "rejected" && (
            <div className="mt-4 space-y-3">
              <Label className="text-sm font-medium">ใส่หมายเหตุ</Label>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="wrongColor2"
                    checked={defectReasons.wrongColor}
                    onCheckedChange={(checked) => 
                      setDefectReasons(prev => ({ ...prev, wrongColor: checked as boolean }))
                    }
                  />
                  <Label htmlFor="wrongColor2" className="font-normal cursor-pointer">สีไม่ตรง</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="scratches2"
                    checked={defectReasons.scratches}
                    onCheckedChange={(checked) => 
                      setDefectReasons(prev => ({ ...prev, scratches: checked as boolean }))
                    }
                  />
                  <Label htmlFor="scratches2" className="font-normal cursor-pointer">รอย</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="wrongSize2"
                    checked={defectReasons.wrongSize}
                    onCheckedChange={(checked) => 
                      setDefectReasons(prev => ({ ...prev, wrongSize: checked as boolean }))
                    }
                  />
                  <Label htmlFor="wrongSize2" className="font-normal cursor-pointer">ขนาดผิด</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="insufficientQuantity2"
                    checked={defectReasons.insufficientQuantity}
                    onCheckedChange={(checked) => 
                      setDefectReasons(prev => ({ ...prev, insufficientQuantity: checked as boolean }))
                    }
                  />
                  <Label htmlFor="insufficientQuantity2" className="font-normal cursor-pointer">จำนวนไม่ครบ</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="other2"
                    checked={defectReasons.other}
                    onCheckedChange={(checked) => 
                      setDefectReasons(prev => ({ ...prev, other: checked as boolean }))
                    }
                  />
                  <Label htmlFor="other2" className="font-normal cursor-pointer">อื่นๆ (โปรดระบุ)</Label>
                </div>
                
                {defectReasons.other && (
                  <Textarea
                    placeholder="ระบุรายละเอียด..."
                    value={otherDefectReason}
                    onChange={(e) => setOtherDefectReason(e.target.value)}
                    rows={2}
                    className="mt-2"
                  />
                )}
              </div>

              <div className="mt-3">
                <Label htmlFor="checkNotes">หมายเหตุเพิ่มเติม</Label>
                <Textarea
                  id="checkNotes"
                  placeholder="ระบุหมายเหตุเพิ่มเติม..."
                  value={physicalCheckNotes}
                  onChange={(e) => setPhysicalCheckNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* แนบภาพงานเสร็จสมบูรณ์ */}
      <div>
        <Label htmlFor="completedImage">
          {showMetalCoinForm ? "แนบภาพงานหลังตรวจเสร็จสมบูรณ์" : "แนบภาพงานเสร็จสมบูรณ์"}
        </Label>
        <div className="mt-2">
          <label htmlFor="completedImage" className="flex items-center gap-2 cursor-pointer">
            <Button type="button" variant="outline" size="sm" asChild>
              <span>
                <Upload className="h-4 w-4 mr-2" />
                เลือกไฟล์
              </span>
            </Button>
            <span className="text-sm text-muted-foreground">
              {formData.completedImage ? formData.completedImage.name : "ยังไม่ได้เลือกไฟล์"}
            </span>
          </label>
          <input
            id="completedImage"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileChange('completedImage', e.target.files?.[0] || null)}
          />
        </div>
      </div>

      {/* ปุ่มบันทึก */}
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button type="button" onClick={handleSubmit}>
          บันทึกข้อมูล
        </Button>
      </div>
    </div>
  );
}
