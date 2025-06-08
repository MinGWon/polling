import { connectDB } from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { grade, gender } = req.body;
    const db = await connectDB();

    // Get target sample size for this demographic
    const [targetResults] = await db.execute(
      'SELECT target_count FROM sample_targets WHERE grade = ? AND gender = ?',
      [parseInt(grade), gender]
    );

    if (targetResults.length === 0) {
      return res.status(404).json({ message: 'Target not found' });
    }

    const targetSize = targetResults[0].target_count;

    // Count current responses for this demographic
    const [countResults] = await db.execute(
      'SELECT COUNT(*) as count FROM responses WHERE grade = ? AND gender = ?',
      [grade, gender]
    );

    const currentCount = countResults[0].count;

    // Check if adding one more would exceed the target
    const wouldExceed = currentCount >= targetSize;

    res.status(200).json({
      exceeded: wouldExceed,
      current: currentCount,
      target: targetSize
    });
  } catch (error) {
    console.error('Error checking target:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
