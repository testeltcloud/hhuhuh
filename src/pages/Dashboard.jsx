import { useState, useEffect } from 'react';
import { useProfile } from '../contexts/ProfileContext';
import { itemsService } from '../services/itemsService';
import { format, isSameMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import MonthSelector from '../components/common/MonthSelector';

export default function Dashboard() {
  const { currentProfile } = useProfile();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    if (currentProfile) {
      loadItems();
    }
  }, [currentProfile]);

  const loadItems = async () => {
    try {
      const data = await itemsService.getByProfile(currentProfile.id);
      setItems(data);
    } catch (error) {
      console.error('Error loading items:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter items based on selected month
  // Pending items are ALWAYS visible regardless of month (backlog)
  const pendingItems = items.filter(i => i.status === 'pending');
  
  // History items (purchased/discarded) are filtered by month
  const historyItems = items.filter(i => 
    i.status !== 'pending' && 
    (i.purchasedAt || i.updatedAt) && 
    isSameMonth(
      (i.purchasedAt?.toDate?.() || i.updatedAt?.toDate?.() || new Date(i.updatedAt || 0)), 
      currentDate
    )
  );

  const purchasedItems = historyItems.filter(i => i.status === 'purchased');
  // Discarded items are also part of history if needed, but typically stats focus on spent

  const totalSpent = purchasedItems.reduce((acc, item) => {
    return acc + (item.finalPrice || item.estimatedPrice || 0) * (item.quantity || 1);
  }, 0);

  const totalEstimated = pendingItems.reduce((acc, item) => {
    return acc + (item.estimatedPrice || 0) * (item.quantity || 1);
  }, 0);

  const categoryCounts = pendingItems.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {});

  const recentItems = [...historyItems]
    .sort((a, b) => {
      const dateA = a.updatedAt?.toDate?.() || new Date(a.updatedAt || 0);
      const dateB = b.updatedAt?.toDate?.() || new Date(b.updatedAt || 0);
      return dateB - dateA;
    })
    .slice(0, 5);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="container animate-fadeIn">
      <div className="flex flex-col gap-md mb-lg">
        <h1>
          Olá, {currentProfile.name}! 👋
        </h1>
        
        {/* Month Selector */}
        <div className="self-start">
          <MonthSelector 
            currentDate={currentDate} 
            onChange={setCurrentDate} 
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-4 mb-lg">
        <div className="stat-card">
          <span className="stat-value">{pendingItems.length}</span>
          <span className="stat-label">Itens Pendentes</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{purchasedItems.length}</span>
          <span className="stat-label">Comprados (Mês)</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">
            R$ {totalSpent.toFixed(2).replace('.', ',')}
          </span>
          <span className="stat-label">Gasto (Mês)</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">
            R$ {totalEstimated.toFixed(2).replace('.', ',')}
          </span>
          <span className="stat-label">Estimado Pendente</span>
        </div>
      </div>

      <div className="grid grid-2">
        {/* Categories (Pending Only) */}
        <div className="card">
          <h3 className="card-title mb-md">📂 Por Categoria (Pendentes)</h3>
          {Object.keys(categoryCounts).length === 0 ? (
            <p className="text-muted text-sm">Nenhum item pendente</p>
          ) : (
            <div className="flex flex-col gap-sm">
              {Object.entries(categoryCounts).map(([category, count]) => (
                <div key={category} className="flex justify-between items-center">
                  <span className={`category-${category.toLowerCase()}`}>
                    {getCategoryIcon(category)} {category}
                  </span>
                  <span className="badge badge-pending">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity (Selected Month) */}
        <div className="card">
          <h3 className="card-title mb-md">🕐 Atividade ({format(currentDate, 'MMM', { locale: ptBR })})</h3>
          {recentItems.length === 0 ? (
            <p className="text-muted text-sm">Nenhuma atividade neste mês</p>
          ) : (
            <div className="flex flex-col gap-sm">
              {recentItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">{item.name}</span>
                    <span className={`badge badge-${item.status} ml-sm`} style={{ marginLeft: '8px' }}>
                      {getStatusLabel(item.status)}
                    </span>
                  </div>
                  <span className="text-muted text-sm">
                    {formatDate(item.updatedAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      {items.length === 0 && (
        <div className="empty-state mt-lg">
          <div className="empty-state-icon">📝</div>
          <h3 className="empty-state-title">Comece agora!</h3>
          <p className="empty-state-text">
            Adicione seu primeiro item na aba "Itens"
          </p>
        </div>
      )}
    </div>
  );
}

function getCategoryIcon(category) {
  const icons = {
    'Mercado': '🛒',
    'Farmácia': '💊',
    'Casa': '🏠',
    'Lazer': '🎮',
    'Outros': '📦'
  };
  return icons[category] || '📦';
}

function getStatusLabel(status) {
  const labels = {
    'pending': 'Pendente',
    'purchased': 'Comprado',
    'discarded': 'Descartado'
  };
  return labels[status] || status;
}

function formatDate(timestamp) {
  if (!timestamp) return '';
  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, "dd/MM", { locale: ptBR });
  } catch {
    return '';
  }
}
