import { defineEventHandler, readBody } from 'h3'
import { getCurrentUser } from '../../utils/auth'
import { updateUserProfile } from '../../utils/users-db'

export default defineEventHandler(async (event) => {
  try {
    const user = await getCurrentUser(event)
    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    const body = await readBody(event)
    const { display_name, avatar_url, color } = body

    // Validation
    if (display_name && display_name.trim().length === 0) {
      return { success: false, error: 'Tên hiển thị không được để trống' }
    }

    if (color && !/^#[0-9A-Fa-f]{6}$/.test(color)) {
      return { success: false, error: 'Màu không hợp lệ (phải là hex color như #3B82F6)' }
    }

    // Update profile
    const updated = await updateUserProfile(user.id, {
      display_name: display_name?.trim(),
      avatar_url: avatar_url?.trim(),
      color: color?.trim()
    })

    if (!updated) {
      return { success: false, error: 'Không thể cập nhật thông tin' }
    }

    return { success: true, user: updated }
  } catch (error) {
    console.error('Error updating profile:', error)
    return { success: false, error: 'Internal server error' }
  }
})
