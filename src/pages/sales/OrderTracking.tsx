import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Search, 
  Filter,
  Calendar,
  Package,
  Truck,
  CheckCircle,
  Clock,
  AlertTriangle,
  Eye,
  Globe,
  MapPin,
  Building,
  Palette,
  Factory,
  ShoppingCart,
  Plane
} from "lucide-react";

const orders = [
  {
    id: "ORD001",
    customer: "บริษัท เอบีซี จำกัด",
    items: "ถ้วยรางวัลทอง 50 ใบ",
    orderDate: "2024-01-10",
    dueDate: "2024-01-20",
    status: "pending_approval",
    value: 25000,
    progress: 25,
    type: "internal", // internal or external
    location: "domestic", // domestic or international (for external)
    department: "graphics" // graphics, production, shipping (for internal)
  },
  {
    id: "ORD002",
    customer: "โรงเรียนสายรุ้ง", 
    items: "เหรียญรางวัล 100 เหรียญ",
    orderDate: "2024-01-08",
    dueDate: "2024-01-18",
    status: "in_production",
    value: 12000,
    progress: 60,
    type: "internal",
    location: "domestic",
    department: "production"
  },
  {
    id: "ORD003",
    customer: "สมาคมนักกีฬา",
    items: "ถ้วยคริสตัล 20 ใบ",
    orderDate: "2024-01-05",
    dueDate: "2024-01-15",
    status: "ready_to_ship",
    value: 15000,
    progress: 90,
    type: "internal",
    location: "domestic",
    department: "shipping"
  },
  {
    id: "ORD004",
    customer: "บริษัท XYZ จำกัด",
    items: "โล่รางวัลไม้ 30 ใบ",
    orderDate: "2024-01-03",
    dueDate: "2024-01-13",
    status: "shipped",
    value: 8400,
    progress: 100,
    type: "external",
    location: "domestic",
    department: ""
  },
  {
    id: "ORD005",
    customer: "International Sports Club",
    items: "Crystal Trophies 15 pcs",
    orderDate: "2024-01-12",
    dueDate: "2024-01-25",
    status: "urgent",
    value: 18000,
    progress: 15,
    type: "external",
    location: "international",
    department: ""
  }
];

const statusConfig = {
  pending_approval: {
    label: "รออนุมัติ",
    color: "bg-amber-500",
    icon: Clock
  },
  in_production: {
    label: "กำลังผลิต",
    color: "bg-blue-500",
    icon: Package
  },
  ready_to_ship: {
    label: "พร้อมส่ง",
    color: "bg-purple-500",
    icon: Truck
  },
  shipped: {
    label: "จัดส่งแล้ว",
    color: "bg-green-500",
    icon: CheckCircle
  },
  urgent: {
    label: "เร่งด่วน",
    color: "bg-red-500",
    icon: AlertTriangle
  }
};

