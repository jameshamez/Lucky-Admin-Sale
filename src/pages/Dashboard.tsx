import { 
  ShoppingCart, 
  Package, 
  TrendingUp, 
  Users,
  Trophy,
  Star,
  Award,
  Clock
} from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { OrderStatusCard } from "@/components/dashboard/OrderStatusCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Mock data
const stats = [
  {
    title: "ออเดอร์ใหม่วันนี้",
    value: "12",
    change: "+2 จากเมื่อวาน",
    icon: <ShoppingCart className="w-4 h-4" />,
    trend: "up" as const,
  },
  {
    title: "ยอดขายเดือนนี้",
    value: "฿485,750",
    change: "+12.5% จากเดือนที่แล้ว",
    icon: <TrendingUp className="w-4 h-4" />,
    trend: "up" as const,
  },
  {
    title: "สินค้าคงเหลือ",
    value: "2,847",
    change: "ชิ้น",
    icon: <Package className="w-4 h-4" />,
    trend: "neutral" as const,
  },
  {
    title: "ลูกค้าใหม่",
    value: "24",
    change: "คนในเดือนนี้",
    icon: <Users className="w-4 h-4" />,
    trend: "up" as const,
  },
];

const recentOrders = [
  {
    id: "ORD-001",
    customerName: "บริษัท ABC จำกัด",
    status: "pending" as const,
    total: 15750,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    items: ["ถ้วยรางวัล ทอง", "เหรียญทองแดง"],
  },
  {
    id: "ORD-002", 
    customerName: "โรงเรียนสมาร์ท",
    status: "in_progress" as const,
    total: 8950,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    items: ["ถ้วยเงิน", "โล่รางวัล"],
  },
  {
    id: "ORD-003",
    customerName: "สมาคมกีฬาแห่งชาติ", 
    status: "completed" as const,
    total: 45000,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    items: ["ถ้วยทอง", "เหรียญทอง", "เหรียญเงิน"],
  },
];

const urgentTasks = [
  { task: "อนุมัติการออกแบบสำหรับ ORD-001", department: "กราฟิก", time: "2 ชั่วโมง" },
  { task: "ตรวจสอบวัตถุดิบสำหรับ ORD-005", department: "จัดซื้อ", time: "4 ชั่วโมง" },
  { task: "จัดส่งออเดอร์ ORD-003", department: "ผลิต", time: "6 ชั่วโมง" },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">แดชบอร์ด</h1>
          <p className="text-muted-foreground">ภาพรวมระบบ THE BRAVO ERP</p>
        </div>
        <Button className="bg-gradient-to-r from-primary to-primary-hover hover:from-primary-hover hover:to-primary">
          <ShoppingCart className="w-4 h-4 mr-2" />
          สร้างออเดอร์ใหม่
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-primary" />
                ออเดอร์ล่าสุด
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <OrderStatusCard key={order.id} order={order} />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Urgent Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              งานด่วน
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {urgentTasks.map((task, index) => (
                <div key={index} className="flex flex-col space-y-1 p-3 bg-muted/30 rounded-lg">
                  <p className="text-sm font-medium">{task.task}</p>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{task.department}</span>
                    <span>เหลือ {task.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Product Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            หมวดหมู่สินค้ายอดนิยม
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
            {[
              { name: "ถ้วยรางวัล", icon: Trophy, count: 145, color: "text-yellow-600" },
              { name: "เหรียญรางวัล", icon: Award, count: 89, color: "text-gray-600" },
              { name: "โล่รางวัล", icon: Star, count: 67, color: "text-blue-600" },
              { name: "ป้ายรางวัล", icon: Package, count: 34, color: "text-green-600" },
            ].map((category) => (
              <div key={category.name} className="flex items-center space-x-3 p-4 bg-muted/30 rounded-lg">
                <category.icon className={`w-8 h-8 ${category.color}`} />
                <div>
                  <p className="font-medium">{category.name}</p>
                  <p className="text-sm text-muted-foreground">{category.count} รายการ</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}