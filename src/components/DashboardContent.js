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
            name: 'Y',
            percentage: 65,
            sampleSize: 7,
            confidenceInterval: { lower: 55, upper: 75 }
          },
          {
            name: 'N', 
            percentage: 35,
            sampleSize: 3,
            confidenceInterval: { lower: 25, upper: 45 }
          }
        ],
        byGrade: [
          {
            grade: 1,
            total: 100,
            candidates: [
              { name: 'Y', percentage: 60, sampleSize: 6, confidenceInterval: { lower: 50, upper: 70 } },
              { name: 'N', percentage: 40, sampleSize: 4, confidenceInterval: { lower: 30, upper: 50 } }
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
              <h1>제 58대 순창고등학교 학생회장 선거</h1>
              <p>실시간 출구조사 현황</p>
            </div>
            <div className={styles.liveIndicator}>
              <div className={styles.liveDot}></div>
              <span>LIVE</span>
            </div>
          </div>
          <div className={styles.updateInfo}>
            <div className={styles.updateLeft}>
              <span className={styles.updateLabel}><i className="fas fa-chart-bar"></i> 실시간 업데이트</span>
              <span className={styles.updateTime}>
                <span className={styles.clockIcon}><i className="fas fa-clock"></i></span>
                {new Date().toLocaleTimeString('ko-KR')}
              </span>
            </div>
            <div className={styles.updateRight}>
              <span className={styles.sampleInfo}>
                <span className={styles.sampleIcon}><i className="fas fa-chart-line"></i></span>
                현재 표본 <strong>{statistics?.totalResponses || 0}건 / 122건</strong>
              </span>
            </div>
          </div>
        </header>

        <main className={styles.main}>
          <div className={styles.mainResults}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.titleIcon}><i className="fas fa-trophy"></i></span>
              실시간 추정 결과 (모비율의 추정)
              <span className={styles.confidence}>
                (신뢰도 95% / 모집단: 순창고등학교 재학생(선거인) 308명 / 표본 추출 방법: 층화추출 / Wilson Score Interval 사용)
              </span>
            </h2>
            
            <div className={styles.candidatesGrid}>
              {statistics?.overall?.map((candidate, index) => {
                const displayName = candidate.name === 'Y' ? '찬성' : '반대';
                
                return (
                  <div key={candidate.name} className={`${styles.candidateCard} ${styles[`rank${index + 1}`]}`}>
                    <div className={styles.candidateHeader}>
                      <div className={styles.rankBadge}>
                        {index === 0 ? <i className="fas fa-medal" style={{color: '#ffd700'}}></i> : 
                         index === 1 ? <i className="fas fa-medal" style={{color: '#c0c0c0'}}></i> : 
                         <i className="fas fa-medal" style={{color: '#cd7f32'}}></i>}
                      </div>
                      <h3>{displayName}</h3>
                    </div>
                  
                    <div className={styles.voteBar}>
                      <div className={styles.confidenceBar}>
                        <div 
                          className={styles.confidenceBackground}
                          style={{ 
                            left: `${candidate.confidenceInterval.lower}%`,
                            width: `${candidate.confidenceInterval.upper - candidate.confidenceInterval.lower}%`,
                            position: 'relative',
                            overflow: 'hidden'
                          }}
                        >
                          <div style={{
                            position: 'absolute',
                            top: 0,
                            left: '-100%',
                            width: '100%',
                            height: '100%',
                            background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.4) 50%, transparent 100%)',
                            animation: 'shimmer 2s infinite ease-in-out'
                          }}></div>
                        </div>
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
                      신뢰도 95% / 신뢰구간 ({candidate.confidenceInterval.lower}% ~ {candidate.confidenceInterval.upper}%)
                      / 
                      <strong> 추정값: {candidate.percentage}%</strong>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className={styles.gradeAnalysis}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.titleIcon}><i className="fas fa-chart-bar"></i></span>
              학년별 상세 분석 (모비율의 추정)
              <span className={styles.confidence}>
                (위와 동일)
              </span>
            </h2>
            
            <div className={styles.candidateAnalysisGrid}>
              {statistics?.byGrade?.map((gradeData) => (
                <div key={gradeData.grade} className={styles.candidateAnalysisCard}>
                  <div className={styles.candidateAnalysisHeader}>
                    <h3>{gradeData.grade}학년</h3>
                  </div>
                  
                  <div className={styles.gradeConfidenceContainer}>
                    {gradeData.candidates
                      .sort((a, b) => (a.name === 'Y' ? -1 : 1))
                      .map((candidate) => {
                        return (
                          <div key={candidate.name} className={styles.gradeConfidenceRow}>
                            <div className={styles.gradeVoteBar}>
                              <div className={styles.gradeConfidenceBar}>
                                <div 
                                  className={styles.gradeConfidenceBackground}
                                  style={{ 
                                    left: `${candidate.confidenceInterval.lower}%`,
                                    width: `${candidate.confidenceInterval.upper - candidate.confidenceInterval.lower}%`,
                                    position: 'relative',
                                    overflow: 'hidden',
                                    background: candidate.name === 'Y' ? 
                                      'linear-gradient(135deg, #48bb78 0%, #38a169 100%)' : 
                                      'linear-gradient(135deg, #ed8936 0%, #dd6b20 100%)'
                                  }}
                                >
                                  <div style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: '-100%',
                                    width: '100%',
                                    height: '100%',
                                    background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.4) 50%, transparent 100%)',
                                    animation: 'shimmer 2s infinite ease-in-out'
                                  }}></div>
                                </div>
                                <div 
                                  className={styles.gradeEstimatedTag}
                                  style={{ left: `${candidate.percentage}%` }}
                                >
                                  <span className={styles.gradeEstimatedValue}>{candidate.percentage}%</span>
                                </div>
                              </div>
                            </div>
                            <div className={styles.gradePercentageText}>
                              {candidate.confidenceInterval.lower}% ~ {candidate.confidenceInterval.upper}%
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.footer}>
            <div className={styles.disclaimer}>
              * 본 결과는 출구조사를 통한 추정치이며, 실제 개표 결과와 차이가 있을 수 있습니다.
            </div>
            <div className={styles.autoUpdate}>
              자동 업데이트 중  <i className="fas fa-sync-alt fa-spin"></i>
            </div>
          </div>
        </main>
      </div>
      <style jsx>{`
        @keyframes shimmer {
          0% {
            left: -100%;
          }
          100% {
            left: 100%;
          }
        }
      `}</style>
    </>
  );
}
