import { useState } from 'react';

const PRIORITY_LABELS = {
  high: { label: 'Alta', icon: '🔴' },
  medium: { label: 'Média', icon: '🟡' },
  low: { label: 'Baixa', icon: '🟢' }
};

const CATEGORY_ICONS = {
  'Mercado': '🛒',
  'Farmácia': '💊',
  'Casa': '🏠',
  'Lazer': '🎮',
  'Outros': '📦'
};

export default function ItemCard({ item, onStatusChange, onEdit, onDelete }) {
  const [showPriceInput, setShowPriceInput] = useState(false);
  const [finalPrice, setFinalPrice] = useState(item.estimatedPrice || '');

  const handleMarkAsPurchased = () => {
    setShowPriceInput(true);
  };

  const confirmPurchase = async () => {
    await onStatusChange(item.id, 'purchased', parseFloat(finalPrice) || 0);
    setShowPriceInput(false);
  };

  const handleDiscard = () => {
    onStatusChange(item.id, 'discarded');
  };

  const priority = PRIORITY_LABELS[item.priority] || PRIORITY_LABELS.medium;
  const categoryIcon = CATEGORY_ICONS[item.category] || '📦';
  const totalPrice = (item.estimatedPrice || 0) * (item.quantity || 1);

  if (showPriceInput) {
    return (
      <div className="item-card" style={{ background: 'var(--bg-tertiary)' }}>
        <div className="item-card-content">
          <div className="item-card-name">{item.name}</div>
          <p className="text-sm text-muted mb-md">
            Informe o preço final pago (deixe em branco para usar o estimado):
          </p>
          <div className="flex gap-sm items-center">
            <span>R$</span>
            <input
              type="number"
              className="input"
              style={{ maxWidth: '150px' }}
              placeholder={String(item.estimatedPrice || 0)}
              value={finalPrice}
              onChange={(e) => setFinalPrice(e.target.value)}
              autoFocus
              step="0.01"
              min="0"
            />
          </div>
        </div>
        <div className="flex flex-col gap-sm">
          <button className="btn btn-success btn-sm" onClick={confirmPurchase}>
            ✅ Confirmar
          </button>
          <button 
            className="btn btn-ghost btn-sm" 
            onClick={() => setShowPriceInput(false)}
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="item-card">
      <div className="item-card-content">
        <div className="item-card-name">
          {priority.icon} {item.name}
          <span className={`badge badge-priority-${item.priority}`}>
            {priority.label}
          </span>
        </div>
        <div className="item-card-meta">
          <span>{categoryIcon} {item.category}</span>
          <span>•</span>
          <span>Qtd: {item.quantity || 1}</span>
          {item.estimatedPrice > 0 && (
            <>
              <span>•</span>
              <span>R$ {totalPrice.toFixed(2).replace('.', ',')}</span>
            </>
          )}
        </div>
        {item.notes && (
          <p className="text-sm text-muted mt-sm" style={{ fontStyle: 'italic' }}>
            📝 {item.notes}
          </p>
        )}
      </div>
      <div className="item-card-actions">
        <button 
          className="btn btn-success btn-sm"
          onClick={handleMarkAsPurchased}
          title="Marcar como comprado"
        >
          ✅
        </button>
        <button 
          className="btn btn-ghost btn-sm"
          onClick={() => onEdit(item)}
          title="Editar item"
        >
          ✏️
        </button>
        <button 
          className="btn btn-ghost btn-sm"
          onClick={handleDiscard}
          title="Descartar item"
          style={{ color: 'var(--danger)' }}
        >
          ❌
        </button>
      </div>
    </div>
  );
}
