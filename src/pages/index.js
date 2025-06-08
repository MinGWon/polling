import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import styles from "@/styles/Login.module.css";
import Swal from 'sweetalert2';
import Image from 'next/image';

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);

    // Check if user is already logged in
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("user");
      if (user) {
        try {
          const userData = JSON.parse(user);
          if (userData.role === "admin") {
            router.push("/admin/dashboard");
          } else {
            router.push("/surveyor/samples");
          }
        } catch (error) {
          localStorage.removeItem("user");
        }
      }
    }
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem("user", JSON.stringify(data.user));
        if (data.user.role === "admin") {
          router.push("/admin/dashboard");
        } else {
          router.push("/surveyor/samples");
        }
      } else {
        await Swal.fire({
          title: '로그인 실패',
          text: data.message,
          icon: 'error',
          confirmButtonText: '확인',
          confirmButtonColor: '#e53e3e'
        });
      }
    } catch (error) {
      await Swal.fire({
        title: '연결 오류',
        text: '로그인 오류가 발생했습니다.',
        icon: 'error',
        confirmButtonText: '확인',
        confirmButtonColor: '#e53e3e'
      });
    } finally {
      setLoading(false);
    }
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>로딩 중...</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>출구조사 시스템 - 로그인</title>
        <meta name="description" content="학교 출구조사 시스템" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.container}>
        <div className={`${styles.backgroundPattern} ${styles.enhanced}`}></div>
        <main className={styles.main}>
          <div className={styles.loginBox}>
            <div className={styles.logoSection}>
              <Image 
                src="/image.png" 
                alt="출구조사 시스템 로고" 
                width={80} 
                height={80}
                className={styles.logoImage}
              />
              <div className={styles.logo}>📊</div>
              <h1 className={styles.title}>출구조사 시스템</h1>
              <p className={styles.description}>안전하고 신뢰할 수 있는 데이터 수집</p>
            </div>
            
            <form className={styles.form} onSubmit={handleLogin}>
              <div className={styles.inputGroup}>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={styles.input}
                  required
                />
                <label htmlFor="username" className={styles.label}>사용자명</label>
                <div className={styles.inputLine}></div>
              </div>

              <div className={styles.inputGroup}>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={styles.input}
                  required
                />
                <label htmlFor="password" className={styles.label}>비밀번호</label>
                <div className={styles.inputLine}></div>
              </div>

              <button 
                type="submit" 
                className={styles.submitBtn}
                disabled={loading}
              >
                <span className={styles.btnText}>
                  {loading ? "로그인 중" : "로그인"}
                </span>
                {loading && <div className={styles.loadingDots}>
                  <span></span><span></span><span></span>
                </div>}
              </button>
            </form>
          </div>
        </main>
      </div>
    </>
  );
}

// Add this to prevent layout from being applied
Login.getLayout = function getLayout(page) {
  return page;
};
