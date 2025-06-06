import { connectDB } from '@/lib/db';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const db = await connectDB();
    
    // Check if response exists
    const [existing] = await db.execute(
      'SELECT id FROM responses WHERE id = ?',
      [id]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({ message: '응답을 찾을 수 없습니다.' });
    }
    
    // Delete the response
    await db.execute('DELETE FROM responses WHERE id = ?', [id]);
    
    res.status(200).json({ 
      success: true, 
      message: '응답이 삭제되었습니다.' 
    });
    
  } catch (error) {
    console.error('Delete response error:', error);
    res.status(500).json({ message: '삭제 중 오류가 발생했습니다.' });
  }
}
