import styles from "./LoadingOverlay.module.scss";

interface LoadingOverlayProps {
  message?: string;
}

export function LoadingOverlay({
  message = "로딩 중...",
}: LoadingOverlayProps) {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.loadingOverlay}>
          <p>{message}</p>
        </div>
      </div>
    </div>
  );
}
