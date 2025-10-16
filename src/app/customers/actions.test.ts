// ไฟล์ทดสอบสำหรับ Actions ของลูกค้า (Customers)
// Test file for Customer Actions
// ทดสอบการเพิ่มและแก้ไขข้อมูลลูกค้า
// Tests adding and updating customer data
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { addCustomer, updateCustomer } from './actions'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

// จำลอง (Mock) dependencies ที่จำเป็น
// Mock necessary dependencies
vi.mock('@/lib/supabase/server')
vi.mock('next/navigation')
vi.mock('next/cache')

// ชุดทดสอบสำหรับ Actions ของลูกค้า
// Test suite for Customer Actions
describe('Customer Actions', () => {
  // สร้าง Mock Supabase Client สำหรับการทดสอบ
  // Create Mock Supabase Client for testing
  const mockSupabase = {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(() => ({
      insert: vi.fn().mockResolvedValue({ error: null }),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: null }),
    })),
  }

  // ก่อนแต่ละ test ให้ล้าง mock ทั้งหมด
  // Clear all mocks before each test
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)
  })

  // ทดสอบการเพิ่มลูกค้าใหม่
  // Test adding new customers
  describe('addCustomer', () => {
    // ทดสอบ: ต้อง redirect ไปหน้า login ถ้าผู้ใช้ยังไม่ได้ล็อกอิน
    // Test: Should redirect to login if user is not authenticated
    it('redirects to login if user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const formData = new FormData()
      formData.append('name', 'Test Customer')

      await addCustomer(formData)

      expect(redirect).toHaveBeenCalledWith('/login')
    })

    // ทดสอบ: เพิ่มลูกค้าใหม่สำเร็จและ redirect
    // Test: Successfully adds a customer and redirects
    it('successfully adds a customer and redirects', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
        error: null,
      })

      const formData = new FormData()
      formData.append('name', 'Test Customer')
      formData.append('taxId', '1234567890123')
      formData.append('address', '123 Test St')
      formData.append('phone', '0812345678')
      formData.append('lineId', 'test-line')
      formData.append('responsiblePerson', 'John Doe')

      await addCustomer(formData)

      expect(mockSupabase.from).toHaveBeenCalledWith('customers')
      expect(revalidatePath).toHaveBeenCalledWith('/customers')
      expect(redirect).toHaveBeenCalledWith('/customers')
    })

    // ทดสอบ: จัดการ error เมื่อเพิ่มลูกค้าล้มเหลว
    // Test: Handles errors when adding customer fails
    it('handles errors when adding customer fails', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
        error: null,
      })

      const insertMock = vi.fn().mockResolvedValue({
        error: { message: 'Database error' },
      })

      mockSupabase.from = vi.fn(() => ({
        insert: insertMock,
      })) as any

      const formData = new FormData()
      formData.append('name', 'Test Customer')

      await addCustomer(formData)

      expect(redirect).toHaveBeenCalledWith(
        '/customers?message=Error: Could not add customer.'
      )
    })
  })

  // ทดสอบการแก้ไขข้อมูลลูกค้า
  // Test updating customer data
  describe('updateCustomer', () => {
    // ทดสอบ: ต้อง redirect ไปหน้า login ถ้าผู้ใช้ยังไม่ได้ล็อกอิน
    // Test: Should redirect to login if user is not authenticated
    it('redirects to login if user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const formData = new FormData()
      await updateCustomer(1, formData)

      expect(redirect).toHaveBeenCalledWith('/login?message=Authentication required')
    })

    // ทดสอบ: แก้ไขข้อมูลลูกค้าสำเร็จ
    // Test: Successfully updates a customer
    it('successfully updates a customer', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
        error: null,
      })

      const updateMock = vi.fn().mockReturnThis()
      const eqMock = vi.fn().mockResolvedValue({ error: null })

      mockSupabase.from = vi.fn(() => ({
        update: updateMock,
        eq: eqMock,
      })) as any

      const formData = new FormData()
      formData.append('name', 'Updated Customer')
      formData.append('taxId', '1234567890123')

      await updateCustomer(1, formData)

      expect(mockSupabase.from).toHaveBeenCalledWith('customers')
      expect(updateMock).toHaveBeenCalled()
      expect(eqMock).toHaveBeenCalledWith('id', 1)
    })
  })
})
