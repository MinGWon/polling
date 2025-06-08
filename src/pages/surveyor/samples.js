import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import styles from "@/styles/Samples.module.css";

export default function Samples() {
  const [samples, setSamples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const router = useRouter();

  useEffect(() => {
    fetchSamples();
    
    // 시간 업데이트 인터벌
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timeInterval);
  }, []);

  const fetchSamples = async () => {
    try {
      const response = await fetch('/api/samples');
      const data = await response.json();
      setSamples(data);
    } catch (error) {
      console.error('Error fetching samples:', error);
    } finally {
      setLoading(false);
    }
  };

  const goToSurvey = () => {
    router.push('/surveyor/survey');
  };

  if (loading) return <div className={styles.loadingContainer}><div className={styles.spinner}></div><span>로딩 중...</span></div>;

  const totalCurrent = samples.reduce((acc, s) => acc + s.current, 0);
  const totalTarget = samples.reduce((acc, s) => acc + s.target, 0);
  const overallProgress = totalTarget > 0 ? Math.round((totalCurrent / totalTarget) * 100) : 0;
  const completedGroups = samples.filter(s => s.current >= s.target).length;

  const formatDate = (date) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric', 
      weekday: 'long' 
    };
    return date.toLocaleDateString('ko-KR', options);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('ko-KR', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // 아날로그 시계 계산
  const getClockRotation = (date) => {
    const hours = date.getHours() % 12;
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    
    return {
      hour: (hours * 30) + (minutes * 0.5), // 30도 * 시간 + 분에 따른 미세 조정
      minute: minutes * 6, // 6도 * 분
      second: seconds * 6  // 6도 * 초
    };
  };

  const clockRotation = getClockRotation(currentTime);

  return (
    <>
      <Head>
        <title>표본 현황 - 출구조사 시스템</title>
      </Head>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1>실시간 표본 현황</h1>
          <button onClick={goToSurvey} className={styles.surveyButton}>
            <i className="fas fa-clipboard-list"></i>
            출구조사 시작
          </button>
        </header>
        
        <div className={styles.dateTimeContainer}>
          <div className={styles.dateTimeInfo}>
            <div className={styles.dateDisplay}>
              <i className="fas fa-calendar-alt"></i>
              <span>{formatDate(currentTime)}</span>
            </div>
            <div className={styles.timeDisplay}>
              <i className="fas fa-clock"></i>
              <span>{formatTime(currentTime)}</span>
            </div>
          </div>
          <div className={styles.analogClock}>
            <div className={styles.clockFace}>
              {/* 시계 눈금 - 12, 3, 6, 9 위치 제외 */}
              {Array.from({ length: 12 }, (_, i) => {
                // 12시(0), 3시(3), 6시(6), 9시(9) 위치는 제외
                if (i === 0 || i === 3 || i === 6 || i === 9) return null;
                
                return (
                  <div
                    key={i}
                    className={styles.clockTick}
                    style={{
                      transform: `rotate(${i * 30}deg) translateY(-30px)`
                    }}
                  />
                );
              })}
              
              {/* 시계 숫자 */}
              {[12, 3, 6, 9].map((num, index) => (
                <div
                  key={num}
                  className={styles.clockNumber}
                  style={{
                    top: index === 0 ? '5px' : index === 1 ? '50%' : index === 2 ? 'calc(100% - 15px)' : '50%',
                    left: index === 0 ? '50%' : index === 1 ? 'calc(100% - 10px)' : index === 2 ? '50%' : '5px',
                    transform: index === 0 ? 'translateX(-50%)' : index === 1 ? 'translateY(-50%)' : index === 2 ? 'translateX(-50%)' : 'translateY(-50%)'
                  }}
                >
                  {num}
                </div>
              ))}
              
              {/* 시침 */}
              <div 
                className={styles.hourHand}
                style={{ transform: `rotate(${clockRotation.hour}deg)` }}
              />
              
              {/* 분침 */}
              <div 
                className={styles.minuteHand}
                style={{ transform: `rotate(${clockRotation.minute}deg)` }}
              />
              
              {/* 초침 */}
              <div 
                className={styles.secondHand}
                style={{ transform: `rotate(${clockRotation.second}deg)` }}
              />
              
              {/* 중심점 */}
              <div className={styles.clockCenter} />
            </div>
          </div>
        </div>
        
        <div className={styles.dashboard}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <i className="fas fa-chart-bar"></i>
            </div>
            <div className={styles.statContent}>
              <h3>전체 진행률</h3>
              <div className={styles.statValue}>{overallProgress}%</div>
              <div className={styles.statSubtext}>{totalCurrent} / {totalTarget}</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <i className="fas fa-check-circle"></i>
            </div>
            <div className={styles.statContent}>
              <h3>완료된 그룹</h3>
              <div className={styles.statValue}>{completedGroups}</div>
              <div className={styles.statSubtext}>{samples.length}개 그룹 중</div>
            </div>
          </div>
        </div>

        <main className={styles.main}>
          <div className={styles.grid}>
            {samples.map((sample) => {
              const percentage = Math.round((sample.current / sample.target) * 100);
              const isComplete = sample.current >= sample.target;
              const isNearComplete = percentage >= 80 && !isComplete;
              const isOverTarget = sample.current > sample.target;
              
              return (
                <div 
                  key={`${sample.grade}-${sample.gender}`} 
                  className={`${styles.card} ${isComplete ? styles.cardComplete : isNearComplete ? styles.cardWarning : ''}`}
                >
                  <div className={styles.cardHeader}>
                    <h3>{sample.grade}학년 {sample.gender}</h3>
                    <div className={`${styles.statusBadge} ${
                      isComplete ? styles.badgeComplete : 
                      isNearComplete ? styles.badgeWarning : 
                      styles.badgeProgress
                    }`}>
                      {isComplete ? (isOverTarget ? '초과완료' : '완료') : 
                       isNearComplete ? '거의완료' : '진행중'}
                    </div>
                  </div>
                  
                  <div className={styles.progress}>
                    <div className={styles.numbers}>
                      <span className={styles.current}>
                        <strong>{sample.current}</strong> <small>현재</small>
                      </span>
                      <span className={styles.target}>
                        <strong>{sample.target}</strong> <small>목표</small>
                      </span>
                    </div>
                    
                    <div className={styles.progressContainer}>
                      <div className={styles.bar}>
                        <div 
                          className={`${styles.fill} ${
                            isComplete ? styles.fillComplete : 
                            isNearComplete ? styles.fillWarning : 
                            styles.fillProgress
                          }`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        >
                          <div className={styles.fillShine}></div>
                        </div>
                      </div>
                      <div className={`${styles.percentage} ${isComplete ? styles.percentageComplete : ''}`}>
                        {percentage}%
                        {isComplete && <i className="fas fa-check" style={{marginLeft: '0.25rem', color: '#48bb78'}}></i>}
                      </div>
                    </div>
                    
                    {isOverTarget && (
                      <div className={styles.overTarget}>
                        <i className="fas fa-trophy" style={{marginRight: '0.5rem'}}></i>
                        목표 초과: +{sample.current - sample.target}명
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </>
  );
}
