'use client';

import { LoginFlow } from '@/features/auth/ui/LoginFlow';
import { useRouter } from 'next/navigation';
import styles from './page.module.scss';

export default function LoginPage() {
  const router = useRouter();

  return (
    <div className={styles.container}>
      <LoginFlow onNavigateToSignup={() => router.push('/signup')} />
    </div>
  );
}
