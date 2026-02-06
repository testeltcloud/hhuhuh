import { useState, useEffect } from 'react';
import { useProfile } from '../contexts/ProfileContext';
import { itemsService } from '../services/itemsService';
import { format, isSameMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import MonthSelector from '../components/common/MonthSelector';

export default function Purchased() {
  const { currentProfile } = useProfile();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, purchased, discarded
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    if (currentProfile) {
      loadItems();
    }
  }, [currentProfile, currentDate]); // Reload when date changes if we were doing server-side, but here we filter client side so dependency is optional if we optimize.
  // Actually, client-side filtering means we just need to re-render. 
  // loadItems fetches ALL non-pending items. Then we filter.

  const loadItems = async () => {
    try {
      const data = await itemsService.getByProfile(currentProfile.id);
      setItems(data.filter(i => i.status !== 'pending'));
    } catch (error) {
      console.error('Error loading items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (itemId) => {
    try {
      await itemsService.updateStatus(itemId, 'pending');
      setItems(prev => prev.filter(i => i.id !== itemId));
    } catch (error) {
      console.error('Error restoring item:', error);
    }
  };

  const handleDelete = async (itemId) => {
    if (window.confirm('Tem certeza que deseja excluir permanentemente este item?')) {
      try {
        await itemsService.delete(itemId);
        setItems(prev => prev.filter(i => i.id !== itemId));
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };

  // 1. Filter by Month
  const monthItems = items.filter(i => 
    isSameMonth(
      (i.purchasedAt?.toDate?.() || i.updatedAt?.toDate?.() || new Date(i.updatedAt || 0)), 
      currentDate
    )
  );

  // 2. Filter by Type (All/Purchased/Discarded)
  const filteredItems = monthItems.filter(item => {
    if (filter === 'all') return true;
    return item.status === filter;
  });

  const purchasedItems = monthItems.filter(i => i.status === 'purchased');
  const totalSpent = purchasedItems.reduce((acc, item) => {
    return acc + (item.finalPrice || item.estimatedPrice || 0) * (item.quantity || 1);
  }, 0);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="container animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-lg gap-md">
        <div className="flex flex-col gap-sm">
          <h1>📦 Histórico</h1>
          <MonthSelector currentDate={currentDate} onChange={setCurrentDate} />
        </div>
        
        <div className="stat-card" style={{ padding: 'var(--space-sm) var(--space-md)' }}>
          <span className="text-sm text-muted">Total Gasto ({format(currentDate, 'MMM', { locale: ptBR })})</span>
          <span className="font-bold" style={{ color: 'var(--success)' }}>
            R$ {totalSpent.toFixed(2).replace('.', ',')}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs mb-lg">
        <button 
          className={`tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Todos ({monthItems.length})
        </button>
        <button 
          className={`tab ${filter === 'purchased' ? 'active' : ''}`}
          onClick={() => setFilter('purchased')}
        >
          ✅ Comprados ({purchasedItems.length})
        </button>
        <button 
          className={`tab ${filter === 'discarded' ? 'active' : ''}`}
          onClick={() => setFilter('discarded')}
        >
          ❌ Descartados ({monthItems.filter(i => i.status === 'discarded').length})
        </button>
      </div>

      {/* Items List */}
      {filteredItems.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <h3 className="empty-state-title">Nenhum item neste mês</h3>
          <p className="empty-state-text">
            Selecione outro mês ou adicione novos itens
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-md">
          {filteredItems.map(item => (
            <div 
              key={item.id} 
              className={`item-card ${item.status}`}
            >
              <div className="item-card-content">
                <div className="item-card-name">
                  {item.name}
                  <span className={`badge badge-${item.status}`}>
                    {item.status === 'purchased' ? '✅ Comprado' : '❌ Descartado'}
                  </span>
                </div>
                <div className="item-card-meta">
                  <span>{item.category}</span>
                  <span>•</span>
                  <span>Qtd: {item.quantity || 1}</span>
                  {item.status === 'purchased' && (
                    <>
                      <span>•</span>
                      <span style={{ color: 'var(--success)' }}>
                        R$ {((item.finalPrice || item.estimatedPrice || 0) * (item.quantity || 1)).toFixed(2).replace('.', ',')}
                      </span>
                    </>
                  )}
                  <span>•</span>
                  <span>{formatDate(item.updatedAt)}</span>
                </div>
                {item.notes && (
                  <p className="text-sm text-muted mt-sm">{item.notes}</p>
                )}
              </div>
              <div className="item-card-actions">
                <button 
                  className="btn btn-ghost btn-sm"
                  onClick={() => handleRestore(item.id)}
                  title="Restaurar para pendente"
                >
                  ↩️
                </button>
                <button 
                  className="btn btn-ghost btn-sm"
                  onClick={() => handleDelete(item.id)}
                  title="Excluir permanentemente"
                  style={{ color: 'var(--danger)' }}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function formatDate(timestamp) {
  if (!timestamp) return '';
  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, "dd/MM/yyyy", { locale: ptBR });
  } catch {
    return '';
  }
}
