import { useState } from "react";

/**
 * 그룹 매칭 상태 관리 훅
 */
export function useGroupMatching() {
  const [isMatching, setIsMatching] = useState(false);

  const handleStartMatching = () => {
    setIsMatching(true);
  };

  return {
    isMatching,
    handleStartMatching,
  };
}

