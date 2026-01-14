'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser, useLogout } from '@/domains/auth/model/auth.queries';
import styles from './page.module.scss';

export default function HomePage() {
  const router = useRouter();
  const { data: user, isLoading, error } = useCurrentUser();
  const logoutMutation = useLogout();

  useEffect(() => {
    if (!isLoading && (!user || error)) {
      router.push('/login');
    }
  }, [user, isLoading, error, router]);

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      router.push('/login');
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingContent}>
          <div className={styles.spinner} />
          <p className={styles.loadingText}>로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className={styles.homePage}>
      <nav className={styles.nav}>
        <div className={styles.navContainer}>
          <div className={styles.navContent}>
            <h1 className={styles.navTitle}>소셜 로그인 데모</h1>
            <button onClick={handleLogout} className={styles.logoutButton}>
              로그아웃
            </button>
          </div>
        </div>
      </nav>

      <main className={styles.main}>
        <div className={styles.card}>
          <div className={styles.cardContent}>
            <h2 className={styles.title}>로그인 성공!</h2>

            <div className={styles.userSection}>
              <div className={styles.userProfile}>
                {user.profileImage && (
                  <img
                    src={user.profileImage}
                    alt={user.nickname || '프로필'}
                    className={styles.profileImage}
                  />
                )}
                <div>
                  <p className={styles.userName}>{user.nickname || '사용자'}</p>
                  {user.email && <p className={styles.userEmail}>{user.email}</p>}
                </div>
              </div>

              <div className={styles.divider}>
                <dl className={styles.infoList}>
                  <div className={styles.infoItem}>
                    <dt className={styles.infoLabel}>사용자 ID</dt>
                    <dd className={styles.infoValue}>{user.id}</dd>
                  </div>
                  <div className={styles.infoItem}>
                    <dt className={styles.infoLabel}>로그인 제공자</dt>
                    <dd className={styles.infoValue}>{user.provider}</dd>
                  </div>
                  <div className={styles.infoItem}>
                    <dt className={styles.infoLabel}>연결 시간</dt>
                    <dd className={styles.infoValue}>
                      {new Date(user.connectedAt).toLocaleString('ko-KR')}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
