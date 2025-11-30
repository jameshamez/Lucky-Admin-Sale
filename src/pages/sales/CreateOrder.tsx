import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit, Eye, Plus } from "lucide-react";
import CreateOrderForm from "@/components/sales/CreateOrderForm";

export default function CreateOrder() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Mock data for existing orders
  const mockOrders = [
    {
      id: 1,
      jobId: "JOB-2024-001",
      orderDate: "2024-01-15",
      lineName: "customer_line1",
      customerName: "สมชาย ใจดี",
      product: "ถ้วยรางวัล",
      salesChannel: "ลูกค้าสั่งเอง",
      deliveryDate: "2024-01-25",
      status: "กำลังผลิต",
      taxInvoiceNumber: "INV-2024-001",
      taxInvoiceDate: "2024-01-15",
      taxInvoiceStatus: "ออกแล้ว",
      taxCompanyName: "บริษัท สมชาย จำกัด",
      taxId: "0123456789012",
      subtotal: 10000,
      vatAmount: 700,
      totalWithVat: 10700
    },
    {
      id: 2,
      jobId: "JOB-2024-002",
      orderDate: "2024-01-16",
      lineName: "shop_manager",
      customerName: "สุดา เก่งมาก",
      product: "เหรียญรางวัล",
      salesChannel: "ฟรีแลนซ์",
      deliveryDate: "2024-01-30",
      status: "รอดำเนินการ",
      taxInvoiceNumber: null,
      taxInvoiceDate: null,
      taxInvoiceStatus: "ยังไม่ออก",
      taxCompanyName: "สุดา เก่งมาก",
      taxId: null,
      subtotal: 15000,
      vatAmount: 1050,
      totalWithVat: 16050
    },
    {
      id: 3,
      jobId: "JOB-2024-003",
      orderDate: "2024-01-17",
      lineName: "event_planner",
      customerName: "อนันต์ ชาญฉลาด",
      product: "โล่รางวัล",
      salesChannel: "ร้านค้าตัวแทน",
      deliveryDate: "2024-02-05",
      status: "เสร็จสิ้น",
      taxInvoiceNumber: "INV-2024-003",
      taxInvoiceDate: "2024-01-17",
      taxInvoiceStatus: "ออกแล้ว",
      taxCompanyName: "ห้างหุ้นส่วนอนันต์",
      taxId: "9876543210987",
      subtotal: 25000,
      vatAmount: 1750,
      totalWithVat: 26750
    }
  ];

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
      "รอดำเนินการ": "outline",
      "กำลังผลิต": "default",
      "เสร็จสิ้น": "secondary"
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  const handleFormSubmit = (data: any) => {
    console.log(isEditing ? "Order updated:" : "Order created:", data);
    setShowCreateForm(false);
    setIsEditing(false);
    setSelectedOrder(null);
    // Here you would typically save the data to your backend
  };

  const handleFormCancel = () => {
    setShowCreateForm(false);
    setIsEditing(false);
    setSelectedOrder(null);
  };

  const handleViewOrder = (order: any) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handleEditOrder = (order: any) => {
    setSelectedOrder(order);
    setIsEditing(true);
    setShowCreateForm(true);
    setShowOrderDetails(false);
  };

  const handleBackToList = () => {
    setShowOrderDetails(false);
    setSelectedOrder(null);
  };

  if (showOrderDetails && selectedOrder) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">รายละเอียดคำสั่งซื้อ #{selectedOrder.id}</h1>
            <p className="text-muted-foreground">ข้อมูลคำสั่งซื้อทั้งหมด</p>
          </div>
          <Button variant="outline" onClick={handleBackToList}>
            กลับไปรายการคำสั่งซื้อ
          </Button>
        </div>

        {/* Order Basic Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>ข้อมูลคำสั่งซื้อ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">JOB ID</p>
                <p className="font-medium text-primary">{selectedOrder.jobId}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">วันที่สั่งซื้อ</p>
                <p className="font-medium">{selectedOrder.orderDate}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">วันจัดส่ง</p>
                <p className="font-medium">{selectedOrder.deliveryDate}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">ช่องทางการขาย</p>
                <Badge variant="outline">{selectedOrder.salesChannel}</Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">สถานะ</p>
                {getStatusBadge(selectedOrder.status)}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">พนักงานที่รับผิดชอบ</p>
                <p className="font-medium">{selectedOrder.responsiblePerson || "ไม่ระบุ"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>ข้อมูลลูกค้า</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">ชื่อผู้สั่งซื้อ</p>
                <p className="font-medium">{selectedOrder.customerName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">ชื่อ LINE</p>
                <p className="font-medium">{selectedOrder.lineName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">เบอร์โทร</p>
                <p className="font-medium">{selectedOrder.customerPhone || "ไม่ระบุ"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">อีเมล</p>
                <p className="font-medium">{selectedOrder.customerEmail || "ไม่ระบุ"}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-muted-foreground">ที่อยู่</p>
                <p className="font-medium">{selectedOrder.customerAddress || "ไม่ระบุ"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">เลขผู้เสียภาษี</p>
                <p className="font-medium">{selectedOrder.taxId || "ไม่ระบุ"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Job Details Card */}
        <Card>
          <CardHeader>
            <CardTitle>รายละเอียดงาน</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">ประเภทสินค้า</p>
                <p className="font-medium">{selectedOrder.productType || "ไม่ระบุ"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">วัสดุ</p>
                <p className="font-medium">{selectedOrder.material || "ไม่ระบุ"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">ขนาด</p>
                <p className="font-medium">{selectedOrder.size || selectedOrder.customSize || "ไม่ระบุ"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">รูปทรง</p>
                <p className="font-medium">{selectedOrder.shapeFiles ? `${selectedOrder.shapeFiles.length} ไฟล์` : "ไม่ระบุ"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">จำนวน</p>
                <p className="font-medium">{selectedOrder.quantity || "ไม่ระบุ"} ชิ้น</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">ราคาต่อหน่วย</p>
                <p className="font-medium">{selectedOrder.unitPrice ? `${selectedOrder.unitPrice} บาท` : "ไม่ระบุ"}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-muted-foreground">รายละเอียดเพิ่มเติม</p>
                <p className="font-medium">{selectedOrder.additionalDetails || "ไม่มี"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Saved Products Card */}
        {selectedOrder.savedProducts && selectedOrder.savedProducts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>สินค้าที่บันทึกแล้ว</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {selectedOrder.savedProducts.map((product: any, index: number) => (
                  <div key={index} className="p-4 border rounded-lg bg-muted/50">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">ประเภท:</span> <span className="font-medium">{product.productType}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">วัสดุ:</span> <span className="font-medium">{product.material}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">ขนาด:</span> <span className="font-medium">{product.size || product.customSize}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">จำนวน:</span> <span className="font-medium">{product.quantity} ชิ้น</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">ราคา/หน่วย:</span> <span className="font-medium">{product.unitPrice} บาท</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">รวม:</span> <span className="font-medium">{product.quantity * product.unitPrice} บาท</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tax Invoice Card */}
        <Card>
          <CardHeader>
            <CardTitle>ข้อมูลผู้เสียภาษี</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">ชื่อผู้เสียภาษี</p>
                <p className="font-medium">{selectedOrder.taxCompanyName || selectedOrder.customerName || "ไม่ระบุ"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">เลขประจำตัวผู้เสียภาษี</p>
                <p className="font-medium">{selectedOrder.taxId || "ไม่ระบุ"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">ที่อยู่ผู้เสียภาษี</p>
                <p className="font-medium whitespace-pre-line">{selectedOrder.customerAddress || "ไม่ระบุ"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery & Payment Card */}
        <Card>
          <CardHeader>
            <CardTitle>ข้อมูลการจัดส่งและการชำระเงิน</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">วิธีการจัดส่ง</p>
                <p className="font-medium">{selectedOrder.deliveryMethod || "ไม่ระบุ"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">ค่าจัดส่ง</p>
                <p className="font-medium">{selectedOrder.deliveryCost ? `${selectedOrder.deliveryCost} บาท` : "ไม่ระบุ"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">วิธีการชำระเงิน</p>
                <p className="font-medium">{selectedOrder.paymentMethod || "ไม่ระบุ"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">สถานะการชำระเงิน</p>
                <Badge variant={selectedOrder.paymentStatus === "ชำระแล้ว" ? "default" : "outline"}>
                  {selectedOrder.paymentStatus || "รอชำระ"}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">ยอดรวมทั้งหมด</p>
                <p className="font-medium text-lg">{selectedOrder.totalAmount ? `${selectedOrder.totalAmount} บาท` : "ไม่ระบุ"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showCreateForm) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {isEditing ? "แก้ไขคำสั่งซื้อ" : "สร้างรายการคำสั่งซื้อ"}
            </h1>
            <p className="text-muted-foreground">
              {isEditing ? "แก้ไขข้อมูลคำสั่งซื้อ" : "กรอกข้อมูลเพื่อสร้างคำสั่งซื้อใหม่"}
            </p>
          </div>
          <Button variant="outline" onClick={handleFormCancel}>
            กลับไปรายการคำสั่งซื้อ
          </Button>
        </div>
        
        <CreateOrderForm 
          onSubmit={handleFormSubmit} 
          onCancel={handleFormCancel}
          initialData={isEditing ? selectedOrder : undefined}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">จัดการคำสั่งซื้อ</h1>
          <p className="text-muted-foreground">สร้างและจัดการคำสั่งซื้อ</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          สร้างรายการคำสั่งซื้อ
        </Button>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>รายการคำสั่งซื้อ</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>JOB ID</TableHead>
                <TableHead>วันที่สั่งซื้อ</TableHead>
                <TableHead>ช่องทางการขาย</TableHead>
                <TableHead>ชื่อ LINE</TableHead>
                <TableHead>ชื่อผู้สั่งซื้อ</TableHead>
                <TableHead>สินค้า</TableHead>
                <TableHead>วันจัดส่ง</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead>จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.jobId}</TableCell>
                  <TableCell>{order.orderDate}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{order.salesChannel}</Badge>
                  </TableCell>
                  <TableCell>{order.lineName}</TableCell>
                  <TableCell>{order.customerName}</TableCell>
                  <TableCell>{order.product}</TableCell>
                  <TableCell>{order.deliveryDate}</TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleViewOrder(order)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleEditOrder(order)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}