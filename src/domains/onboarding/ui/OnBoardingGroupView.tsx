import styles from "./OnBoardingGroupView.module.scss";

interface OnBoardingGroupViewProps {
  searchImageRef?: React.RefObject<HTMLImageElement | null>;
}

export function OnBoardingGroupView({
  searchImageRef,
}: OnBoardingGroupViewProps) {
  return (
    <div className={styles.container}>
      <p className={styles.subtitle}>잠시만 기다려 주세요~</p>
      <h2 className={styles.title}>그룹 정보를 매칭 중이에요...</h2>
      <img ref={searchImageRef} src="/img/auth/search-mov.png" alt="검색 중" />
    </div>
  );
}
