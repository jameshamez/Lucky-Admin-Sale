import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Edit, Eye, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PriceEstimation() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data for price estimations
  const estimations = [
    {
      id: 1,
      date: "2024-01-15",
      lineName: "customer_line_001",
      productType: "Medal (เหรียญรางวัล)",
      quantity: 100,
      price: 15000,
      status: "รอการอนุมัติ"
    },
    {
      id: 2,
      date: "2024-01-14",
      lineName: "customer_line_002",
      productType: "Trophy (ถ้วยรางวัล)",
      quantity: 50,
      price: 25000,
      status: "อนุมัติแล้ว"
    },
    {
      id: 3,
      date: "2024-01-13",
      lineName: "customer_line_003",
      productType: "Shirt (เสื้อ)",
      quantity: 200,
      price: 8000,
      status: "ยกเลิก"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "อนุมัติแล้ว":
        return "bg-green-100 text-green-800";
      case "รอการอนุมัติ":
        return "bg-yellow-100 text-yellow-800";
      case "ยกเลิก":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredEstimations = estimations.filter(estimation =>
    estimation.lineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    estimation.productType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">ประเมินราคา</h1>
          <p className="text-muted-foreground">จัดการการประเมินราคาสินค้า</p>
        </div>
        <Button onClick={() => navigate("/sales/price-estimation/add")} className="gap-2">
          <Plus className="h-4 w-4" />
          เพิ่มประเมินราคา
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>รายการประเมินราคา</CardTitle>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="ค้นหาตาม LINE หรือประเภทสินค้า..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>วันที่ประเมินราคา</TableHead>
                <TableHead>ชื่อ LINE</TableHead>
                <TableHead>ประเภทสินค้า</TableHead>
                <TableHead>จำนวน</TableHead>
                <TableHead>ราคา (บาท)</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead className="text-center">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEstimations.map((estimation) => (
                <TableRow key={estimation.id}>
                  <TableCell>{new Date(estimation.date).toLocaleDateString('th-TH')}</TableCell>
                  <TableCell>{estimation.lineName}</TableCell>
                  <TableCell>{estimation.productType}</TableCell>
                  <TableCell>{estimation.quantity.toLocaleString()}</TableCell>
                  <TableCell>{estimation.price.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(estimation.status)}>
                      {estimation.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
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