import { BaseHeader, type BaseHeaderProps } from "./BaseHeader";

export type MainHeaderProps = BaseHeaderProps;

export function MainHeader(props: MainHeaderProps) {
  return <BaseHeader {...props} />;
}
