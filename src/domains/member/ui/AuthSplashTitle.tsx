import { forwardRef } from "react";
import styles from "./AuthSplashTitle.module.scss";

interface AuthSplashTitleProps {
  mainTitle: string;
  subTitle: string;
}

export const AuthSplashTitle = forwardRef<HTMLDivElement, AuthSplashTitleProps>(
  ({ mainTitle, subTitle }, ref) => {
    return (
      <div ref={ref} className={styles.splashTitle}>
        <h1 className={styles.splashMainTitle}>
          {mainTitle.split("\n").map((line, index) => (
            <span key={index}>
              {line}
              {index < mainTitle.split("\n").length - 1 && <br />}
            </span>
          ))}
        </h1>
        <p className={styles.splashSubTitle}>{subTitle}</p>
      </div>
    );
  }
);

AuthSplashTitle.displayName = "AuthSplashTitle";

