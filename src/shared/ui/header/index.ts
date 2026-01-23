import { MainHeader } from './MainHeader';
import { PopupHeader } from './PopupHeader';
import { SubHeader } from './SubHeader';

export const Header = Object.assign(SubHeader, {
  Main: MainHeader,
  Popup: PopupHeader,
  Sub: SubHeader,
});
