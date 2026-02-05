'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { IoMdArrowRoundBack } from 'react-icons/io';

// Categories: e-waste removed; only two bins remain
export type CategoryKey = 'biodegradable' | 'non_biodegradable';

const CATEGORIES: Record<
  CategoryKey,
  { label: string; emoji: string; color: string; bgColor: string }
> = {
  biodegradable: {
    label: 'Biodegradable',
    emoji: '🌿',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-900/30 border-emerald-700'
  },
  non_biodegradable: {
    label: 'Non-biodegradable',
    emoji: '🧴',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-900/30 border-cyan-700'
  }
};

export type Item = { id: string; name: string; category: CategoryKey; emoji: string };

// Expanded pool; (former e-waste/hazardous grouped under non_biodegradable)
const ITEM_POOL: Item[] = [
  // Biodegradable
  { id: 'i1', name: 'Banana Peel', category: 'biodegradable', emoji: '🍌' },
  { id: 'i2', name: 'Paper', category: 'biodegradable', emoji: '📄' },
  { id: 'i3', name: 'Tea Leaves', category: 'biodegradable', emoji: '🍵' },
  { id: 'i4', name: 'Apple Core', category: 'biodegradable', emoji: '🍎' },
  { id: 'i5', name: 'Garden Leaves', category: 'biodegradable', emoji: '🍃' },
  { id: 'i6', name: 'Vegetable Peels', category: 'biodegradable', emoji: '🥕' },
  { id: 'i7', name: 'Eggshells', category: 'biodegradable', emoji: '🥚' },
  { id: 'i8', name: 'Bread Crust', category: 'biodegradable', emoji: '🍞' },
  { id: 'i9', name: 'Coconut Shell', category: 'biodegradable', emoji: '🥥' },
  { id: 'i10', name: 'Sugarcane Pulp', category: 'biodegradable', emoji: '🧃' },
  { id: 'i11', name: 'Flowers', category: 'biodegradable', emoji: '💐' },
  { id: 'i12', name: 'Coffee Grounds', category: 'biodegradable', emoji: '☕' },

  // Non-biodegradable (includes recyclables + e-waste + hazardous)
  { id: 'i13', name: 'Plastic Bottle', category: 'non_biodegradable', emoji: '🧴' },
  { id: 'i14', name: 'Glass Jar', category: 'non_biodegradable', emoji: '🫙' },
  { id: 'i15', name: 'Aluminium Can', category: 'non_biodegradable', emoji: '🥫' },
  { id: 'i16', name: 'Metal Spoon', category: 'non_biodegradable', emoji: '🥄' },
  { id: 'i17', name: 'Plastic Bag', category: 'non_biodegradable', emoji: '🛍️' },
  { id: 'i18', name: 'Styrofoam Box', category: 'non_biodegradable', emoji: '📦' },
  { id: 'i19', name: 'Toothbrush', category: 'non_biodegradable', emoji: '🪥' },
  { id: 'i20', name: 'Chip Packet', category: 'non_biodegradable', emoji: '🍟' },
  { id: 'i21', name: 'Soda Bottle Cap', category: 'non_biodegradable', emoji: '🧢' },
  { id: 'i22', name: 'Broken Mirror', category: 'non_biodegradable', emoji: '🪞' },
  { id: 'i23', name: 'Rubber Tire Piece', category: 'non_biodegradable', emoji: '🛞' },
  { id: 'i24', name: 'Ceramic Plate Shard', category: 'non_biodegradable', emoji: '🍽️' },
  // Former e-waste/hazardous grouped into non_biodegradable
  { id: 'i25', name: 'Used Battery', category: 'non_biodegradable', emoji: '🔋' },
  { id: 'i26', name: 'Old Phone', category: 'non_biodegradable', emoji: '📱' },
  { id: 'i27', name: 'Broken Bulb', category: 'non_biodegradable', emoji: '💡' },
  { id: 'i28', name: 'Wires & Cables', category: 'non_biodegradable', emoji: '🔌' },
  { id: 'i29', name: 'Paint Can', category: 'non_biodegradable', emoji: '🪣' },
  { id: 'i30', name: 'Medical Syringe', category: 'non_biodegradable', emoji: '💉' },
  { id: 'i31', name: 'Old Keyboard', category: 'non_biodegradable', emoji: '⌨️' },
  { id: 'i32', name: 'Laptop Charger', category: 'non_biodegradable', emoji: '🔌' },
  { id: 'i33', name: 'CD/DVD', category: 'non_biodegradable', emoji: '💿' },
  { id: 'i34', name: 'Credit Card', category: 'non_biodegradable', emoji: '💳' },
  { id: 'i35', name: 'PVC Pipe Piece', category: 'non_biodegradable', emoji: '🧰' }
];

