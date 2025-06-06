import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from '@/styles/Layout.module.css';
import Swal from 'sweetalert2';

const Layout = ({ children }) => {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    }
  }, []);

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: '로그아웃',
      text: '정말 로그아웃 하시겠습니까?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#667eea',
      cancelButtonColor: '#6b7280',
      confirmButtonText: '로그아웃',
      cancelButtonText: '취소'
    });

    if (result.isConfirmed) {
      localStorage.removeItem('user');
      router.push('/');
    }
  };

  if (!user) return children;

  const adminMenus = [
    { icon: '📊', text: '대시보드', path: '/admin/dashboard' },
    { icon: '📋', text: '응답 관리', path: '/admin/responses' }
  ];

  const surveyorMenus = [
    { icon: '📈', text: '표본 현황', path: '/surveyor/samples' },
    { icon: '📝', text: '출구조사', path: '/surveyor/survey' }
  ];

  const menus = user.role === 'admin' ? adminMenus : surveyorMenus;

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <div className={styles.logoBox}>
            📊
          </div>
        </div>
        
        <div className={styles.userInfo}>
          <div className={styles.userBox}>
            👤
          </div>
          <span className={styles.username}>{user.username}</span>
          <span className={styles.role}>
            {user.role === 'admin' ? '관리자' : '조사원'}
          </span>
        </div>

        <nav className={styles.nav}>
          {menus.map((menu) => (
            <button
              key={menu.path}
              className={`${styles.menuItem} ${
                router.pathname === menu.path ? styles.active : ''
              }`}
              onClick={() => router.push(menu.path)}
            >
              <div className={styles.menuIcon}>{menu.icon}</div>
              <span className={styles.menuText}>{menu.text}</span>
            </button>
          ))}
        </nav>

        <div className={styles.logout}>
          <button className={styles.logoutButton} onClick={handleLogout}>
            <div className={styles.logoutIcon}>🚪</div>
            <span>로그아웃</span>
          </button>
        </div>
      </aside>

      <main className={styles.main}>
        {children}
      </main>
    </div>
  );
};

export default Layout;
