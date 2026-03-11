import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

const DatePicker = ({ label, value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef(null);
  const [dropdownStyle, setDropdownStyle] = useState({});

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: 'fixed',
        top: `${rect.bottom + 8}px`,
        left: `${rect.left}px`,
        width: `${Math.max(rect.width, 240)}px`,
        zIndex: 9999
      });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleScrollResize = (e) => {
      if (isOpen) {
        if (e.type === 'scroll' && e.target.closest && e.target.closest('.datepicker-dropdown')) {
          return;
        }
        setIsOpen(false);
      }
    };
    if (isOpen) {
      window.addEventListener("scroll", handleScrollResize, true);
      window.addEventListener("resize", handleScrollResize, true);
    }
    return () => {
      window.removeEventListener("scroll", handleScrollResize, true);
      window.removeEventListener("resize", handleScrollResize, true);
    };
  }, [isOpen]);

  const [currentMonth, setCurrentMonth] = useState(() => {
    if (!value) return new Date();
    const [y, m, d] = value.split("-").map(Number);
    return new Date(y, m - 1, d || 1);
  });
  const [view, setView] = useState("days");

  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const handlePrevMonth = (e) => {
    e.stopPropagation();
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1),
    );
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1),
    );
  };

  const handleDateSelect = (day) => {
    const y = currentMonth.getFullYear();
    const m = String(currentMonth.getMonth() + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    const dateStr = `${y}-${m}-${d}`;
    onChange(dateStr);
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange("");
    setIsOpen(false);
  };

  const handleToday = (e) => {
    e.stopPropagation();
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    const dateStr = `${y}-${m}-${d}`;
    onChange(dateStr);
    setIsOpen(false);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${day}-${month}-${year}`;
  };

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const totalDays = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);
    const days = [];

    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-7" />);
    }

    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const isSelected = value === dateStr;
      const now = new Date();
      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
      const isTodayDate = todayStr === dateStr;

      days.push(
        <button
          key={d}
          onClick={(e) => {
            e.stopPropagation();
            handleDateSelect(d);
          }}
          type="button"
          className={`h-7 w-7 flex items-center justify-center rounded-lg text-[10px] font-bold transition-all ${
            isSelected
              ? "bg-[#18254D] text-white shadow-md shadow-[#18254D]/20 scale-110"
              : isTodayDate
                ? "bg-slate-100 text-[#18254D] border border-[#18254D]/20"
                : "text-slate-600 hover:bg-slate-50 hover:text-[#18254D]"
          }`}
        >
          {d}
        </button>,
      );
    }
    return days;
  };

  const renderYearMonthPicker = () => {
    const years = [];
    const currentYear = new Date().getFullYear();
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    for (let y = currentYear - 10; y <= currentYear + 10; y++) {
      const isExpanded = currentMonth.getFullYear() === y;
      years.push(
        <div
          key={y}
          className="flex flex-col border-b border-slate-50 last:border-0"
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setCurrentMonth(new Date(y, currentMonth.getMonth(), 1));
            }}
            className={`w-full text-left px-3 py-2 text-[10px] font-bold transition-all ${
              isExpanded
                ? "bg-slate-50 text-[#18254D]"
                : "text-slate-400 hover:bg-slate-50 hover:text-[#18254D]"
            }`}
          >
            {y}
          </button>
          {isExpanded && (
            <div className="grid grid-cols-4 gap-1 p-2 bg-white animate-fade-in">
              {months.map((m, idx) => (
                <button
                  key={m}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentMonth(new Date(y, idx, 1));
                    setView("days");
                  }}
                  className={`py-2 rounded-lg text-[9px] font-bold transition-all ${
                    currentMonth.getMonth() === idx
                      ? "bg-[#18254D] text-white shadow-md shadow-[#18254D]/20"
                      : "text-slate-500 hover:bg-slate-50 hover:text-[#18254D]"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          )}
        </div>,
      );
    }
    return (
      <div className="flex flex-col max-h-[180px] overflow-y-auto custom-scrollbar pr-1 border border-slate-100 rounded-lg">
        {years}
      </div>
    );
  };

  return (
    <div className="relative w-full group">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`datepicker-trigger w-full h-[38px] grid ${label ? "grid-cols-[auto_1fr_auto]" : "grid-cols-[1fr_auto]"} items-center gap-2 px-3 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-bold text-[#18254D] focus:outline-none focus:ring-4 focus:ring-[#18254D]/10 hover:bg-white hover:border-slate-200 transition-all shadow-sm shadow-slate-200/50`}
      >
        {label && (
          <div className="flex items-center justify-start min-w-[35px]">
            <span className="uppercase tracking-tighter text-[#18254D]/80 truncate">
              {label}:
            </span>
          </div>
        )}
        <div
          className={`flex items-center ${label ? "justify-center" : "justify-start"} min-w-0`}
        >
          <span className="truncate">
            {value ? formatDate(value) : placeholder || "dd-mm-yyyy"}
          </span>
        </div>
        <div className="flex items-center justify-end gap-1.5 shrink-0 min-w-[35px]">
          <Calendar size={13} className="text-[#18254D]/60" />
          {value && (
            <div
              onClick={handleClear}
              className="p-1 hover:text-error transition-colors"
            >
              <X size={12} />
            </div>
          )}
        </div>
      </button>

      {isOpen && createPortal(
        <>
          <div
            className="fixed inset-0 z-[9998]"
            onClick={() => setIsOpen(false)}
          />
          <div 
            className="datepicker-dropdown bg-white border border-slate-100 rounded-2xl shadow-2xl z-[9999] overflow-hidden animate-fade-in-up origin-top p-3"
            style={dropdownStyle}
          >
            <div className="flex items-center justify-between mb-3 px-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1 hover:bg-slate-50 rounded-lg text-[#18254D] transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setView(view === "days" ? "years" : "days");
                }}
                className="flex items-center gap-1 px-2 py-1 hover:bg-slate-50 rounded-lg transition-colors group"
              >
                <span className="text-[11px] font-bold text-[#18254D] tracking-wide">
                  {currentMonth.toLocaleString("default", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
                <ChevronDown
                  size={12}
                  className={`text-[#18254D]/40 group-hover:text-[#18254D] transition-transform ${view === "years" ? "rotate-180" : ""}`}
                />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1 hover:bg-slate-50 rounded-lg text-[#18254D] transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {view === "days" ? (
              <>
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                    <div
                      key={day}
                      className="text-center text-[9px] font-bold text-slate-400 uppercase"
                    >
                      {day}
                    </div>
                  ))}
                  {renderCalendar()}
                </div>
              </>
            ) : (
              renderYearMonthPicker()
            )}

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
              <button
                type="button"
                onClick={handleClear}
                className="text-[10px] font-bold text-slate-400 hover:text-error transition-colors px-2 py-1"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={handleToday}
                className="text-[10px] font-bold text-[#18254D] hover:bg-slate-50 px-2 py-1 rounded-lg transition-colors"
              >
                Today
              </button>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
};

export default DatePicker;
