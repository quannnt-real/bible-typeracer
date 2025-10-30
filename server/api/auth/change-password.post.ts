import { defineEventHandler, readBody } from 'h3'
import { getCurrentUser } from '../../utils/auth'
import { updateUserPassword } from '../../utils/users-db'

export default defineEventHandler(async (event) => {
  try {
    const user = await getCurrentUser(event)
    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    const body = await readBody(event)
    const { new_password } = body

    // Validation
    if (!new_password) {
      return { success: false, error: 'Vui lòng nhập mật khẩu mới' }
    }

    if (new_password.length < 6) {
      return { success: false, error: 'Mật khẩu mới phải có ít nhất 6 ký tự' }
    }

    // Change password (không cần mật khẩu cũ vì đã đăng nhập)
    await updateUserPassword(user.id, new_password)

    return { success: true, message: 'Đổi mật khẩu thành công' }
  } catch (error) {
    console.error('Error changing password:', error)
    return { success: false, error: 'Internal server error' }
  }
})
