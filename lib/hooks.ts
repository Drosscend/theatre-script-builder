"use client";

import { useCallback, useState, useTransition } from "react";

const ActionResponse = {
  success: true,
  data: undefined,
  error: undefined,
};

export function useOptimisticAction<T, U = T, D = any>(
  initialState: T[],
  action: (data: D) => Promise<typeof ActionResponse & { success: boolean; data?: U; error?: unknown }>,
  options?: {
    onSuccess?: (data: U) => void;
    onError?: (error: unknown) => void;
  }
) {
  const [optimisticData, setOptimisticData] = useState<T[]>(initialState);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<unknown>(null);

  const execute = useCallback(
    async (data: D, optimisticUpdate: (currentData: T[]) => T[]) => {
      setError(null);

      // Appliquer la mise à jour optimiste
      setOptimisticData((current) => optimisticUpdate(current));

      // Exécuter l'action serveur dans une transition
      startTransition(async () => {
        try {
          const result = await action(data);

          if (result.success) {
            options?.onSuccess?.(result.data as U);
          } else {
            // Restaurer l'état précédent en cas d'erreur
            setOptimisticData(initialState);
            setError(result.error);
            options?.onError?.(result.error);
          }
        } catch (err) {
          // Restaurer l'état précédent en cas d'erreur
          setOptimisticData(initialState);
          setError(err);
          options?.onError?.(err);
        }
      });
    },
    [action, initialState, options]
  );

  return {
    data: optimisticData,
    isPending,
    error,
    execute,
  };
}

export function useOptimisticItemAction<T extends { id: string }, D = any>(
  initialState: T[],
  action: (id: string, data: D) => Promise<typeof ActionResponse & { success: boolean; data?: T; error?: unknown }>,
  options?: {
    onSuccess?: (data: T) => void;
    onError?: (error: unknown) => void;
  }
) {
  const [optimisticData, setOptimisticData] = useState<T[]>(initialState);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<unknown>(null);

  const execute = useCallback(
    async (id: string, data: D, optimisticUpdate: (currentData: T[]) => T[]) => {
      setError(null);

      // Appliquer la mise à jour optimiste
      setOptimisticData((current) => optimisticUpdate(current));

      // Exécuter l'action serveur dans une transition
      startTransition(async () => {
        try {
          const result = await action(id, data);

          if (result.success) {
            options?.onSuccess?.(result.data as T);
          } else {
            // Restaurer l'état précédent en cas d'erreur
            setOptimisticData(initialState);
            setError(result.error);
            options?.onError?.(result.error);
          }
        } catch (err) {
          // Restaurer l'état précédent en cas d'erreur
          setOptimisticData(initialState);
          setError(err);
          options?.onError?.(err);
        }
      });
    },
    [action, initialState, options]
  );

  return {
    data: optimisticData,
    isPending,
    error,
    execute,
  };
}

export function useOptimisticDelete<T extends { id: string }>(
  initialState: T[],
  action: (id: string) => Promise<typeof ActionResponse & { success: boolean; data?: void; error?: unknown }>,
  options?: {
    onSuccess?: () => void;
    onError?: (error: unknown) => void;
  }
) {
  const [optimisticData, setOptimisticData] = useState<T[]>(initialState);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<unknown>(null);

  const execute = useCallback(
    async (id: string) => {
      setError(null);

      // Sauvegarder l'état actuel pour pouvoir le restaurer en cas d'erreur
      const previousData = [...optimisticData];

      // Appliquer la suppression optimiste
      setOptimisticData((current) => current.filter((item) => item.id !== id));

      // Exécuter l'action serveur dans une transition
      startTransition(async () => {
        try {
          const result = await action(id);

          if (result.success) {
            options?.onSuccess?.();
          } else {
            // Restaurer l'état précédent en cas d'erreur
            setOptimisticData(previousData);
            setError(result.error);
            options?.onError?.(result.error);
          }
        } catch (err) {
          // Restaurer l'état précédent en cas d'erreur
          setOptimisticData(previousData);
          setError(err);
          options?.onError?.(err);
        }
      });
    },
    [action, optimisticData, options]
  );

  return {
    data: optimisticData,
    isPending,
    error,
    execute,
  };
}

export function useOptimisticReorder<T extends { id: string }>(
  initialState: T[],
  action: (ids: string[]) => Promise<typeof ActionResponse & { success: boolean; data?: void; error?: unknown }>,
  options?: {
    onSuccess?: () => void;
    onError?: (error: unknown) => void;
  }
) {
  const [optimisticData, setOptimisticData] = useState<T[]>(initialState);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<unknown>(null);

  const execute = useCallback(
    async (newOrder: T[]) => {
      setError(null);

      // Sauvegarder l'état actuel pour pouvoir le restaurer en cas d'erreur
      const previousData = [...optimisticData];

      // Appliquer la réorganisation optimiste
      setOptimisticData(newOrder);

      // Exécuter l'action serveur dans une transition
      startTransition(async () => {
        try {
          const result = await action(newOrder.map((item) => item.id));

          if (result.success) {
            options?.onSuccess?.();
          } else {
            // Restaurer l'état précédent en cas d'erreur
            setOptimisticData(previousData);
            setError(result.error);
            options?.onError?.(result.error);
          }
        } catch (err) {
          // Restaurer l'état précédent en cas d'erreur
          setOptimisticData(previousData);
          setError(err);
          options?.onError?.(err);
        }
      });
    },
    [action, optimisticData, options]
  );

  return {
    data: optimisticData,
    isPending,
    error,
    execute,
  };
}
