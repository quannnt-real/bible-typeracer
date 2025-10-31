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
    const { display_name, avatar_url, car } = body

    // Validation
    if (display_name && display_name.trim().length === 0) {
      return { success: false, error: 'Tên hiển thị không được để trống' }
    }

    // Validate car selection (must be one of the available cars)
    const availableCars = [
      'biteracer.svg', 'candycane_free.svg', 'candycorn_free.svg', 'car-icon.svg',
      'fall_2023_acorn-free.svg', 'fall_2023_fallcar-free.svg', 'fall_2023_falltruck-free.svg',
      'free-rocketship.svg', 'lunar-basic-design-free.svg', 'lunar-basic-tiger-free.svg',
      'lunar-drag-gold.svg', 'lunar-drag-red.svg', 'lunar-drag-tiger.svg',
      'mindracerEmoji-free.svg', 'penguins-typingstats_free.svg', 'premium-drag-blue.svg',
      'premium-drag-fire.svg', 'premium-drag-green.svg', 'premium-drag-pink.svg',
      'premium-drag-red.svg', 'premium-drag-water.svg', 'premium-earth.svg',
      'premium-fire.svg', 'spring-flowers2-free.svg'
    ]

    if (car && !availableCars.includes(car)) {
      return { success: false, error: 'Xe không hợp lệ' }
    }

    // Update profile
    const updated = await updateUserProfile(user.id, {
      display_name: display_name?.trim(),
      avatar_url: avatar_url?.trim(),
      car: car?.trim()
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
