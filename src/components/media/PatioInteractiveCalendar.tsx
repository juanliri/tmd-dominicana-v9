import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Wrench, 
  HardHat, 
  Sparkles,
  Info
} from 'lucide-react';
import { 
  PATIO_TIME_SLOTS, 
  PATIO_TRACK_ZONES,
  checkSlotAvailability 
} from '../../services/patioBookingService';
import { 
  PatioTestDriveBooking, 
  PatioMachineAvailability, 
  PatioTimeSlotInfo 
} from '../../types';

interface PatioInteractiveCalendarProps {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
  selectedTimeSlotId: string;
  onSelectTimeSlot: (slot: PatioTimeSlotInfo) => void;
  selectedMachineId: string;
  bookings: PatioTestDriveBooking[];
  availabilityMap: Record<string, PatioMachineAvailability>;
}

export const PatioInteractiveCalendar: React.FC<PatioInteractiveCalendarProps> = ({
  selectedDate,
  onSelectDate,
  selectedTimeSlotId,
  onSelectTimeSlot,
  selectedMachineId,
  bookings,
  availabilityMap
}) => {
  // Calendar current browsing month
  const today = new Date();
  const [currentYear, setCurrentYear] = useState<number>(() => {
    return selectedDate ? parseInt(selectedDate.split('-')[0], 10) : today.getFullYear();
  });
  const [currentMonth, setCurrentMonth] = useState<number>(() => {
    return selectedDate ? parseInt(selectedDate.split('-')[1], 10) - 1 : today.getMonth();
  });

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  // Generate days in month
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();

  const daysList: { dayNumber: number; dateStr: string; isCurrentMonth: boolean; isPast: boolean; isSunday: boolean }[] = [];

  // Previous month padding
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const day = prevMonthDays - i;
    const m = currentMonth === 0 ? 12 : currentMonth;
    const y = currentMonth === 0 ? currentYear - 1 : currentYear;
    const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    daysList.push({
      dayNumber: day,
      dateStr,
      isCurrentMonth: false,
      isPast: true,
      isSunday: false
    });
  }

  // Current month days
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dateObj = new Date(currentYear, currentMonth, d);
    const isSunday = dateObj.getDay() === 0; // Patio Km 22 closed on Sundays
    const isPast = dateStr < todayStr;

    daysList.push({
      dayNumber: d,
      dateStr,
      isCurrentMonth: true,
      isPast,
      isSunday
    });
  }

  // Check machine status for selected machine
  const machineAvail = availabilityMap[selectedMachineId];

  // Quick jump helper
  const setQuickDate = (offsetDays: number) => {
    const target = new Date();
    target.setDate(target.getDate() + offsetDays);
    if (target.getDay() === 0) {
      // If Sunday, move to Monday
      target.setDate(target.getDate() + 1);
    }
    const dStr = `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, '0')}-${String(target.getDate()).padStart(2, '0')}`;
    setCurrentYear(target.getFullYear());
    setCurrentMonth(target.getMonth());
    onSelectDate(dStr);
  };

  return (
    <div className="space-y-3 font-mono">
      {/* Calendar Header & Quick Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-zinc-900 rounded-[5px] border border-zinc-800">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-black text-white uppercase font-display tracking-wider">
            {monthNames[currentMonth]} {currentYear}
          </span>
          <span className="px-1.5 py-0.5 rounded-[2px] text-[9px] font-black uppercase bg-amber-400/10 text-amber-400 border border-amber-400/20">
            PATIO KM 22 ACTIVO
          </span>
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setQuickDate(0)}
            className="px-2 py-1 rounded-[3px] text-[10px] font-bold bg-zinc-950 border border-zinc-800 text-zinc-300 hover:border-amber-400 hover:text-white transition-colors uppercase cursor-pointer"
          >
            HOY
          </button>
          <button
            type="button"
            onClick={() => setQuickDate(1)}
            className="px-2 py-1 rounded-[3px] text-[10px] font-bold bg-zinc-950 border border-zinc-800 text-zinc-300 hover:border-amber-400 hover:text-white transition-colors uppercase cursor-pointer"
          >
            MAÑANA
          </button>
          <button
            type="button"
            onClick={() => setQuickDate(3)}
            className="px-2 py-1 rounded-[3px] text-[10px] font-bold bg-zinc-950 border border-zinc-800 text-zinc-300 hover:border-amber-400 hover:text-white transition-colors uppercase cursor-pointer"
          >
            +3 DÍAS
          </button>

          <div className="h-4 w-px bg-zinc-800 mx-1" />

          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1 rounded-[3px] bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white cursor-pointer"
            title="Mes Anterior"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1 rounded-[3px] bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white cursor-pointer"
            title="Mes Siguiente"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Days Grid */}
      <div className="bg-zinc-900 rounded-[5px] border border-zinc-800 p-3 shadow-xs">
        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 mb-2 text-center">
          {daysOfWeek.map((dow, idx) => (
            <div 
              key={dow} 
              className={`text-[10px] font-black uppercase tracking-wider py-1 ${
                idx === 0 ? 'text-red-400' : 'text-zinc-500'
              }`}
            >
              {dow}
            </div>
          ))}
        </div>

        {/* Days cells */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {daysList.map((item, idx) => {
            const isSelected = item.dateStr === selectedDate;
            const isToday = item.dateStr === todayStr;
            
            // Calculate day bookings count
            const dayBookings = bookings.filter(b => b.date === item.dateStr && b.status !== 'cancelled');
            const hasBookings = dayBookings.length > 0;
            const isTargetMachineBooked = dayBookings.some(b => b.machineId === selectedMachineId);
            const isBlockedByMaintenance = machineAvail?.blockedDates?.includes(item.dateStr);

            let cellBg = 'bg-zinc-950 border border-zinc-800/80 text-zinc-300 hover:border-zinc-700';
            if (!item.isCurrentMonth) {
              cellBg = 'text-zinc-700 bg-transparent border border-transparent pointer-events-none';
            } else if (item.isSunday) {
              cellBg = 'text-zinc-600 bg-red-950/10 border border-red-900/20 cursor-not-allowed opacity-60';
            } else if (item.isPast) {
              cellBg = 'text-zinc-600 bg-zinc-950/40 border border-zinc-900 cursor-not-allowed opacity-40';
            } else if (isSelected) {
              cellBg = 'bg-amber-400 text-black font-black border border-amber-400 shadow-md ring-1 ring-amber-400 scale-[1.02]';
            } else if (isBlockedByMaintenance) {
              cellBg = 'bg-zinc-950 text-zinc-500 border border-dashed border-zinc-700';
            } else if (isToday) {
              cellBg = 'bg-amber-500/10 text-amber-400 font-bold border border-amber-400/50';
            }

            return (
              <button
                key={`${item.dateStr}_${idx}`}
                type="button"
                disabled={!item.isCurrentMonth || item.isSunday || item.isPast}
                onClick={() => onSelectDate(item.dateStr)}
                className={`relative h-10 rounded-[3px] flex flex-col items-center justify-center transition-all text-xs font-mono font-bold cursor-pointer ${cellBg}`}
              >
                <span>{item.dayNumber}</span>
                
                {/* Dots indicators */}
                {item.isCurrentMonth && !item.isPast && !item.isSunday && (
                  <div className="flex items-center gap-0.5 mt-0.5">
                    {isBlockedByMaintenance ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" title="Mantenimiento de Taller" />
                    ) : isTargetMachineBooked ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400" title="Equipo con turnos ocupados" />
                    ) : hasBookings ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="Pruebas programadas de otras máquinas" />
                    ) : (
                      <span className="w-1 h-1 rounded-full bg-emerald-400" title="Pista y Turnos 100% Disponibles" />
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-3 pt-2.5 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-2 text-[9px] text-zinc-500 uppercase">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>DISPONIBLE</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
            <span>TURNO OCUPADO</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
            <span>TALLER / MTTO</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-red-400 font-bold">DOM:</span>
            <span>CERRADO</span>
          </div>
        </div>
      </div>

      {/* Time Slots Selector for Selected Date */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>TURNOS EN PISTA ({selectedDate}):</span>
          </label>
          <span className="text-[10px] font-mono text-zinc-500 uppercase">
            90 MIN / PRUEBA
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {PATIO_TIME_SLOTS.map((slot) => {
            const availCheck = checkSlotAvailability(
              selectedMachineId,
              selectedDate,
              slot.id,
              bookings,
              availabilityMap
            );

            const isSelected = selectedTimeSlotId === slot.id;
            const isAvailable = availCheck.isAvailable;

            return (
              <button
                key={slot.id}
                type="button"
                disabled={!isAvailable}
                onClick={() => onSelectTimeSlot(slot)}
                className={`p-2.5 rounded-[3px] border text-left transition-all relative flex flex-col justify-between ${
                  isSelected
                    ? 'bg-amber-400/10 border-amber-400 ring-1 ring-amber-400'
                    : isAvailable
                    ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-zinc-300 cursor-pointer shadow-xs'
                    : 'bg-zinc-950 border-zinc-900 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-white font-mono">
                    {slot.label}
                  </span>
                  {isSelected ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                  ) : isAvailable ? (
                    <span className="px-1.5 py-0.5 rounded-[2px] text-[8px] font-black uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                      LIBRE
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded-[2px] text-[8px] font-black uppercase bg-red-500/15 text-red-400 border border-red-500/20">
                      OCUPADO
                    </span>
                  )}
                </div>

                <div className="mt-1 flex items-center justify-between text-[10px]">
                  <span className="text-zinc-500 uppercase font-mono">
                    TURNO {slot.period}
                  </span>
                  {availCheck.reason && (
                    <span className="text-[9px] text-zinc-500 truncate max-w-[140px] uppercase font-mono" title={availCheck.reason}>
                      {availCheck.reason}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
