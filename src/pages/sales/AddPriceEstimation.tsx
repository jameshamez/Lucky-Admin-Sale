import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AddPriceEstimation() {
  const navigate = useNavigate();
  const [selectedProductType, setSelectedProductType] = useState("");
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [frontDetails, setFrontDetails] = useState<string[]>([]);
  const [backDetails, setBackDetails] = useState<string[]>([]);

  const productTypes = [
    { value: "medal", label: "Medal (เหรียญรางวัล)" },
    { value: "trophy", label: "Trophy (ถ้วยรางวัล)" },
    { value: "award", label: "Award (โล่)" },
    { value: "shirt", label: "Shirt (เสื้อ)" },
    { value: "bib", label: "Bib (ป้ายบิบ)" },
    { value: "keychain", label: "Keychain (พวงกุญแจ)" },
    { value: "doll", label: "Doll (ตุ๊กตา)" },
    { value: "lanyard", label: "Lanyard (สายคล้อง)" },
    { value: "box", label: "Box packaging (บรรจุภัณฑ์)" },
    { value: "bag", label: "Bag (กระเป๋า)" },
    { value: "bottle", label: "Bottle (ขวดน้ำ)" },
    { value: "other", label: "อื่นๆ" }
  ];

  const materialsByType = {
    medal: [
      { value: "zinc-alloy", label: "ซิงค์อัลลอย" },
      { value: "acrylic", label: "อะคริลิค" },
      { value: "crystal", label: "คริสตัล" },
      { value: "pvc", label: "PVC" },
      { value: "wood", label: "ไม้" },
      { value: "other", label: "อื่นๆ (โปรดระบุ)" }
    ],
    award: [
      { value: "acrylic", label: "อะคริลิค" },
      { value: "crystal", label: "คริสตัล" },
      { value: "zinc-alloy", label: "ซิงค์อัลลอย" },
      { value: "other", label: "อื่นๆ (โปรดระบุ)" }
    ],
    trophy: [
      { value: "pewter", label: "ถ้วยดีบุก" },
      { value: "benjarong", label: "ถ้วยเบญจรงค์" },
      { value: "resin", label: "เรซิน" },
      { value: "aluminum", label: "อลูมิเนียม" },
      { value: "lead", label: "ตะกั่ว" },
      { value: "other", label: "อื่นๆ (โปรดระบุ)" }
    ],
    lanyard: [
      { value: "polyscreen", label: "โพลีสกรีน" }
    ],
    other: [
      { value: "rubber", label: "ยาง (ริสแบรน)" },
      { value: "paper", label: "กระดาษ (ริสแบรน)" },
      { value: "microfiber", label: "ผ้าไมโครเรียบ" },
      { value: "star-fabric", label: "ผ้าดาวกระจาย" },
      { value: "rice-fabric", label: "ผ้าเม็ดข้าวสาร" },
      { value: "foam", label: "โฟม" },
      { value: "other", label: "อื่นๆ (โปรดระบุ)" }
    ]
  };

  const colors = [
    { value: "shinny-gold", label: "shinny gold (สีทองเงา)" },
    { value: "shinny-silver", label: "shinny silver (สีเงินเงา)" },
    { value: "shinny-copper", label: "shinny copper (สีทองแดงเงา)" },
    { value: "antique-gold", label: "antique gold (สีทองรมดำ)" },
    { value: "antique-silver", label: "antique silver (สีเงินรมดำ)" },
    { value: "antique-copper", label: "antique copper (สีทองแดงรมดำ)" },
    { value: "misty-gold", label: "misty gold (สีทองด้าน)" },
    { value: "misty-silver", label: "misty silver (สีเงินด้าน)" },
    { value: "misty-copper", label: "misty copper (สีทองแดงด้าน)" }
  ];

  const lanyardSizes = [
    { value: "1.5x90", label: "1.5 × 90 ซม" },
    { value: "2x90", label: "2 × 90 ซม" },
    { value: "2.5x90", label: "2.5 × 90 ซม" },
    { value: "3x90", label: "3 × 90 ซม" },
    { value: "3.5x90", label: "3.5 × 90 ซม" },
    { value: "no-lanyard", label: "ไม่รับสาย" }
  ];

  const detailOptions = [
    "พิมพ์โลโก้",
    "แกะสลักข้อความ",
    "ลงสีสเปรย์",
    "ขัดเงา",
    "ลงน้ำยาป้องกันสนิม",
    "แกะลึก",
    "พิมพ์ซิลค์สกรีน",
    "ปั๊มลาย"
  ];

  const toggleColor = (color: string) => {
    setSelectedColors(prev => 
      prev.includes(color) 
        ? prev.filter(c => c !== color)
        : [...prev, color]
    );
  };

  const toggleDetail = (detail: string, type: 'front' | 'back') => {
    if (type === 'front') {
      setFrontDetails(prev => 
        prev.includes(detail) 
          ? prev.filter(d => d !== detail)
          : [...prev, detail]
      );
    } else {
      setBackDetails(prev => 
        prev.includes(detail) 
          ? prev.filter(d => d !== detail)
          : [...prev, detail]
      );
    }
  };

  const getCurrentMaterials = () => {
    return materialsByType[selectedProductType as keyof typeof materialsByType] || [];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate("/sales/price-estimation")}>
          <ArrowLeft className="h-4 w-4" />
          ย้อนกลับ
        </Button>
        <div>
          <h1 className="text-3xl font-bold">เพิ่มประเมินราคา</h1>
          <p className="text-muted-foreground">กรอกข้อมูลสำหรับการประเมินราคาสินค้า</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ข้อมูลการประเมินราคา</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="estimation-date">วันที่ประเมินราคา</Label>
              <Input type="date" id="estimation-date" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="responsible-person">เซลล์ผู้รับผิดชอบงาน</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกเซลล์ผู้รับผิดชอบ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales1">พนักงานขาย 1</SelectItem>
                  <SelectItem value="sales2">พนักงานขาย 2</SelectItem>
                  <SelectItem value="sales3">พนักงานขาย 3</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer-name">ชื่อลูกค้า</Label>
              <Input id="customer-name" placeholder="กรอกชื่อลูกค้า" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="line-name">ชื่อ LINE</Label>
              <Input id="line-name" placeholder="กรอกชื่อ LINE" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="job-name">ชื่องาน</Label>
              <Input id="job-name" placeholder="กรอกชื่องาน" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="product-type">ประเภทสินค้า</Label>
              <Select value={selectedProductType} onValueChange={setSelectedProductType}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกประเภทสินค้า" />
                </SelectTrigger>
                <SelectContent>
                  {productTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedProductType && (
            <div className="space-y-2">
              <Label htmlFor="material">วัสดุ</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกวัสดุ" />
                </SelectTrigger>
                <SelectContent>
                  {getCurrentMaterials().map((material) => (
                    <SelectItem key={material.value} value={material.value}>
                      {material.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="usage-date">วันที่ใช้งาน</Label>
            <Input type="date" id="usage-date" />
          </div>

          <div className="space-y-4">
            <Label>ขนาด</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="width">กว้าง (ซม.)</Label>
                <Input id="width" type="number" placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="length">ยาว (ซม.)</Label>
                <Input id="length" type="number" placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">สูง (ซม.)</Label>
                <Input id="height" type="number" placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="thickness">หนา (มม.)</Label>
                <Input id="thickness" type="number" placeholder="0" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">รูป</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">อัปโหลดรูปภาพ</p>
              <Input type="file" className="hidden" id="image" accept="image/*" />
              <Button variant="outline" className="mt-2" onClick={() => document.getElementById('image')?.click()}>
                เลือกไฟล์
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">จำนวน</Label>
            <Input id="quantity" type="number" placeholder="กรอกจำนวน" />
          </div>

          {/* Medal Details */}
          {selectedProductType === 'medal' && (
            <div className="space-y-6 border-t pt-6">
              <h3 className="text-lg font-semibold">รายละเอียดการสั่งเหรียญ</h3>
              
              <div className="space-y-4">
                <Label>สี (เลือกได้หลายรายการ)</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {colors.map((color) => (
                    <div key={color.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={color.value}
                        checked={selectedColors.includes(color.value)}
                        onCheckedChange={() => toggleColor(color.value)}
                      />
                      <Label htmlFor={color.value} className="text-sm">
                        {color.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Label>รายละเอียดสินค้า</Label>
                
                <div className="space-y-2">
                  <Label>รายละเอียดด้านหน้า (เลือกได้หลายรายการ)</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {detailOptions.map((detail) => (
                      <div key={`front-${detail}`} className="flex items-center space-x-2">
                        <Checkbox
                          id={`front-${detail}`}
                          checked={frontDetails.includes(detail)}
                          onCheckedChange={() => toggleDetail(detail, 'front')}
                        />
                        <Label htmlFor={`front-${detail}`} className="text-sm">
                          {detail}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>รายละเอียดด้านหลัง (เลือกได้หลายรายการ)</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {detailOptions.map((detail) => (
                      <div key={`back-${detail}`} className="flex items-center space-x-2">
                        <Checkbox
                          id={`back-${detail}`}
                          checked={backDetails.includes(detail)}
                          onCheckedChange={() => toggleDetail(detail, 'back')}
                        />
                        <Label htmlFor={`back-${detail}`} className="text-sm">
                          {detail}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lanyard-size">ขนาดสายคล้อง</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกขนาดสายคล้อง" />
                  </SelectTrigger>
                  <SelectContent>
                    {lanyardSizes.map((size) => (
                      <SelectItem key={size.value} value={size.value}>
                        {size.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lanyard-patterns">จำนวนแบบสายคล้อง</Label>
                <Input id="lanyard-patterns" type="number" placeholder="กรอกจำนวนแบบ" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="additional-mold">ค่าโมล เพิ่มเติม</Label>
                <Input id="additional-mold" type="number" placeholder="กรอกค่าโมล" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="medal-notes">หมายเหตุ (โปรดระบุ)</Label>
                <Textarea id="medal-notes" placeholder="กรอกหมายเหตุเพิ่มเติม" />
              </div>
            </div>
          )}

          {/* Award Details */}
          {selectedProductType === 'award' && (
            <div className="space-y-6 border-t pt-6">
              <h3 className="text-lg font-semibold">รายละเอียดสั่งงานโล่</h3>
              
              <div className="space-y-2">
                <Label htmlFor="award-model">รุ่นโมเดล</Label>
                <Input id="award-model" placeholder="กรอกรุ่นโมเดล" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="award-notes">หมายเหตุ (โปรดระบุ)</Label>
                <Textarea id="award-notes" placeholder="กรอกหมายเหตุเพิ่มเติม" />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="budget">งบประมาณ (ถ้าลูกค้ามีงบที่ต้องการ)</Label>
            <Input id="budget" type="number" placeholder="กรอกงบประมาณ (บาท)" />
          </div>

          <div className="flex gap-4 pt-6">
            <Button type="submit" size="lg">
              บันทึกการประเมินราคา
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate("/sales/price-estimation")}>
              ยกเลิก
            </Button>
            <Button variant="secondary" size="lg">
              ดูประวัติการสั่งซื้อ
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}