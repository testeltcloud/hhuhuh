import { format, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function MonthSelector({ currentDate, onChange }) {
  const handlePrevMonth = () => {
    onChange(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    onChange(addMonths(currentDate, 1));
  };

  return (
    <div className="flex items-center gap-md bg-secondary rounded-lg p-sm border border-border shadow-sm">
      <button 
        className="btn btn-ghost btn-icon" 
        onClick={handlePrevMonth}
        title="Mês anterior"
      >
        ◀
      </button>
      
      <div className="flex flex-col items-center min-w-[150px]">
        <span className="text-lg font-bold capitalize">
          {format(currentDate, 'MMMM', { locale: ptBR })}
        </span>
        <span className="text-xs text-muted">
          {format(currentDate, 'yyyy', { locale: ptBR })}
        </span>
      </div>

      <button 
        className="btn btn-ghost btn-icon" 
        onClick={handleNextMonth}
        title="Próximo mês"
      >
        ▶
      </button>
    </div>
  );
}
