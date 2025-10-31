import { deleteUserProgressBySelection } from '~/server/utils/user-progress-db'
import { getCurrentUser } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  console.log('🔍 [COMPLETE API] Called with event:', event.context.user?.id)
  
  try {
    // Kiểm tra authentication - dùng getCurrentUser như các API khác
    const user = await getCurrentUser(event);
    if (!user) {
      console.log('❌ [COMPLETE API] No user found')
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized'
      })
    }

    const body = await readBody(event)
    console.log('📝 [COMPLETE API] Body:', body)
    const { bookId, chapter, verseStart, verseEnd } = body

    if (!bookId || !chapter) {
      console.log('❌ [COMPLETE API] Missing bookId or chapter')
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields: bookId, chapter'
      })
    }

    console.log('🗑️ [COMPLETE API] Deleting progress for user:', user.id, 'book:', bookId, 'chapter:', chapter, 'verses:', verseStart, '-', verseEnd)
    
    // Xóa progress tương ứng với selection đã hoàn thành
    await deleteUserProgressBySelection(
      user.id,
      bookId,
      chapter,
      verseStart || 1,
      verseEnd || 1
    )

    console.log('✅ [COMPLETE API] Progress deleted successfully')
    return {
      success: true,
      message: 'Progress cleared after completion'
    }
  } catch (error: any) {
    console.error('❌ [COMPLETE API] Error:', error)
    throw createError({
      statusCode: error?.statusCode || 500,
      statusMessage: error?.statusMessage || 'Internal server error'
    })
  }
})