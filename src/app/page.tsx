import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
//import { usePathname } from "next/navigation"
import { getTranslations } from "next-intl/server"
import {
  Users,
  Wallet,
  Hourglass,
  FileWarning,
  TriangleAlert,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

// --- 1. สร้าง Type Definitions ที่ถูกต้อง ---
type InvoiceItem = {
  description: string
  quantity: number
  unitPrice: number
}

type CustomerInfo = {
  name: string
}

interface InvoiceWithCustomer {
  id: number
  invoice_number: string
  issue_date: string
  items: InvoiceItem[]
  status: string
  // ความสัมพันธ์แบบ to-one ที่ถูกต้องคือ Object หรือ null
  customers: CustomerInfo | null
}

interface Item {
  quantity: number
  unitPrice: number
}

type LowStockProduct = {
  id: number
  name: string
  stock_quantity: number
  low_stock_threshold: number
}

const calculateTotal = (items: Item[]): number =>
  items?.reduce(
    (sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0),
    0
  ) || 0
const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
// const getStatusBadge = (status: string) => {
//   switch (status) {
//     case "Paid":
//       return <Badge variant="success">ชำระแล้ว</Badge>
//     case "Sent":
//       return <Badge variant="default">ส่งแล้ว</Badge>
//     case "Overdue":
//       return <Badge variant="destructive">ค้างชำระ</Badge>
//     case "Draft":
//     default:
//       return <Badge variant="secondary">ฉบับร่าง</Badge>
//   }
// }
// ฟังก์ชันนี้จะคืนค่า variant ของ Badge ตามสถานะ
const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case "Paid":
      return "success"
    case "Sent":
      return "default"
    case "Overdue":
      return "destructive"
    case "Draft":
    default:
      return "secondary"
  }
}

export default async function DashboardPage() {
  const supabase = await createClient()
  // ดึงฟังก์ชันแปลภาษาสำหรับ Server Component
  const t = await getTranslations("Dashboard")
  const tStatus = await getTranslations("StatusKeys")

  const [customerData, invoiceData, lowStockData] = await Promise.all([
    supabase.from("customers").select("*", { count: "exact", head: true }),
    supabase
      .from("invoices")
      .select(
        "id, invoice_number, items, status, issue_date, customers!inner ( name )"
      )
      .order("issue_date", { ascending: false }),
    // Query for low stock products
    supabase.rpc("get_low_stock_products"),
  ])

  const { count: customerCount } = customerData
  const { data: invoices, error: invoiceError } = invoiceData
  const { data: lowStockProducts, error: lowStockError } = lowStockData

  if (invoiceError || lowStockError) {
    return <p className="p-8">เกิดข้อผิดพลาดในการโหลดข้อมูล</p>
  }

  // แก้ไข: ใช้ unknown เพื่อหลีกเลี่ยง TypeScript error
  const typedInvoices = (invoices || []) as unknown as InvoiceWithCustomer[]
  const typedLowStockProducts = (lowStockProducts || []) as LowStockProduct[]

  const totalRevenue = typedInvoices
    .filter((inv) => inv.status === "Paid")
    .reduce((sum, inv) => sum + calculateTotal(inv.items), 0)

  const outstandingRevenue = typedInvoices
    .filter((inv) => inv.status === "Sent" || inv.status === "Overdue")
    .reduce((sum, inv) => sum + calculateTotal(inv.items), 0)

  const overdueInvoicesCount = typedInvoices.filter(
    (inv) => inv.status === "Overdue"
  ).length
  const recentInvoices = typedInvoices.slice(0, 5)

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">{t("title")}</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("totalCustomers")}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customerCount ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              {t("cardDescriptions.totalCustomers")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("totalRevenue")}
            </CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ฿{totalRevenue.toLocaleString("en-US")}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("cardDescriptions.totalRevenue")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("outstandingRevenue")}
            </CardTitle>
            <Hourglass className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ฿{outstandingRevenue.toLocaleString("en-US")}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("cardDescriptions.outstandingRevenue")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("overdueInvoices")}
            </CardTitle>
            <FileWarning className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overdueInvoicesCount}</div>
            <p className="text-xs text-muted-foreground">
              {t("cardDescriptions.overdueInvoices")}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("recentInvoicesTitle")}</CardTitle>
          <CardDescription>{t("recentInvoicesDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("tableInvoiceNo")}</TableHead>
                <TableHead>{t("tableCustomer")}</TableHead>
                <TableHead>{t("tableIssueDate")}</TableHead>
                <TableHead className="text-right">{t("tableTotal")}</TableHead>
                <TableHead className="text-center">
                  {t("tableStatus")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/invoices/${invoice.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {invoice.invoice_number}
                    </Link>
                  </TableCell>
                  {/* --- แก้ไขที่นี่: เข้าถึงสมาชิกตัวแรกของ Array --- */}
                  <TableCell>
                    {invoice.customers?.name || "ไม่ระบุลูกค้า"}
                  </TableCell>
                  <TableCell>{formatDate(invoice.issue_date)}</TableCell>
                  <TableCell className="text-right">
                    ฿
                    {calculateTotal(invoice.items).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </TableCell>
                  {/* <TableCell className="text-center">
                    {getStatusBadge(invoice.status)}
                  </TableCell> */}
                  <TableCell className="text-center">
                    <Badge variant={getStatusBadgeVariant(invoice.status)}>
                      {tStatus(invoice.status.toLowerCase() as string)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {/* Low Stock Alert Card (takes 1/3 width on large screens) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TriangleAlert className="mr-2 h-5 w-5 text-destructive" />
            {t("lowStockAlertTitle")}
          </CardTitle>
          <CardDescription>{t("lowStockAlertDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("tableProduct")}</TableHead>
                <TableHead className="text-right">
                  {t("tableRemaining")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {typedLowStockProducts.length > 0 ? (
                typedLowStockProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/products/${product.id}`}
                        className="hover:underline"
                      >
                        {product.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-right font-bold text-destructive">
                      {product.stock_quantity}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={2}
                    className="text-center text-muted-foreground h-24"
                  >
                    {t("noLowStock")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
