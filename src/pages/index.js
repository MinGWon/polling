import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import styles from "@/styles/Login.module.css";
import Swal from 'sweetalert2';

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
    return <div>로딩 중...</div>;
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
        <main className={styles.main}>
          <h1 className={styles.title}>출구조사 시스템</h1>
          <form className={styles.form} onSubmit={handleLogin}>
            <div className={styles.field}>
              <label>사용자명</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className={styles.field}>
              <label>비밀번호</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" disabled={loading}>
              {loading ? "로그인 중..." : "로그인"}
            </button>
          </form>
        </main>
      </div>
    </>
  );
}
