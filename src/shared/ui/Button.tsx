import * as React from "react";

import styles from "./Button.module.scss";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon" | "full";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const classNames = [
      styles.button,
      styles[`${variant}`],
      styles[`${size}`],
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return <button className={classNames} ref={ref} {...props} />;
  }
);

Button.displayName = "Button";

export { Button };
