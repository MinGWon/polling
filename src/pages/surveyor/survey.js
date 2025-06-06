import Head from "next/head";
import { useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import styles from "@/styles/Survey.module.css";
import Swal from 'sweetalert2';

export default function Survey() {
  const [formData, setFormData] = useState({
    grade: '',
    gender: '',
    candidate: ''
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await Swal.fire({
          title: '응답 완료!',
          text: '출구조사 응답이 성공적으로 저장되었습니다.',
          icon: 'success',
          confirmButtonText: '확인',
          confirmButtonColor: '#667eea',
          timer: 2000,
          timerProgressBar: true
        });
        setFormData({ grade: '', gender: '', candidate: '' });
      } else {
        await Swal.fire({
          title: '저장 실패',
          text: '응답 저장 중 오류가 발생했습니다.',
          icon: 'error',
          confirmButtonText: '확인',
          confirmButtonColor: '#e53e3e'
        });
      }
    } catch (error) {
      await Swal.fire({
        title: '연결 오류',
        text: '서버와의 연결에 문제가 발생했습니다.',
        icon: 'error',
        confirmButtonText: '확인',
        confirmButtonColor: '#e53e3e'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>출구조사 - 출구조사 시스템</title>
      </Head>
      <div className={styles.container}>
        <main className={styles.main}>
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.titleSection}>
              <p className={styles.electionTitle}>제 51대 순창고등학교 학생회장 선거</p>
              <h1 className={styles.title}>출구조사 설문지</h1>
            </div>
            <div className={styles.field}>
              <label>학년</label>
              <div className={styles.buttonGroup}>
                {['1', '2', '3'].map((grade) => (
                  <button
                    key={grade}
                    type="button"
                    className={`${styles.optionButton} ${
                      formData.grade === grade ? styles.selected : ''
                    }`}
                    onClick={() => setFormData({...formData, grade})}
                  >
                    {grade}학년
                  </button>
                ))}
              </div>
            </div>
            <div className={styles.field}>
              <label>성별</label>
              <div className={styles.buttonGroup}>
                <button
                  type="button"
                  className={`${styles.optionButton} ${
                    formData.gender === 'male' ? styles.selected : ''
                  }`}
                  onClick={() => setFormData({...formData, gender: 'male'})}
                >
                  남성
                </button>
                <button
                  type="button"
                  className={`${styles.optionButton} ${
                    formData.gender === 'female' ? styles.selected : ''
                  }`}
                  onClick={() => setFormData({...formData, gender: 'female'})}
                >
                  여성
                </button>
              </div>
            </div>
            <div className={styles.field}>
              <label>투표한 후보</label>
              <div className={styles.ballotTable}>
                {['A', 'B', 'C'].map((candidate) => (
                  <div
                    key={candidate}
                    className={`${styles.ballotRow} ${
                      formData.candidate === candidate ? styles.stamped : ''
                    }`}
                    onClick={() => setFormData({...formData, candidate})}
                  >
                    <div className={styles.candidateInfo}>
                      <span className={styles.candidateNumber}>{candidate}</span>
                      <span className={styles.candidateName}>후보 {candidate}</span>
                    </div>
                    <div className={styles.stampArea}>
                      {formData.candidate === candidate && (
                        <div className={styles.stamp}>
                          <Image
                            src="/stamp.png"
                            alt="투표 도장"
                            width={60}
                            height={60}
                            className={styles.stampImage}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <button 
              type="submit" 
              disabled={loading || !formData.grade || !formData.gender || !formData.candidate}
              className={styles.submitButton}
            >
              {loading ? '저장 중...' : '응답 저장'}
            </button>
          </form>
        </main>
      </div>
    </>
  );
}
