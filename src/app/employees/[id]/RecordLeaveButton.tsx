/**
 * RecordLeaveButton Component - ปุ่มบันทึกการลาของพนักงาน
 *
 * คอมโพเนนต์สำหรับบันทึกการลาของพนักงานและหักลบวันลาคงเหลือโดยอัตโนมัติ
 *
 * @param employeeId - รหัสพนักงานที่ต้องการบันทึกการลา
 * @param leaveBalances - รายการประเภทการลาและยอดคงเหลือของพนักงาน
 *
 * คุณสมบัติ:
 * - เลือกประเภทการลา (ลาป่วย, ลากิจ, ลาพักร้อน ฯลฯ)
 * - ระบุจำนวนวันที่ลา (รองรับ 0.5 วัน สำหรับลาครึ่งวัน)
 * - เลือกวันที่ลา
 * - ระบุเหตุผลการลา (ถ้ามี)
 * - หักลบยอดวันลาคงเหลือโดยอัตโนมัติ
 *
 * การทำงาน:
 * 1. แสดง Dialog form สำหรับกรอกข้อมูลการลา
 * 2. ตรวจสอบความถูกต้องของข้อมูล
 * 3. บันทึกข้อมูลและหักยอดวันลาคงเหลือ
 * 4. แสดงผลสำเร็จและปิด Dialog
 */
"use client"

import { useState, useTransition } from "react"
import { recordLeave } from "../actions"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, BookUser } from "lucide-react"

type LeaveBalance = {
  id: number
  leave_types: {
    id: number
    name: string
  } | null
}

interface Props {
  employeeId: number
  leaveBalances: LeaveBalance[]
}

