import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import styles from "@/styles/Samples.module.css";

export default function Samples() {
  const [samples, setSamples] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchSamples();
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

  if (loading) return <div>로딩 중...</div>;

  return (
    <>
      <Head>
        <title>표본 현황 - 출구조사 시스템</title>
      </Head>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1>실시간 표본 현황</h1>
          <button onClick={goToSurvey} className={styles.surveyButton}>
            출구조사 시작
          </button>
        </header>
        <main className={styles.main}>
          <div className={styles.grid}>
            {samples.map((sample) => (
              <div key={`${sample.grade}-${sample.gender}`} className={styles.card}>
                <h3>{sample.grade}학년 {sample.gender}</h3>
                <div className={styles.progress}>
                  <div className={styles.numbers}>
                    <span>현재: {sample.current}</span>
                    <span>목표: {sample.target}</span>
                  </div>
                  <div className={styles.bar}>
                    <div 
                      className={styles.fill}
                      style={{ width: `${(sample.current / sample.target) * 100}%` }}
                    ></div>
                  </div>
                  <div className={styles.percentage}>
                    {Math.round((sample.current / sample.target) * 100)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </>
  );
}
