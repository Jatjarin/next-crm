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
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select"
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
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const [selectedLeaveTypeId, setSelectedLeaveTypeId] = useState<string>("")
  const [daysTaken, setDaysTaken] = useState<string>("")
  const [leaveDate, setLeaveDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  )
  const [reason, setReason] = useState<string>("")

  const resetForm = () => {
    setSelectedLeaveTypeId("")
    setDaysTaken("")
    setLeaveDate(new Date().toISOString().split("T")[0])
    setReason("")
  }

  const handleSubmit = () => {
    // 2. ตรวจสอบข้อมูลจาก state
    if (!selectedLeaveTypeId) {
      alert("กรุณาเลือกประเภทการลา")
      return
    }
    if (!daysTaken || Number(daysTaken) <= 0) {
      alert("กรุณากรอกจำนวนวันที่ลาให้ถูกต้อง (ต้องมากกว่า 0)")
      return
    }
    if (!leaveDate) {
      alert("กรุณาเลือกวันที่ลา")
      return
    }

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

  // Filter out items with null leave_types to prevent issues
  const validLeaveBalances = leaveBalances.filter(
    (balance) => balance.leave_types !== null
  )

  // Debug: Log the data to console
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