export default function OrderTracking() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.items.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getOrdersByType = (type: string, location?: string, department?: string) => {
    return filteredOrders.filter(order => {
      if (type === "external") {
        return order.type === "external" && (!location || order.location === location);
      }
      if (type === "internal") {
        return order.type === "internal" && (!department || order.department === department);
      }
      return false;
    });
  };

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig];
    const IconComponent = config.icon;
    
    return (
      <Badge className={`${config.color} text-white flex items-center gap-1`}>
        <IconComponent className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const getProgressColor = (progress: number, status: string) => {
    if (status === "urgent") return "bg-red-500";
    if (progress === 100) return "bg-green-500";
    if (progress >= 60) return "bg-blue-500";
    if (progress >= 30) return "bg-amber-500";
    return "bg-gray-400";
  };

  const renderOrdersList = (orders: any[], emptyMessage: string) => (
    <div className="space-y-4">
      {orders.map((order) => (
        <Card key={order.id} className="hover:shadow-medium transition-shadow">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
              {/* Order Info */}
              <div className="lg:col-span-4">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-lg">{order.id}</h3>
                  {getStatusBadge(order.status)}
                </div>
                <p className="font-medium">{order.customer}</p>
                <p className="text-sm text-muted-foreground">{order.items}</p>
              </div>

              {/* Dates */}
              <div className="lg:col-span-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-sm">
                    <Calendar className="w-3 h-3 text-muted-foreground" />
                    <span className="text-muted-foreground">สั่ง:</span>
                    <span>{order.orderDate}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Calendar className="w-3 h-3 text-muted-foreground" />
                    <span className="text-muted-foreground">ส่ง:</span>
                    <span className={order.status === "urgent" ? "text-red-600 font-medium" : ""}>
                      {order.dueDate}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress */}
              <div className="lg:col-span-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>ความคืบหน้า</span>
                    <span className="font-medium">{order.progress}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(order.progress, order.status)}`}
                      style={{ width: `${order.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Value & Actions */}
              <div className="lg:col-span-2">
                <div className="text-right space-y-2">
                  <p className="text-lg font-bold text-primary">
                    ฿{order.value.toLocaleString()}
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full lg:w-auto"
                    onClick={() => {
                      setSelectedOrder(order);
                      setIsDialogOpen(true);
                    }}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    ดูรายละเอียด
                  </Button>
                </div>
              </div>

              {/* Urgent Indicator */}
              {order.status === "urgent" && (
                <div className="lg:col-span-1">
                  <div className="flex justify-center">
                    <div className="animate-pulse">
                      <AlertTriangle className="w-6 h-6 text-red-500" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
      
      {orders.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">{emptyMessage}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">ติดตามออเดอร์</h1>
          <p className="text-muted-foreground">ดูสถานะและความคืบหน้าของออเดอร์ทั้งหมด</p>
        </div>
        <Button className="bg-primary hover:bg-primary-hover">
          <Package className="w-4 h-4 mr-2" />
          สร้างออเดอร์ใหม่
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="ค้นหาออเดอร์ (รหัส, ลูกค้า, สินค้า)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="กรองตามสถานะ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทั้งหมด</SelectItem>
            <SelectItem value="pending_approval">รออนุมัติ</SelectItem>
            <SelectItem value="in_production">กำลังผลิต</SelectItem>
            <SelectItem value="ready_to_ship">พร้อมส่ง</SelectItem>
            <SelectItem value="shipped">จัดส่งแล้ว</SelectItem>
            <SelectItem value="urgent">เร่งด่วน</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Main Tracking Tabs */}
      <Tabs defaultValue="external" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="external" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            ติดตามสถานะภายนอก
          </TabsTrigger>
          <TabsTrigger value="internal" className="flex items-center gap-2">
            <Building className="w-4 h-4" />
            ติดตามสถานะภายใน
          </TabsTrigger>
        </TabsList>

        {/* External Tracking */}
        <TabsContent value="external" className="space-y-6">
          <Tabs defaultValue="international" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="international" className="flex items-center gap-2">
                <Plane className="w-4 h-4" />
                ติดตามสถานะต่างประเทศ
              </TabsTrigger>
              <TabsTrigger value="domestic" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                ติดตามสถานะในประเทศ
              </TabsTrigger>
            </TabsList>

            <TabsContent value="international" className="mt-6">
              {renderOrdersList(
                getOrdersByType("external", "international"), 
                "ไม่พบออเดอร์ต่างประเทศที่ตรงกับเงื่อนไขการค้นหา"
              )}
            </TabsContent>

            <TabsContent value="domestic" className="mt-6">
              {renderOrdersList(
                getOrdersByType("external", "domestic"), 
                "ไม่พบออเดอร์ในประเทศที่ตรงกับเงื่อนไขการค้นหา"
              )}
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* Internal Tracking */}
        <TabsContent value="internal" className="space-y-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">ติดตามสถานะการผลิตสินค้าภายในบริษัท</h3>
          </div>
          
          <Tabs defaultValue="graphics" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="graphics" className="flex items-center gap-2">
                <Palette className="w-4 h-4" />
                สถานะแผนกกราฟฟิค
              </TabsTrigger>
              <TabsTrigger value="production" className="flex items-center gap-2">
                <Factory className="w-4 h-4" />
                สถานะแผนกผลิต
              </TabsTrigger>
              <TabsTrigger value="shipping" className="flex items-center gap-2">
                <Truck className="w-4 h-4" />
                สถานะในการจัดส่ง
              </TabsTrigger>
            </TabsList>

            <TabsContent value="graphics" className="mt-6">
              {renderOrdersList(
                getOrdersByType("internal", undefined, "graphics"), 
                "ไม่พบออเดอร์ในแผนกกราฟฟิคที่ตรงกับเงื่อนไขการค้นหา"
              )}
            </TabsContent>

            <TabsContent value="production" className="mt-6">
              {renderOrdersList(
                getOrdersByType("internal", undefined, "production"), 
                "ไม่พบออเดอร์ในแผนกผลิตที่ตรงกับเงื่อนไขการค้นหา"
              )}
            </TabsContent>

            <TabsContent value="shipping" className="mt-6">
              {renderOrdersList(
                getOrdersByType("internal", undefined, "shipping"), 
                "ไม่พบออเดอร์ในการจัดส่งที่ตรงกับเงื่อนไขการค้นหา"
              )}
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>

      {/* Order Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">รายละเอียดออเดอร์ {selectedOrder?.id}</DialogTitle>
            <DialogDescription>ข้อมูลเต็มของออเดอร์และสถานะการดำเนินการ</DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Status Badge */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">สถานะปัจจุบัน</p>
                  {getStatusBadge(selectedOrder.status)}
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground mb-1">มูลค่าออเดอร์</p>
                  <p className="text-2xl font-bold text-primary">฿{selectedOrder.value.toLocaleString()}</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">ความคืบหน้า</span>
                  <span className="font-bold">{selectedOrder.progress}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(selectedOrder.progress, selectedOrder.status)}`}
                    style={{ width: `${selectedOrder.progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">ลูกค้า</p>
                  <p className="font-medium">{selectedOrder.customer}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">ประเภทออเดอร์</p>
                  <p className="font-medium">
                    {selectedOrder.type === "internal" ? "ออเดอร์ภายใน" : "ออเดอร์ภายนอก"}
                  </p>
                </div>
              </div>

              {/* Items */}
              <div>
                <p className="text-sm text-muted-foreground mb-1">รายการสินค้า</p>
                <p className="font-medium">{selectedOrder.items}</p>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">วันที่สั่งซื้อ</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <p className="font-medium">{selectedOrder.orderDate}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">วันที่ต้องส่ง</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <p className={`font-medium ${selectedOrder.status === "urgent" ? "text-red-600" : ""}`}>
                      {selectedOrder.dueDate}
                    </p>
                  </div>
                </div>
              </div>

              {/* Location/Department Info */}
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  {selectedOrder.type === "internal" ? "แผนก" : "สถานที่"}
                </p>
                <p className="font-medium">
                  {selectedOrder.type === "internal" 
                    ? selectedOrder.department === "graphics" 
                      ? "แผนกกราฟฟิค" 
                      : selectedOrder.department === "production" 
                      ? "แผนกผลิต" 
                      : "แผนกจัดส่ง"
                    : selectedOrder.location === "international" 
                      ? "ต่างประเทศ" 
                      : "ในประเทศ"
                  }
                </p>
              </div>

              {/* Urgent Warning */}
              {selectedOrder.status === "urgent" && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertTriangle className="w-5 h-5" />
                    <p className="font-medium">ออเดอร์นี้เร่งด่วน! กรุณาเร่งดำเนินการ</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}