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
      const data = await response.json();
      setStatistics(data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
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
        <meta name="viewport" content="width=device-width, initial-scale=1" />
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
              {statistics?.overall.map((candidate, index) => (
                <div key={candidate.name} className={`${styles.candidateCard} ${styles[`rank${index + 1}`]}`}>
                  <div className={styles.candidateHeader}>
                    <div className={styles.rankBadge}>
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                    </div>
                    <h3>후보 {candidate.name}</h3>
                  </div>
                  
                  <div className={styles.voteBar}>
                    <div className={styles.confidenceRange}>
                      <div 
                        className={styles.confidenceBackground}
                        style={{ 
                          left: `${candidate.confidenceInterval.lower}%`,
                          width: `${candidate.confidenceInterval.upper - candidate.confidenceInterval.lower}%`
                        }}
                      ></div>
                      <div 
                        className={styles.estimatedValue}
                        style={{ left: `${candidate.percentage}%` }}
                        data-percentage={`${candidate.percentage}%`}
                      ></div>
                    </div>
                  </div>
                  
                  <div className={styles.percentageDisplay}>
                    <span className={styles.mainPercentage}>
                      {candidate.confidenceInterval.lower}% ~ {candidate.confidenceInterval.upper}%
                    </span>
                    <span className={styles.voteCount}>{candidate.sampleSize}표</span>
                  </div>
                  
                  <div className={styles.confidenceRange}>
                    추정값: {candidate.percentage}% 
                    (95% 신뢰구간: {candidate.confidenceInterval.lower}% ~ {candidate.confidenceInterval.upper}%)
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
                              {gradeData.grade}학년
                            </span>
                          </div>
                        ))}
                      </div>
                      
                      <div className={styles.gradeLegend}>
                        {candidateData?.map((gradeData) => (
                          <div key={gradeData.grade} className={styles.legendItem}>
                            <div className={`${styles.legendColor} ${styles[`grade${gradeData.grade}`]}`}></div>
                            <span>
                              {gradeData.grade}학년: {gradeData.confidenceInterval.lower}% ~ {gradeData.confidenceInterval.upper}%
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
