import { connectDB } from '@/lib/db';

// Wilson Score Interval for better confidence intervals
function calculateWilsonInterval(successes, total, confidenceLevel = 0.95, populationSize = 308) {
  if (total === 0) return { lower: 0, upper: 0 };
  
  const z = confidenceLevel === 0.95 ? 1.96 : 1.645;
  const p = successes / total;
  const n = total;
  
  // Wilson Score Interval calculation (without FPC first)
  const denominator = 1 + (z * z) / n;
  const centre = (p + (z * z) / (2 * n)) / denominator;
  const halfWidth = (z / denominator) * Math.sqrt((p * (1 - p) / n) + (z * z) / (4 * n * n));
  
  let lower = centre - halfWidth;
  let upper = centre + halfWidth;
  
  // Apply finite population correction to the margin of error
  if (populationSize && populationSize > n) {
    const fpc = Math.sqrt((populationSize - n) / (populationSize - 1));
    const originalMargin = halfWidth;
    const correctedMargin = originalMargin * fpc;
    
    lower = centre - correctedMargin;
    upper = centre + correctedMargin;
  }
  
  // Ensure bounds are within [0, 1]
  lower = Math.max(0, lower);
  upper = Math.min(1, upper);
  
  return {
    lower: Math.round(lower * 100 * 10) / 10,
    upper: Math.round(upper * 100 * 10) / 10
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
      WHERE candidate IN ('Y', 'N')
      GROUP BY candidate
      ORDER BY candidate DESC
    `);
    
    const [totalCount] = await db.execute('SELECT COUNT(*) as total FROM responses');
    const total = totalCount[0].total;
    
    // Calculate overall statistics with Wilson Score intervals
    const overall = overallResults.map(result => {
      const percentage = total > 0 ? Math.round((result.count / total) * 100 * 10) / 10 : 0;
      const confidenceInterval = calculateWilsonInterval(result.count, total, 0.95, 308);
      
      return {
        name: result.candidate,
        percentage,
        sampleSize: result.count,
        confidenceInterval
      };
    });
    
    // Ensure both Y and N are present in results
    const allOptions = ['Y', 'N'];
    const completeOverall = allOptions.map(option => {
      const existing = overall.find(item => item.name === option);
      if (existing) return existing;
      
      return {
        name: option,
        percentage: 0,
        sampleSize: 0,
        confidenceInterval: { lower: 0, upper: 0 }
      };
    });
    
    // Get statistics by grade
    const [gradeResults] = await db.execute(`
      SELECT grade, candidate, COUNT(*) as count
      FROM responses 
      WHERE candidate IN ('Y', 'N')
      GROUP BY grade, candidate
      ORDER BY grade, candidate DESC
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
        const confidenceInterval = calculateWilsonInterval(result.count, gradeData.total, 0.95, gradePopSize);
        
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
      overall: completeOverall,
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
