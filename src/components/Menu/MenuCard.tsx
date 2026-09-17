import { useState } from 'react';
import { MenuItem } from '../../types';
import { Plus, Minus, Check } from 'lucide-react';

interface Props {
  item: MenuItem;
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
}

export default function MenuCard({ item, quantity, onAdd, onRemove }: Props) {
  const [justAdded, setJustAdded] = useState(false);

  const handleAdd = () => {
    onAdd();
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 600);
  };

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-orange-200 transition-all duration-300 overflow-hidden">
      <div className="flex">
        {/* Image/Emoji Area */}
        <div className="relative w-28 sm:w-32 bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center flex-shrink-0">
          <span className="text-5xl group-hover:scale-110 transition-transform duration-300">
            {item.imageUrl}
          </span>
          {justAdded && (
            <div className="absolute inset-0 bg-emerald-500/10 flex items-center justify-center animate-pulse">
              <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                <Check className="text-white" size={20} />
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-3 sm:p-4 flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-gray-800 text-sm sm:text-base leading-tight">
                {item.name}
              </h3>
            </div>
            <p className="text-gray-500 text-xs mt-1 line-clamp-2 leading-relaxed">
              {item.description}
            </p>
          </div>

          <div className="flex items-center justify-between mt-3">
            <span className="text-orange-600 font-bold text-base sm:text-lg">
              ${item.price.toFixed(2)}
            </span>

            {quantity === 0 ? (
              <button
                onClick={handleAdd}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs sm:text-sm font-medium rounded-full transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm"
              >
                <Plus size={14} />
                Add
              </button>
            ) : (
              <div className="flex items-center gap-1.5 bg-orange-50 rounded-full p-1">
                <button
                  onClick={onRemove}
                  className="w-7 h-7 flex items-center justify-center bg-white hover:bg-orange-100 rounded-full shadow-sm transition active:scale-90"
                >
                  <Minus size={14} className="text-orange-600" />
                </button>
                <span className="w-6 text-center text-sm font-bold text-orange-700">
                  {quantity}
                </span>
                <button
                  onClick={handleAdd}
                  className="w-7 h-7 flex items-center justify-center bg-orange-500 hover:bg-orange-600 rounded-full shadow-sm transition active:scale-90"
                >
                  <Plus size={14} className="text-white" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
