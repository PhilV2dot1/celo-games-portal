"use client";

import { useCallback } from "react";
import { useWriteContract } from "wagmi";
import { useMiniPayContext } from "@/components/providers";
import type { WriteContractParameters } from "wagmi/actions";

/**
 * Wraps wagmi's useWriteContract and forces legacy (type 0) transactions
 * when running inside MiniPay. MiniPay does not support EIP-1559 transactions.
 */
export function useMiniPayWriteContract() {
  const { writeContract, writeContractAsync, ...rest } = useWriteContract();
  const { isInMiniPay } = useMiniPayContext();

  const patchArgs = useCallback(
    <T extends WriteContractParameters>(args: T): T => {
      if (!isInMiniPay) return args;
      return { ...args, type: "legacy" } as T;
    },
    [isInMiniPay]
  );

  const patchedWriteContract = useCallback(
    (args: WriteContractParameters) => writeContract(patchArgs(args)),
    [writeContract, patchArgs]
  );

  const patchedWriteContractAsync = useCallback(
    (args: WriteContractParameters) => writeContractAsync(patchArgs(args)),
    [writeContractAsync, patchArgs]
  );

  return {
    ...rest,
    writeContract: patchedWriteContract,
    writeContractAsync: patchedWriteContractAsync,
  };
}
