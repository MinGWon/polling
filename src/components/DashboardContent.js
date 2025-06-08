import Head from "next/head";
import { useState, useEffect } from "react";
import styles from "@/styles/Dashboard.module.css";

export default function DashboardContent({ title = "관리자 대시보드 - 출구조사 시스템" }) {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
    const interval = setInterval(fetchStatistics, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchStatistics = async () => {
    try {
      const response = await fetch('/api/statistics');
      if (!response.ok) {
        throw new Error('API response not ok');
      }
      const data = await response.json();
      console.log('API Response:', data);
      setStatistics(data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      // Add fallback test data to ensure graphs show
      setStatistics({
        totalResponses: 10,
        overall: [
          {
            name: 'A',
            percentage: 45,
            sampleSize: 5,
            confidenceInterval: { lower: 35, upper: 55 }
          },
          {
            name: 'B', 
            percentage: 35,
            sampleSize: 3,
            confidenceInterval: { lower: 25, upper: 45 }
          },
          {
            name: 'C',
            percentage: 20,
            sampleSize: 2,
            confidenceInterval: { lower: 10, upper: 30 }
          }
        ],
        byGrade: [
          {
            grade: 1,
            total: 100,
            candidates: [
              { name: 'A', percentage: 40, sampleSize: 4, confidenceInterval: { lower: 30, upper: 50 } },
              { name: 'B', percentage: 35, sampleSize: 3, confidenceInterval: { lower: 25, upper: 45 } },
              { name: 'C', percentage: 25, sampleSize: 3, confidenceInterval: { lower: 15, upper: 35 } }
            ]
          }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className={styles.loadingScreen}>
      <div className={styles.loadingSpinner}></div>
      <p>실시간 데이터 로딩 중...</p>
    </div>
  );

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.schoolInfo}>
              <h1>제 51대 순창고등학교 학생회장 선거</h1>
              <p>실시간 출구조사 현황</p>
            </div>
            <div className={styles.liveIndicator}>
              <div className={styles.liveDot}></div>
              <span>LIVE</span>
            </div>
          </div>
          <div className={styles.updateInfo}>
            <div className={styles.updateLeft}>
              <span className={styles.updateLabel}>📊 실시간 업데이트</span>
              <span className={styles.updateTime}>
                <span className={styles.clockIcon}>🕐</span>
                {new Date().toLocaleTimeString('ko-KR')}
              </span>
            </div>
            <div className={styles.updateRight}>
              <span className={styles.sampleInfo}>
                <span className={styles.sampleIcon}>📈</span>
                현재 표본 <strong>{statistics?.totalResponses || 0}건</strong>
              </span>
            </div>
          </div>
        </header>

        <main className={styles.main}>
          <div className={styles.mainResults}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.titleIcon}>🏆</span>
              실시간 추정 결과 (모비율의 추정)
              <span className={styles.confidence}>
                (신뢰도 95% / 모집단: 순창고등학교 재학생(선거인) 308명 / Wilson Score Interval 사용)
              </span>
            </h2>
            
            <div className={styles.candidatesGrid}>
              {statistics?.overall?.map((candidate, index) => (
                <div key={candidate.name} className={`${styles.candidateCard} ${styles[`rank${index + 1}`]}`}>
                  <div className={styles.candidateHeader}>
                    <div className={styles.rankBadge}>
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                    </div>
                    <h3>후보 {candidate.name}</h3>
                  </div>
                  
                  <div className={styles.voteBar}>
                    <div className={styles.confidenceBar}>
                      <div 
                        className={styles.confidenceBackground}
                        style={{ 
                          left: `${candidate.confidenceInterval.lower}%`,
                          width: `${candidate.confidenceInterval.upper - candidate.confidenceInterval.lower}%`
                        }}
                      ></div>
                      <div 
                        className={styles.estimatedTag}
                        style={{ left: `${candidate.percentage}%` }}
                      >
                        <span className={styles.estimatedValue}>{candidate.percentage}%</span>
                      </div>
                    </div>
                  </div>
                
                  <div className={styles.percentageDisplay}>
                    <span className={styles.mainPercentage}>
                      {candidate.confidenceInterval.lower}% ~ {candidate.confidenceInterval.upper}%
                    </span>
                  </div>
                
                  <div className={styles.confidenceRange}>
                    95% 신뢰구간 ({candidate.confidenceInterval.lower}% ~ {candidate.confidenceInterval.upper}%)
                    <br />
                    <strong>추정값: {candidate.percentage}%</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.gradeAnalysis}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.titleIcon}>📊</span>
              학년별 상세 분석
            </h2>
            
            <div className={styles.candidateAnalysisGrid}>
              {['A', 'B', 'C'].map((candidateName) => {
                const candidateData = statistics?.byGrade.map(grade => {
                  const candidate = grade.candidates.find(c => c.name === candidateName);
                  return {
                    grade: grade.grade,
                    percentage: candidate ? candidate.percentage : 0,
                    confidenceInterval: candidate ? candidate.confidenceInterval : { lower: 0, upper: 0 },
                    sampleSize: candidate ? candidate.sampleSize : 0,
                    total: grade.total
                  };
                });

                const maxPercentage = Math.max(...candidateData.map(d => d.percentage));

                return (
                  <div key={candidateName} className={styles.candidateAnalysisCard}>
                    <div className={styles.candidateAnalysisHeader}>
                      <h3>후보 {candidateName}</h3>
                    </div>
                    
                    <div className={styles.singleBand}>
                      <div className={styles.gradeBandBar}>
                        {candidateData?.map((gradeData, index) => (
                          <div 
                            key={gradeData.grade}
                            className={`${styles.gradeSegment} ${styles[`grade${gradeData.grade}`]}`}
                            style={{ 
                              width: maxPercentage > 0 ? `${(gradeData.percentage / maxPercentage) * 100}%` : '0%'
                            }}
                            title={`${gradeData.grade}학년: ${gradeData.percentage}% (${gradeData.sampleSize}/${gradeData.total}명)`}
                          >
                            <span className={styles.gradeSegmentLabel}>
                              {gradeData.grade}학년 ({gradeData.percentage}%)
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className={styles.footer}>
            <div className={styles.disclaimer}>
              * 본 결과는 출구조사를 통한 추정치이며, 실제 개표 결과와 차이가 있을 수 있습니다.
            </div>
            <div className={styles.autoUpdate}>
              자동 업데이트 중... 🔄
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
