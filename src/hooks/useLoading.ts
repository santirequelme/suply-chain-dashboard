import { useState, useCallback, useRef, useEffect } from "react";

export type LoadingVariant = "spinner" | "skeleton";

interface LoadingConfig {
  minDuration?: number;
  maxDuration?: number;
  triggerChance?: number;
  defaultVariant?: LoadingVariant;
}

interface LoadingState {
  isLoading: boolean;
  variant: LoadingVariant;
}

const DEFAULT_CONFIG: Required<LoadingConfig> = {
  minDuration: 1000,
  maxDuration: 3000,
  triggerChance: 0.3,
  defaultVariant: "skeleton",
};

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shouldTrigger(chance: number): boolean {
  return Math.random() < chance;
}

function getRandomVariant(): LoadingVariant {
  return Math.random() < 0.4 ? "spinner" : "skeleton";
}

export function useLoadingTrigger(config: LoadingConfig = {}) {
  const { minDuration, maxDuration, triggerChance, defaultVariant } = {
    ...DEFAULT_CONFIG,
    ...config,
  };

  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    variant: defaultVariant,
  });

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const trigger = useCallback(() => {
    if (!shouldTrigger(triggerChance)) {
      setLoadingState({ isLoading: false, variant: defaultVariant });
      return;
    }

    const variant = getRandomVariant();
    const duration = randomBetween(minDuration, maxDuration);

    setLoadingState({ isLoading: true, variant });

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setLoadingState({ isLoading: false, variant });
    }, duration);
  }, [minDuration, maxDuration, triggerChance, defaultVariant]);

  const setLoading = useCallback((isLoading: boolean, variant?: LoadingVariant) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (isLoading) {
      const v = variant || getRandomVariant();
      const duration = randomBetween(minDuration, maxDuration);
      setLoadingState({ isLoading: true, variant: v });

      timeoutRef.current = setTimeout(() => {
        setLoadingState({ isLoading: false, variant: v });
      }, duration);
    } else {
      setLoadingState({ isLoading: false, variant: defaultVariant });
    }
  }, [minDuration, maxDuration, defaultVariant]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { ...loadingState, trigger, setLoading };
}

export function useSectionLoading(initial = false) {
  const [isLoading, setIsLoading] = useState(initial);
  const [variant, setVariant] = useState<LoadingVariant>("skeleton");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((newVariant?: LoadingVariant) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const v = newVariant || getRandomVariant();
    setVariant(v);
    setIsLoading(true);
  }, []);

  const hide = useCallback(() => {
    setIsLoading(false);
  }, []);

  const showWithDuration = useCallback((minDuration = 1000, maxDuration = 3000) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const v = getRandomVariant();
    const duration = randomBetween(minDuration, maxDuration);
    setVariant(v);
    setIsLoading(true);

    timeoutRef.current = setTimeout(() => {
      setIsLoading(false);
    }, duration);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { isLoading, variant, show, hide, showWithDuration };
}
