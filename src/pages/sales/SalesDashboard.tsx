import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  Package,
  Truck,
  CheckCircle,
  AlertTriangle,
  Users,
  BarChart3,
  Calendar,
  Filter,
  Calculator
} from "lucide-react";

const salesData = {
  monthly: {
    current: 245000,
    target: 300000,
    percentage: 82
  },
  jobStatus: {
    priceEvaluation: 15,
    quotationOpen: 12,
    payment: 8,
    internalProduction: 25,
    graphics: 18,
    externalProduction: 6,
    readyToShip: 34,
    completed: 127
  }
};

// Chart data for different time periods
const dailySalesData = [
  { name: "จ", sales: 12000 },
  { name: "อ", sales: 19000 },
  { name: "พ", sales: 15000 },
  { name: "พฤ", sales: 22000 },
  { name: "ศ", sales: 18000 },
  { name: "ส", sales: 25000 },
  { name: "อา", sales: 21000 },
];

const monthlySalesData = [
  { name: "ม.ค.", sales: 245000 },
  { name: "ก.พ.", sales: 312000 },
  { name: "มี.ค.", sales: 289000 },
  { name: "เม.ย.", sales: 358000 },
  { name: "พ.ค.", sales: 423000 },
  { name: "มิ.ย.", sales: 367000 },
];

const yearlySalesData = [
  { name: "2021", sales: 2450000 },
  { name: "2022", sales: 3120000 },
  { name: "2023", sales: 2890000 },
  { name: "2024", sales: 3580000 },
];

const chartConfig = {
  sales: {
    label: "ยอดขาย",
    color: "hsl(var(--primary))",
  },
};

const urgentOrders = [
  {
    id: "ORD001",
    customer: "บริษัท เอบีซี จำกัด",
    item: "ถ้วยรางวัลทอง 50 ใบ",
    dueDate: "วันนี้",
    status: "รอไฟล์ดีไซน์",
    priority: "สูง"
  },
  {
    id: "ORD002", 
    customer: "โรงเรียนสายรุ้ง",
    item: "เหรียญรางวัล 100 เหรียญ",
    dueDate: "พรุ่งนี้",
    status: "รอการอนุมัติ",
    priority: "กลาง"
  },
  {
    id: "ORD003",
    customer: "สมาคมนักกีฬา",
    item: "ถ้วยคริสตัล 20 ใบ",
    dueDate: "2 วัน",
    status: "แก้ไขดีไซน์",
    priority: "สูง"
  }
];

