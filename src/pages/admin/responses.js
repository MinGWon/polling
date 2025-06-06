import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import styles from "@/styles/Responses.module.css";
import Swal from 'sweetalert2';

export default function Responses() {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchResponses();
  }, []);

  const fetchResponses = async () => {
    try {
      const response = await fetch('/api/responses');
      const data = await response.json();
      setResponses(data);
    } catch (error) {
      console.error('Error fetching responses:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteResponse = async (id) => {
    const result = await Swal.fire({
      title: '응답 삭제',
      text: '이 응답을 삭제하시겠습니까?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e53e3e',
      cancelButtonColor: '#6b7280',
      confirmButtonText: '삭제',
      cancelButtonText: '취소'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/responses/${id}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          await Swal.fire({
            title: '삭제 완료',
            text: '응답이 성공적으로 삭제되었습니다.',
            icon: 'success',
            confirmButtonText: '확인',
            confirmButtonColor: '#667eea',
            timer: 1500
          });
          fetchResponses();
        }
      } catch (error) {
        await Swal.fire({
          title: '삭제 실패',
          text: '삭제 중 오류가 발생했습니다.',
          icon: 'error',
          confirmButtonText: '확인',
          confirmButtonColor: '#e53e3e'
        });
      }
    }
  };

  if (loading) return <div>로딩 중...</div>;

  return (
    <>
      <Head>
        <title>응답 관리 - 출구조사 시스템</title>
      </Head>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1>응답 관리</h1>
          <button onClick={() => router.push('/admin/dashboard')}>
            대시보드로 돌아가기
          </button>
        </header>
        <main className={styles.main}>
          <div className={styles.stats}>
            <span>총 응답 수: {responses.length}</span>
          </div>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>학년</th>
                <th>성별</th>
                <th>투표 후보</th>
                <th>응답 시간</th>
                <th>작업</th>
              </tr>
            </thead>
            <tbody>
              {responses.map((response) => (
                <tr key={response.id}>
                  <td>{response.id}</td>
                  <td>{response.grade}학년</td>
                  <td>{response.gender === 'male' ? '남성' : '여성'}</td>
                  <td>후보 {response.candidate}</td>
                  <td>{new Date(response.created_at).toLocaleString()}</td>
                  <td>
                    <button 
                      onClick={() => deleteResponse(response.id)}
                      className={styles.deleteButton}
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </main>
      </div>
    </>
  );
}
