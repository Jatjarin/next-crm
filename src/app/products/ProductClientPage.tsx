"use client";

import { useState, useEffect, useTransition } from "react";
import { addProduct } from "./actions";
import { Plus, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation"; // 1. Import useRouter
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Product = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  stock_quantity: number; // เพิ่ม field สต็อก
  width: number | null;
  length: number | null;
  thickness: number | null;
};

type Supplier = {
  id: number;
  name: string;
};

interface Props {
  initialProducts: Product[];
  suppliers: Supplier[];
}

export default function ProductClientPage({
  initialProducts,
  suppliers,
}: Props) {
  const [products, setProducts] = useState(initialProducts);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter(); // 2. Initialize router
  const t = useTranslations("ProductsPage");

  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  const handleFormSubmit = (formData: FormData) => {
    startTransition(async () => {
      await addProduct(formData);
      setIsDialogOpen(false);
    });
  };

  // 3. สร้างฟังก์ชันสำหรับจัดการการคลิก
  const handleRowClick = (productId: number) => {
    router.push(`/products/${productId}`);
  };

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus size={20} className="mr-2" /> {t("addNew")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t("dialogTitle")}</DialogTitle>
              <DialogDescription>{t("dialogDescription")}</DialogDescription>
            </DialogHeader>
            <form action={handleFormSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    {t("addNewItemNameLabel")}
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    {t("addNewItemDescLabel")}
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {/* Corrected Order: Thickness, Width, Length */}
                  <div className="space-y-2">
                    <Label htmlFor="thickness">{t("thickness")}</Label>
                    <Input
                      id="thickness"
                      name="thickness"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      defaultValue={0}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="width">{t("width")}</Label>
                    <Input
                      id="width"
                      name="width"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      defaultValue={0}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="length">{t("length")}</Label>
                    <Input
                      id="length"
                      name="length"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      defaultValue={0}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="price" className="text-right">
                    {t("addNewItemPriceLabel")}
                  </Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    defaultValue={0}
                    className="col-span-3"
                    required
                  />
                </div>
                {/* --- เพิ่มช่องกรอกสต็อก --- */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="stock_quantity" className="text-right">
                    {t("stockQuantity")}
                  </Label>
                  <Input
                    id="stock_quantity"
                    name="stock_quantity"
                    className="col-span-3"
                    type="number"
                    defaultValue={0}
                    required
                  />
                </div>
                {/* New Field for Low Stock Threshold */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="low_stock_threshold" className="text-right">
                    {t("lowStockThreshold")}
                  </Label>
                  <Input
                    id="low_stock_threshold"
                    name="low_stock_threshold"
                    className="col-span-3"
                    type="number"
                    defaultValue={0}
                    required
                  />
                </div>
                {/* Supplier Selection */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="supplierId" className="text-right">
                    {t("supplier")}
                  </Label>
                  <select
                    id="supplierId"
                    name="supplierId"
                    className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">{t("selectSupplier")}</option>
                    {suppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isPending}>
                  {isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {t("addNewItemButtonTitle")}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>{t("productListTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="w-full overflow-x-auto">
            <table className="w-full table-fixed">
              <thead className="border-b">
                <tr>
                  <th className="h-10 px-4 text-left align-middle font-medium w-[20%]">
                    {t("tableHeaderName")}
                  </th>
                  <th className="h-10 px-4 text-left align-middle font-medium w-[15%]">
                    {t("tableHeaderDimensions")}
                  </th>
                  <th className="h-10 px-4 text-left align-middle font-medium w-[35%]">
                    {t("tableHeaderDescription")}
                  </th>
                  <th className="h-10 px-4 text-right align-middle font-medium w-[15%]">
                    {t("tableHeaderQuantity")}
                  </th>
                  <th className="h-10 px-4 text-right align-middle font-medium w-[15%]">
                    {t("tableHeaderPrice")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleRowClick(product.id)}
                  >
                    <td className="p-4 align-middle font-medium overflow-hidden text-ellipsis">
                      {product.name}
                    </td>
                    <td className="p-4 align-middle text-muted-foreground overflow-hidden text-ellipsis">
                      {`${product.thickness ?? "-"} x ${product.width ?? "-"} x ${
                        product.length ?? "-"
                      }`}
                    </td>
                    <td className="p-4 align-middle text-muted-foreground overflow-hidden text-ellipsis">
                      {product.description || "-"}
                    </td>
                    <td className="p-4 align-middle text-right">
                      {product.stock_quantity}
                    </td>
                    <td className="p-4 align-middle text-right whitespace-nowrap">
                      ฿
                      {Number(product.price).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
