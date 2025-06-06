import { connectDB } from '@/lib/db';

// Function to calculate confidence interval for proportion with finite population correction
function calculateConfidenceInterval(count, total, confidenceLevel = 0.90, populationSize = 308) {
  if (total === 0) return { lower: 0, upper: 0 };
  
  const proportion = count / total;
  const z = confidenceLevel === 0.90 ? 1.645 : 1.96; // 90% or 95% confidence
  
  // Finite population correction factor
  const fpc = Math.sqrt((populationSize - total) / (populationSize - 1));
  
  // Standard error with finite population correction
  const standardError = Math.sqrt((proportion * (1 - proportion)) / total) * fpc;
  const margin = z * standardError;
  
  return {
    lower: Math.max(0, Math.round((proportion - margin) * 100 * 10) / 10),
    upper: Math.min(100, Math.round((proportion + margin) * 100 * 10) / 10)
  };
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const db = await connectDB();
    
    // Get overall statistics
    const [overallResults] = await db.execute(`
      SELECT candidate, COUNT(*) as count
      FROM responses 
      GROUP BY candidate
      ORDER BY candidate
    `);
    
    const [totalCount] = await db.execute('SELECT COUNT(*) as total FROM responses');
    const total = totalCount[0].total;
    
    // Calculate overall statistics with confidence intervals (N=308)
    const overall = overallResults.map(result => {
      const percentage = total > 0 ? Math.round((result.count / total) * 100 * 10) / 10 : 0;
      const confidenceInterval = calculateConfidenceInterval(result.count, total, 0.90, 308);
      
      return {
        name: result.candidate,
        percentage,
        sampleSize: result.count,
        confidenceInterval
      };
    });
    
    // Get statistics by grade
    const [gradeResults] = await db.execute(`
      SELECT grade, candidate, COUNT(*) as count
      FROM responses 
      GROUP BY grade, candidate
      ORDER BY grade, candidate
    `);
    
    const [gradeTotals] = await db.execute(`
      SELECT grade, COUNT(*) as total
      FROM responses 
      GROUP BY grade
      ORDER BY grade
    `);
    
    // Get grade population sizes (assuming equal distribution: 308/3 ≈ 103 per grade)
    const gradePopulations = { 1: 103, 2: 103, 3: 102 }; // Total = 308
    
    // Process by grade statistics
    const byGrade = [];
    const gradeMap = new Map();
    
    // Initialize grade map
    gradeTotals.forEach(grade => {
      gradeMap.set(grade.grade, { total: grade.total, candidates: [] });
    });
    
    // Fill in candidate data for each grade
    gradeResults.forEach(result => {
      const gradeData = gradeMap.get(result.grade);
      if (gradeData) {
        const percentage = gradeData.total > 0 ? 
          Math.round((result.count / gradeData.total) * 100 * 10) / 10 : 0;
        const gradePopSize = gradePopulations[result.grade] || 103;
        const confidenceInterval = calculateConfidenceInterval(result.count, gradeData.total, 0.90, gradePopSize);
        
        gradeData.candidates.push({
          name: result.candidate,
          percentage,
          sampleSize: result.count,
          confidenceInterval
        });
      }
    });
    
    // Convert map to array
    gradeMap.forEach((value, key) => {
      byGrade.push({
        grade: key,
        total: value.total,
        candidates: value.candidates
      });
    });
    
    res.status(200).json({
      overall,
      byGrade,
      totalResponses: total,
      populationSize: 308,
      lastUpdated: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Statistics API error:', error);
    res.status(500).json({ message: '통계 조회 중 오류가 발생했습니다.' });
  }
}