export default function RecordLeaveButton({
  employeeId,
  leaveBalances,
}: Props) {
  // State สำหรับจัดการการเปิด/ปิด Dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  // State สำหรับเก็บข้อมูลฟอร์ม
  const [selectedLeaveTypeId, setSelectedLeaveTypeId] = useState<string>("")
  const [daysTaken, setDaysTaken] = useState<string>("")
  const [leaveDate, setLeaveDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  )
  const [reason, setReason] = useState<string>("")

  /**
   * ฟังก์ชันรีเซ็ตฟอร์มกลับสู่ค่าเริ่มต้น
   * เรียกใช้เมื่อปิด Dialog หรือหลังบันทึกสำเร็จ
   */
  const resetForm = () => {
    setSelectedLeaveTypeId("")
    setDaysTaken("")
    setLeaveDate(new Date().toISOString().split("T")[0])
    setReason("")
  }

  /**
   * ฟังก์ชันจัดการการ submit ฟอร์มบันทึกการลา
   *
   * ขั้นตอนการทำงาน:
   * 1. ตรวจสอบความถูกต้องของข้อมูลทุกฟิลด์
   * 2. สร้าง FormData และเพิ่มข้อมูลทั้งหมด
   * 3. เรียกใช้ Server Action recordLeave
   * 4. หักลบยอดวันลาคงเหลือโดยอัตโนมัติ
   * 5. แสดงผลสำเร็จหรือ error
   */
  const handleSubmit = () => {
    // ตรวจสอบว่าได้เลือกประเภทการลาแล้ว
    if (!selectedLeaveTypeId) {
      alert("กรุณาเลือกประเภทการลา")
      return
    }
    // ตรวจสอบจำนวนวันที่ลา (ต้องมากกว่า 0)
    if (!daysTaken || Number(daysTaken) <= 0) {
      alert("กรุณากรอกจำนวนวันที่ลาให้ถูกต้อง (ต้องมากกว่า 0)")
      return
    }
    // ตรวจสอบว่าได้เลือกวันที่ลาแล้ว
    if (!leaveDate) {
      alert("กรุณาเลือกวันที่ลา")
      return
    }

    // สร้าง FormData เพื่อส่งไปยัง Server Action
    const formData = new FormData()
    formData.append("employeeId", String(employeeId))
    formData.append("leaveTypeId", selectedLeaveTypeId)
    formData.append("daysTaken", daysTaken)
    formData.append("leaveDate", leaveDate)
    formData.append("reason", reason)

    startTransition(async () => {
      const result = await recordLeave(formData)
      if (result.success) {
        alert("บันทึกการลาสำเร็จ!")
        resetForm()
        setIsDialogOpen(false)
      } else {
        alert(`เกิดข้อผิดพลาด: ${result.error}`)
      }
    })
  }

  // กรองเฉพาะ leave balance ที่มีข้อมูล leave_types ครบถ้วน
  const validLeaveBalances = leaveBalances.filter(
    (balance) => balance.leave_types !== null
  )

  // Debug logs สำหรับตรวจสอบข้อมูล
  console.log("validLeaveBalances:", validLeaveBalances)
  console.log("selectedLeaveTypeId:", selectedLeaveTypeId)
  console.log("employeeId:", employeeId)
  console.log("daysTaken:", daysTaken)
  console.log("leaveDate:", leaveDate)

  return (
    <Dialog
      open={isDialogOpen}
      onOpenChange={(open) => {
        if (!open) resetForm()
        setIsDialogOpen(open)
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">
          <BookUser className="mr-2 h-4 w-4" />
          บันทึกการลา
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <div>
          <DialogHeader>
            <DialogTitle>บันทึกการลา</DialogTitle>
            <DialogDescription>
              บันทึกการลาเพื่อหักลบยอดวันลาคงเหลือโดยอัตโนมัติ
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>ประเภทการลา</Label>

              <RadioGroup
                required
                value={selectedLeaveTypeId}
                onValueChange={(value) => {
                  console.log("RadioGroup onValueChange called with:", value)
                  setSelectedLeaveTypeId(value)
                }}
                className="flex flex-col space-y-1"
                name="leaveTypeId"
              >
                {validLeaveBalances.map((balance) => {
                  const balanceId = String(balance.id) // Use balance.id instead
                  console.log(
                    `Rendering radio for balance ${balance.id}, balanceId: ${balanceId}`
                  )
                  return (
                    <div
                      key={`balance-${balance.id}`}
                      className="flex items-center space-x-2"
                    >
                      <RadioGroupItem
                        value={balanceId}
                        id={`leave_type_${balance.id}`}
                      />
                      <Label htmlFor={`leave_type_${balance.id}`}>
                        {balance.leave_types!.name}
                      </Label>
                    </div>
                  )
                })}
              </RadioGroup>

              {/* <RadioGroup
                required
                value={selectedLeaveTypeId}
                onValueChange={setSelectedLeaveTypeId}
                className="flex flex-col space-y-1"
              >
                {leaveBalances.map((balance) => (
                  <Label
                    key={balance.id}
                    htmlFor={`leave_type_${balance.id}`}
                    className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent cursor-pointer"
                  >
                    <RadioGroupItem
                      value={String(balance.leave_types?.id)}
                      id={`leave_type_${balance.id}`}
                    />
                    <span>{balance.leave_types?.name}</span>
                  </Label>
                ))}
              </RadioGroup> */}
            </div>
            <div className="space-y-1">
              <Label htmlFor="daysTaken">จำนวนวันที่ลา</Label>
              <Input
                id="daysTaken"
                name="daysTaken"
                type="number"
                step="0.5"
                placeholder="เช่น 1 หรือ 0.5"
                required
                value={daysTaken}
                onChange={(e) => setDaysTaken(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="leaveDate">วันที่ลา</Label>
              <Input
                id="leaveDate"
                name="leaveDate"
                type="date"
                required
                value={leaveDate}
                onChange={(e) => setLeaveDate(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="reason">เหตุผล (ถ้ามี)</Label>
              <Textarea
                id="reason"
                name="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsDialogOpen(false)}
            >
              ยกเลิก
            </Button>
            <Button type="button" onClick={handleSubmit} disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              บันทึก
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
