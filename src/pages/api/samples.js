import { connectDB } from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const db = await connectDB();
    
    // Get target counts for each grade/gender combination
    const [targets] = await db.execute(`
      SELECT grade, gender, target_count
      FROM sample_targets
      ORDER BY grade, gender
    `);
    
    // Get current response counts for each grade/gender combination
    const [current] = await db.execute(`
      SELECT grade, gender, COUNT(*) as current_count
      FROM responses
      GROUP BY grade, gender
      ORDER BY grade, gender
    `);
    
    // Create a map for current counts
    const currentMap = new Map();
    current.forEach(item => {
      const key = `${item.grade}-${item.gender}`;
      currentMap.set(key, item.current_count);
    });
    
    // Combine target and current data
    const samples = targets.map(target => {
      const key = `${target.grade}-${target.gender}`;
      const currentCount = currentMap.get(key) || 0;
      
      return {
        grade: target.grade,
        gender: target.gender === 'male' ? '남성' : '여성',
        target: target.target_count,
        current: currentCount,
        percentage: target.target_count > 0 ? 
          Math.round((currentCount / target.target_count) * 100) : 0,
        status: currentCount >= target.target_count ? 'complete' : 
                currentCount >= target.target_count * 0.8 ? 'warning' : 'progress'
      };
    });
    
    res.status(200).json(samples);
    
  } catch (error) {
    console.error('Samples API error:', error);
    res.status(500).json({ message: '표본 현황 조회 중 오류가 발생했습니다.' });
  }
}