export default function SalesDashboard() {
  const navigate = useNavigate();
  const [selectedProductType, setSelectedProductType] = useState("ทั้งหมด");
  const [selectedEmployee, setSelectedEmployee] = useState("ทั้งหมด");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">แดชบอร์ดฝ่ายขาย</h1>
          <p className="text-muted-foreground">ภาพรวมการขายและออเดอร์ประจำวัน</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate("/sales/price-estimation")} variant="outline">
            <Calculator className="w-4 h-4 mr-2" />
            ประเมินราคา
          </Button>
          <Button className="bg-primary hover:bg-primary-hover">
            <Package className="w-4 h-4 mr-2" />
            สร้างออเดอร์ใหม่
          </Button>
        </div>
      </div>

      {/* Monthly Sales KPI */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            ยอดขายประจำเดือน
          </CardTitle>
          <CardDescription>เป้าหมาย 300,000 บาท</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-2xl font-bold text-primary">
                  ฿{salesData.monthly.current.toLocaleString()}
                </p>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600">
                    {salesData.monthly.percentage}% ของเป้าหมาย
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold">
                  ฿{(salesData.monthly.target - salesData.monthly.current).toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">เหลือจากเป้าหมาย</p>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-secondary rounded-full h-3">
              <div 
                className="bg-primary h-3 rounded-full transition-all duration-300"
                style={{ width: `${salesData.monthly.percentage}%` }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sales Chart */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            กราฟยอดขาย
          </CardTitle>
          <CardDescription>วิเคราะห์ยอดขายตามช่วงเวลาต่างๆ</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filters */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">กรองข้อมูล:</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Select value={selectedProductType} onValueChange={setSelectedProductType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="เลือกประเภทสินค้า" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ทั้งหมด">ทั้งหมด</SelectItem>
                  <SelectItem value="ถ้วยรางวัล">ถ้วยรางวัล</SelectItem>
                  <SelectItem value="เหรียญรางวัล">เหรียญรางวัล</SelectItem>
                  <SelectItem value="โล่รางวัล">โล่รางวัล</SelectItem>
                  <SelectItem value="ของที่ระลึก">ของที่ระลึก</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="เลือกพนักงานขาย" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ทั้งหมด">ทั้งหมด</SelectItem>
                  <SelectItem value="สมชาย ใจดี">สมชาย ใจดี</SelectItem>
                  <SelectItem value="สมหญิง รักงาน">สมหญิง รักงาน</SelectItem>
                  <SelectItem value="วิทยา เก่งขาย">วิทยา เก่งขาย</SelectItem>
                  <SelectItem value="มานี ซื่อสัตย์">มานี ซื่อสัตย์</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                <Calendar className="w-4 h-4 mr-2" />
                เลือกช่วงวันที่
              </Button>
            </div>
          </div>

          {/* Chart Tabs */}
          <div className="w-full">
            <Tabs defaultValue="daily" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="daily">รายวัน</TabsTrigger>
                <TabsTrigger value="monthly">รายเดือน</TabsTrigger>
                <TabsTrigger value="yearly">รายปี</TabsTrigger>
              </TabsList>

              <TabsContent value="daily" className="w-full">
                <div className="h-[400px] w-full bg-background rounded-lg p-4 border">
                  <ChartContainer config={chartConfig} className="w-full h-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={dailySalesData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                      >
                        <XAxis 
                          dataKey="name" 
                          tickLine={false}
                          axisLine={false}
                          className="text-xs"
                        />
                        <YAxis 
                          tickLine={false}
                          axisLine={false}
                          className="text-xs"
                          tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                        />
                        <ChartTooltip 
                          content={<ChartTooltipContent />}
                          formatter={(value) => [`฿${value.toLocaleString()}`, "ยอดขาย"]}
                        />
                        <Bar 
                          dataKey="sales" 
                          fill="var(--color-sales)"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </TabsContent>

              <TabsContent value="monthly" className="w-full">
                <div className="h-[400px] w-full bg-background rounded-lg p-4 border">
                  <ChartContainer config={chartConfig} className="w-full h-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={monthlySalesData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                      >
                        <XAxis 
                          dataKey="name" 
                          tickLine={false}
                          axisLine={false}
                          className="text-xs"
                        />
                        <YAxis 
                          tickLine={false}
                          axisLine={false}
                          className="text-xs"
                          tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                        />
                        <ChartTooltip 
                          content={<ChartTooltipContent />}
                          formatter={(value) => [`฿${value.toLocaleString()}`, "ยอดขาย"]}
                        />
                        <Bar 
                          dataKey="sales" 
                          fill="var(--color-sales)"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </TabsContent>

              <TabsContent value="yearly" className="w-full">
                <div className="h-[400px] w-full bg-background rounded-lg p-4 border">
                  <ChartContainer config={chartConfig} className="w-full h-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={yearlySalesData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                      >
                        <XAxis 
                          dataKey="name" 
                          tickLine={false}
                          axisLine={false}
                          className="text-xs"
                        />
                        <YAxis 
                          tickLine={false}
                          axisLine={false}
                          className="text-xs"
                          tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                        />
                        <ChartTooltip 
                          content={<ChartTooltipContent />}
                          formatter={(value) => [`฿${value.toLocaleString()}`, "ยอดขาย"]}
                        />
                        <Bar 
                          dataKey="sales" 
                          fill="var(--color-sales)"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Job Status Tracking */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-2">ติดตามสถานะงาน</h2>
          <p className="text-sm text-muted-foreground">จำนวนงานที่อยู่ในแต่ละสถานะ</p>
        </div>
        
        {/* Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="w-5 h-5 text-orange-500" />
                ประเมินราคา
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-orange-600">
                {salesData.jobStatus.priceEvaluation}
              </p>
              <p className="text-sm text-muted-foreground">งาน</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-500" />
                เปิดใบเสนอราคา
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">
                {salesData.jobStatus.quotationOpen}
              </p>
              <p className="text-sm text-muted-foreground">งาน</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                ชำระยอด
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">
                {salesData.jobStatus.payment}
              </p>
              <p className="text-sm text-muted-foreground">งาน</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="w-5 h-5 text-purple-500" />
                ผลิต (ภายใน)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-purple-600">
                {salesData.jobStatus.internalProduction}
              </p>
              <p className="text-sm text-muted-foreground">งาน</p>
            </CardContent>
          </Card>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-pink-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-pink-500" />
                กราฟิก
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-pink-600">
                {salesData.jobStatus.graphics}
              </p>
              <p className="text-sm text-muted-foreground">งาน</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-indigo-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Truck className="w-5 h-5 text-indigo-500" />
                ผลิต (ภายนอก)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-indigo-600">
                {salesData.jobStatus.externalProduction}
              </p>
              <p className="text-sm text-muted-foreground">งาน</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-cyan-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-cyan-500" />
                พร้อมส่ง
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-cyan-600">
                {salesData.jobStatus.readyToShip}
              </p>
              <p className="text-sm text-muted-foreground">งาน</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-emerald-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-emerald-500" />
                สำเร็จแล้ว
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-emerald-600">
                {salesData.jobStatus.completed}
              </p>
              <p className="text-sm text-muted-foreground">งาน</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Urgent Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            ออเดอร์ที่ต้องติดตามเร่งด่วน
          </CardTitle>
          <CardDescription>รายการออเดอร์ที่ต้องดำเนินการด่วน</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {urgentOrders.map((order) => (
              <div 
                key={order.id} 
                className="flex items-center justify-between p-4 border rounded-lg hover:shadow-soft transition-shadow"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{order.id}</span>
                    <Badge 
                      variant={order.priority === "สูง" ? "destructive" : "secondary"}
                    >
                      {order.priority}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium">{order.customer}</p>
                  <p className="text-sm text-muted-foreground">{order.item}</p>
                </div>
                
                <div className="text-right space-y-1">
                  <p className="text-sm font-medium text-red-600">
                    กำหนดส่ง: {order.dueDate}
                  </p>
                  <p className="text-sm text-muted-foreground">{order.status}</p>
                </div>
                
                <Button variant="outline" size="sm">
                  ติดตาม
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-medium transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              ลูกค้าทั้งหมด
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              จัดการข้อมูลลูกค้าและประวัติการสั่งซื้อ
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-medium transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              สต็อกสินค้า
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              ตรวจสอบจำนวนสินค้าคงเหลือแบบเรียลไทม์
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-medium transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              รายงานยอดขาย
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              ดูรายงานและวิเคราะห์ยอดขายรายละเอียด
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}