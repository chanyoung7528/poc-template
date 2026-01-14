'use client';

import { SignupFlow } from '@/features/auth/ui/SignupFlow';
import { useRouter } from 'next/navigation';
import styles from './page.module.scss';

export default function SignupPage() {
  const router = useRouter();

  return (
    <div className={styles.container}>
      <SignupFlow onNavigateToLogin={() => router.push('/login')} />
    </div>
  );
}
