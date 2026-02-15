"use client";

import { memo } from "react";
import { type Piece, PIECE_COLORS } from "@/lib/games/tetris-logic";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface NextPieceProps {
  piece: Piece | null;
}

export const NextPiece = memo(function NextPiece({ piece }: NextPieceProps) {
  const { t } = useLanguage();

  return (
    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-xl p-3 shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center mb-2 font-semibold">
        {t("games.tetris.next")}
      </div>
      <div className="flex justify-center">
        {piece ? (
          <div
            className="grid gap-[1px]"
            style={{
              gridTemplateColumns: `repeat(${piece.shape[0].length}, 1fr)`,
            }}
          >
            {piece.shape.flatMap((row, r) =>
              row.map((filled, c) => (
                <div
                  key={`${r}-${c}`}
                  className={`w-4 h-4 rounded-[2px] ${
                    filled ? PIECE_COLORS[piece.type] : "bg-transparent"
                  }`}
                />
              ))
            )}
          </div>
        ) : (
          <div className="w-16 h-16" />
        )}
      </div>
    </div>
  );
});
