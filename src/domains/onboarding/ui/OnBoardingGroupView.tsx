import styles from "./OnBoardingGroupView.module.scss";

export function OnBoardingGroupView() {
  return (
    <div className={styles.container}>
      <p className={styles.subtitle}>잠시만 기다려 주세요~</p>
      <h2 className={styles.title}>그룹 정보를 매칭 중이에요...</h2>
      <img src="/img/search-mov.png" />
    </div>
  );
}
