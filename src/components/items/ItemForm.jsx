import { useState } from 'react';

const CATEGORIES = ['Mercado', 'Farmácia', 'Casa', 'Lazer', 'Outros'];
const PRIORITIES = [
  { value: 'high', label: 'Alta', color: 'var(--danger)' },
  { value: 'medium', label: 'Média', color: 'var(--warning)' },
  { value: 'low', label: 'Baixa', color: 'var(--success)' },
];

export default function ItemForm({ item, onSubmit, onClose }) {
  const [formData, setFormData] = useState({
    name: item?.name || '',
    category: item?.category || 'Mercado',
    quantity: item?.quantity || 1,
    estimatedPrice: item?.estimatedPrice || '',
    priority: item?.priority || 'medium',
    notes: item?.notes || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' ? parseInt(value) || 1 : 
               name === 'estimatedPrice' ? parseFloat(value) || '' : 
               value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        estimatedPrice: formData.estimatedPrice || 0
      });
    } catch (error) {
      console.error('Error submitting item:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {item ? '✏️ Editar Item' : '➕ Novo Item'}
          </h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="input-group mb-md">
              <label htmlFor="name">Nome do Item *</label>
              <input
                id="name"
                name="name"
                type="text"
                className="input"
                placeholder="Ex: Arroz, Leite, etc."
                value={formData.name}
                onChange={handleChange}
                autoFocus
              />
            </div>

            <div className="input-group mb-md">
              <label htmlFor="category">Categoria</label>
              <select
                id="category"
                name="category"
                className="input select"
                value={formData.category}
                onChange={handleChange}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-2 gap-md mb-md">
              <div className="input-group">
                <label htmlFor="quantity">Quantidade</label>
                <input
                  id="quantity"
                  name="quantity"
                  type="number"
                  className="input"
                  min="1"
                  value={formData.quantity}
                  onChange={handleChange}
                />
              </div>

              <div className="input-group">
                <label htmlFor="estimatedPrice">Preço Estimado (R$)</label>
                <input
                  id="estimatedPrice"
                  name="estimatedPrice"
                  type="number"
                  className="input"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  value={formData.estimatedPrice}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="input-group mb-md">
              <label>Prioridade</label>
              <div className="flex gap-sm">
                {PRIORITIES.map(pri => (
                  <button
                    key={pri.value}
                    type="button"
                    className={`btn ${formData.priority === pri.value ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ 
                      flex: 1,
                      background: formData.priority === pri.value ? pri.color : undefined
                    }}
                    onClick={() => setFormData(prev => ({ ...prev, priority: pri.value }))}
                  >
                    {pri.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="notes">Observações</label>
              <textarea
                id="notes"
                name="notes"
                className="input"
                rows="3"
                placeholder="Notas adicionais..."
                value={formData.notes}
                onChange={handleChange}
                style={{ resize: 'vertical' }}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!formData.name.trim() || isSubmitting}
            >
              {isSubmitting ? 'Salvando...' : item ? 'Salvar' : 'Adicionar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
