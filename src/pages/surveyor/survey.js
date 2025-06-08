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
      // First check if target limit is exceeded
      const checkResponse = await fetch('/api/check-target', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grade: formData.grade,
          gender: formData.gender
        })
      });

      const checkData = await checkResponse.json();

      if (!checkResponse.ok || checkData.exceeded) {
        await Swal.fire({
          title: '목적 표본 수 초과',
          text: '목적 표본 수를 초과했습니다.',
          icon: 'warning',
          confirmButtonText: '확인',
          confirmButtonColor: '#f39c12'
        });
        setLoading(false);
        return;
      }

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
        <div className={styles.centerWrapper}>
          <main className={styles.main}>
            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.titleSection}>
                <p className={styles.electionTitle}>제 58대 순창고등학교 학생회장 선거</p>
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
                <label>투표 결과</label>
                <div className={styles.ballotTable}>
                  {[
                    { value: 'Y', label: '찬성', icon: 'fas fa-check' },
                    { value: 'N', label: '반대', icon: 'fas fa-times' }
                  ].map((option) => (
                    <div
                      key={option.value}
                      className={`${styles.ballotRow} ${
                        formData.candidate === option.value ? styles.stamped : ''
                      }`}
                      onClick={() => setFormData({...formData, candidate: option.value})}
                    >
                      <div className={styles.candidateInfo}>
                        <span className={styles.candidateNumber}>
                          <i className={option.icon}></i>
                        </span>
                        <span className={styles.candidateName}>{option.label}</span>
                      </div>
                      <div className={styles.stampArea}>
                        {formData.candidate === option.value && (
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
      </div>
    </>
  );
}
