"use client";

import { useRouter } from "next/navigation";
import styles from "./page.module.scss";
import SucessCheckLottie from "@/shared/ui/lottie/SucessCheckLottie";
import { OnBoardingLayout } from "@/domains/onboarding/ui/OnBoardingLayout";
import { Button } from "@/shared/ui/Button";

export default function OnboardingGroupPage() {
  const router = useRouter();

  const mockData = [
    {
      name: "래미안",
      address: "강남 래미안 라클래시 106동",
      status: "완료",
    },
    {
      name: "레미안",
      address: "강남 레미안 라클래시 106동",
      status: "진행중",
    },
    {
      name: "레미안",
      address: "강남 레미안 라클래시 106동",
      status: "진행중",
    },
    {
      name: "레미안",
      address: "강남 레미안 라클래시 106동",
      status: "진행중",
    },
  ];

  return (
    <OnBoardingLayout>
      <div className={styles.content}>
        <SucessCheckLottie />
        <p className={styles.subTitle}> {mockData.length}개 그룹</p>
        <h2 className={styles.title}>매칭이 완료 되었어요</h2>

        <div className={styles.line}></div>

        <ul className={styles.groupItemLists}>
          {mockData.map((group, idx) => (
            <li className={styles.groupItemList} key={idx}>
              <div className={styles.groupItem}>
                <img src="/img/auth/frame.png" alt={group.name} />
                <div className={styles.groupItemTitle}>
                  <p>{group.name}</p>
                  <h2>{group.address}</h2>
                </div>
              </div>
              <label className={styles.groupItemStatus}>{group.status}</label>
            </li>
          ))}
        </ul>
      </div>

      <footer className={styles.footer}>
        <Button
          className={styles.button}
          variant="default"
          size="full"
          onClick={() => router.push("/join/onboarding/allergy")}
        >
          다음
        </Button>
      </footer>
    </OnBoardingLayout>
  );
}
