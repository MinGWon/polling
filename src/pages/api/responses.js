import { connectDB } from '@/lib/db';

export default async function handler(req, res) {
  try {
    const db = await connectDB();

    if (req.method === 'GET') {
      // Fetch all responses
      const [responses] = await db.execute(`
        SELECT r.*, u.username as surveyor_name
        FROM responses r
        LEFT JOIN users u ON r.surveyor_id = u.id
        ORDER BY r.created_at DESC
      `);
      
      res.status(200).json(responses);
      
    } else if (req.method === 'POST') {
      // Create new response
      const { grade, gender, middleSchool, candidate } = req.body;
      
      if (!grade || !gender || !middleSchool || !candidate) {
        return res.status(400).json({ message: '모든 필드를 입력해주세요.' });
      }
      
      const [result] = await db.execute(
        'INSERT INTO responses (grade, gender, school, candidate, surveyor_id) VALUES (?, ?, ?, ?, ?)',
        [grade, gender, middleSchool, candidate, 1] // Default surveyor_id for now
      );
      
      res.status(201).json({ 
        success: true, 
        id: result.insertId,
        message: '응답이 저장되었습니다.' 
      });
      
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
    
  } catch (error) {
    console.error('Responses API error:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
}
