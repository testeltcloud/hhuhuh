import { useState, useEffect } from 'react';
import { useProfile } from '../contexts/ProfileContext';
import { itemsService } from '../services/itemsService';
import ItemCard from '../components/items/ItemCard';
import ItemForm from '../components/items/ItemForm';

const CATEGORIES = ['Todos', 'Mercado', 'Farmácia', 'Casa', 'Lazer', 'Outros'];
const PRIORITIES = ['Todas', 'Alta', 'Média', 'Baixa'];

export default function Items() {
  const { currentProfile } = useProfile();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('Todos');
  const [priorityFilter, setPriorityFilter] = useState('Todas');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (currentProfile) {
      loadItems();
    }
  }, [currentProfile]);

  const loadItems = async () => {
    try {
      const data = await itemsService.getByProfile(currentProfile.id);
      setItems(data.filter(i => i.status === 'pending'));
    } catch (error) {
      console.error('Error loading items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (itemData) => {
    try {
      const newItem = await itemsService.create({
        ...itemData,
        profileId: currentProfile.id
      });
      setItems(prev => [newItem, ...prev]);
      setShowForm(false);
    } catch (error) {
      console.error('Error creating item:', error);
    }
  };

  const handleUpdateItem = async (itemData) => {
    try {
      await itemsService.update(editingItem.id, itemData);
      setItems(prev => prev.map(i => 
        i.id === editingItem.id ? { ...i, ...itemData } : i
      ));
      setEditingItem(null);
      setShowForm(false);
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const handleStatusChange = async (itemId, newStatus) => {
    try {
      await itemsService.updateStatus(itemId, newStatus);
      if (newStatus !== 'pending') {
        setItems(prev => prev.filter(i => i.id !== itemId));
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDelete = async (itemId) => {
    if (window.confirm('Tem certeza que deseja excluir este item?')) {
      try {
        await itemsService.delete(itemId);
        setItems(prev => prev.filter(i => i.id !== itemId));
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingItem(null);
  };

  // Filter items
  const filteredItems = items.filter(item => {
    const matchesCategory = categoryFilter === 'Todos' || item.category === categoryFilter;
    const matchesPriority = priorityFilter === 'Todas' || 
      item.priority === priorityFilter.toLowerCase();
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesPriority && matchesSearch;
  });

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  const sortedItems = [...filteredItems].sort((a, b) => 
    (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2)
  );

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="container animate-fadeIn">
      <div className="flex justify-between items-center mb-lg">
        <h1>🛒 Itens para Comprar</h1>
        <span className="badge badge-pending">{items.length} itens</span>
      </div>

      {/* Search */}
      <input
        type="text"
        className="input mb-md"
        placeholder="🔍 Buscar itens..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* Filters */}
      <div className="filters">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`filter-chip ${categoryFilter === cat ? 'active' : ''}`}
            onClick={() => setCategoryFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="filters mb-md">
        {PRIORITIES.map(pri => (
          <button
            key={pri}
            className={`filter-chip ${priorityFilter === pri ? 'active' : ''}`}
            onClick={() => setPriorityFilter(pri)}
          >
            {pri === 'Todas' ? '🎯 ' : ''}{pri}
          </button>
        ))}
      </div>

      {/* Items List */}
      {sortedItems.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <h3 className="empty-state-title">
            {items.length === 0 ? 'Nenhum item pendente' : 'Nenhum item encontrado'}
          </h3>
          <p className="empty-state-text">
            {items.length === 0 
              ? 'Clique no botão + para adicionar seu primeiro item'
              : 'Tente mudar os filtros'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-md">
          {sortedItems.map(item => (
            <ItemCard
              key={item.id}
              item={item}
              onStatusChange={handleStatusChange}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* FAB */}
      <button className="fab" onClick={() => setShowForm(true)}>
        +
      </button>

      {/* Form Modal */}
      {showForm && (
        <ItemForm
          item={editingItem}
          onSubmit={editingItem ? handleUpdateItem : handleAddItem}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
}
