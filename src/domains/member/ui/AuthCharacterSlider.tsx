import { forwardRef, RefObject } from "react";
import styles from "./AuthCharacterSlider.module.scss";

interface AuthCharacterSliderProps {
  characterRefs: {
    char1Ref: RefObject<HTMLImageElement | null>;
    char2Ref: RefObject<HTMLImageElement | null>;
    char3Ref: RefObject<HTMLImageElement | null>;
    char4Ref: RefObject<HTMLImageElement | null>;
  };
  images: {
    src: string;
    alt: string;
  }[];
}

export const AuthCharacterSlider = forwardRef<
  HTMLDivElement,
  AuthCharacterSliderProps
>(({ characterRefs, images }, ref) => {
  const refs = [
    characterRefs.char1Ref,
    characterRefs.char2Ref,
    characterRefs.char3Ref,
    characterRefs.char4Ref,
  ];

  return (
    <div ref={ref} className={styles.characterImage}>
      {images.map((image, index) => (
        <img
          key={index}
          ref={refs[index]}
          src={image.src}
          alt={image.alt}
          className={styles.image}
        />
      ))}
    </div>
  );
});

AuthCharacterSlider.displayName = "AuthCharacterSlider";