function shuffleArray<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function sample<T>(arr: T[], n: number): T[] {
  return shuffleArray(arr).slice(0, n);
}

export default function GameComp({ onExit }: { onExit?: () => void }) {
  const [gameStarted, setGameStarted] = React.useState(false);
  const [items, setItems] = React.useState<Item[]>([]); // remaining items
  const [totalCount, setTotalCount] = React.useState(0);
  const [score, setScore] = React.useState(0);
  const [feedback, setFeedback] = React.useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const categoryOrder = React.useMemo<CategoryKey[]>(
    () => shuffleArray(Object.keys(CATEGORIES) as CategoryKey[]),
    []
  );

  const currentItem = items[0];
  const answeredCount = totalCount - items.length;

  function startGame() {
    const chosen = sample(ITEM_POOL, 8);
    setGameStarted(true);
    setItems(chosen);
    setTotalCount(chosen.length);
    setScore(0);
    setFeedback(null);
  }

  function resetGame() {
    setGameStarted(false);
    setItems([]);
    setTotalCount(0);
    setScore(0);
    setFeedback(null);
    setIsDragging(false);
  }

  function onDragStart(e: React.DragEvent<HTMLDivElement>) {
    if (!currentItem) return;
    e.dataTransfer.setData('text/plain', currentItem.id);
    e.dataTransfer.effectAllowed = 'move';
    setIsDragging(true);
  }

  function onDragEnd() {
    setIsDragging(false);
  }

  function onDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  function handleDrop(target: CategoryKey, e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    if (!currentItem) return;

    const correct = currentItem.category === target;
    if (correct) {
      setScore((s) => s + 10);
      setFeedback({ type: 'success', message: 'Correct! 🎉' });
    } else {
      setScore((s) => Math.max(0, s - 3));
      setFeedback({ type: 'error', message: 'Try again! 🤔' });
    }

    setTimeout(() => {
      setFeedback(null);
      if (correct) {
        const [, ...rest] = items; // remove current
        setItems(rest);
        // When rest is empty, completion screen will show and persist until user clicks a button.
      }
    }, 1000);
  }

  if (!gameStarted) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center space-y-8 rounded-2xl border border-gray-700 bg-linear-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="space-y-4 text-center">
          <div className="mb-4 text-8xl">♻️</div>
          <h1 className="bg-linear-to-r from-cyan-600 to-green-600 bg-clip-text text-4xl font-bold text-transparent">
            Waste Sorting Game
          </h1>
          <p className="text-xl text-gray-300">Learn to sort waste correctly!</p>
          {answeredCount > 0 && (
            <div className="text-lg font-semibold text-green-600">
              Final Score: {score} / {totalCount * 10}
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <button
            onClick={startGame}
            className="flex items-center gap-2 rounded-full border border-amber-600/40 bg-linear-to-r from-amber-700 via-orange-700 to-amber-800 px-8 py-4 text-xl font-bold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:from-amber-600 hover:via-orange-600 hover:to-amber-700"
          >
            <span className="mr-2 text-3xl">🎮</span> Start Game
          </button>
          {/* {onExit && (
            <button
              onClick={onExit}
              className="flex items-center gap-2 rounded-full border border-gray-600 bg-gray-700 px-6 py-4 text-lg font-semibold text-gray-200 transition-all duration-200 hover:bg-gray-600"
            >
              <IoMdArrowRoundBack className="h-5 w-5" />
              Back
            </button>
          )} */}
        </div>
      </div>
    );
  }

  if (!currentItem) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center space-y-8 rounded-2xl border border-gray-700 bg-linear-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="space-y-4 text-center">
          <div className="mb-4 text-8xl">🏆</div>
          <h2 className="text-4xl font-bold text-green-600">Congratulations!</h2>
          <p className="text-xl text-gray-300">You completed the game!</p>
          <div className="text-2xl font-bold text-green-600">
            Final Score: {score} / {totalCount * 10}
          </div>
        </div>
        <div className="flex gap-4">
          <button
            onClick={resetGame}
            className="rounded-full border border-emerald-600/40 bg-linear-to-r from-emerald-700 to-green-800 px-8 py-4 text-xl font-bold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:from-emerald-600 hover:to-green-700"
          >
            🔄 Play Again
          </button>
          {onExit && (
            <button
              onClick={onExit}
              className="flex items-center gap-2 rounded-full border border-gray-600 bg-gray-700 px-6 py-4 text-lg font-semibold text-gray-200 transition-all duration-200 hover:bg-gray-600"
            >
              <IoMdArrowRoundBack className="h-5 w-5" /> Back to Dashboard
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] rounded-2xl border border-gray-700 bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="text-2xl font-bold text-green-600">Score: {score}</div>
        <div className="text-lg text-gray-300">
          {answeredCount + 1} / {totalCount}
        </div>
        <div className="flex gap-3">
          <button
            onClick={resetGame}
            className="rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 text-gray-200 transition-colors hover:bg-gray-600"
          >
            🔄 Reset
          </button>
          {onExit && (
            <button
              onClick={onExit}
              className="rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 text-gray-200 transition-colors hover:bg-gray-600"
            >
              ← Exit
            </button>
          )}
        </div>
      </div>

      {/* Current Item */}
      <div className="mb-12 text-center">
        <h2 className="mb-8 text-2xl font-semibold text-gray-200">
          Drag this item to the correct bin:
        </h2>

        <motion.div
          className={cn(
            'inline-block cursor-grab rounded-2xl p-8 shadow-xl transition-all duration-300 active:cursor-grabbing',
            isDragging ? 'scale-110 rotate-3' : 'hover:scale-105',
            feedback?.type === 'success'
              ? 'border-green-400 bg-green-900/30 ring-4 ring-green-400'
              : feedback?.type === 'error'
                ? 'border-red-400 bg-red-900/30 ring-4 ring-red-400'
                : 'border-2 border-gray-600 bg-gray-800/50'
          )}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div draggable onDragStart={onDragStart} onDragEnd={onDragEnd} className="h-full w-full">
            <div className="mb-4 text-8xl">{currentItem.emoji}</div>
            <div className="text-2xl font-bold text-gray-100">{currentItem.name}</div>
          </div>
        </motion.div>

        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              'mt-6 text-2xl font-bold',
              feedback.type === 'success' ? 'text-green-600' : 'text-red-600'
            )}
          >
            {feedback.message}
          </motion.div>
        )}
      </div>

      {/* Drop Zones (two columns on all screens) */}
      <div className="grid grid-cols-2 gap-6">
        {categoryOrder.map((key) => (
          <DropZone
            key={key}
            categoryKey={key}
            onDrop={(e) => handleDrop(key, e)}
            onDragOver={onDragOver}
          />
        ))}
      </div>
    </div>
  );
}

function DropZone({
  categoryKey,
  onDrop,
  onDragOver
}: {
  categoryKey: CategoryKey;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
}) {
  const [isDragOver, setIsDragOver] = React.useState(false);
  const meta = CATEGORIES[categoryKey];

  return (
    <div
      onDrop={(e) => {
        setIsDragOver(false);
        onDrop(e);
      }}
      onDragOver={(e) => {
        onDragOver(e);
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      className={cn(
        'flex min-h-48 flex-col items-center justify-center rounded-xl border-4 border-dashed p-6 text-center transition-all duration-300 hover:scale-102',
        meta.bgColor,
        isDragOver ? 'scale-105 border-solid shadow-xl' : ''
      )}
    >
      <div className="mb-3 text-4xl">{meta.emoji}</div>
      <div className={cn('text-lg font-bold', meta.color)}>{meta.label}</div>
      <div className="mt-2 text-sm text-gray-400">Drop here</div>
    </div>
  );
}
