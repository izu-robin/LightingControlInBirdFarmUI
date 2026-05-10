import { useState, useEffect, useRef } from "react";
import "./App.css";
interface TimeBlock {
  label: string;
  data: (number | null)[];
  lastValue: number | null;
  currentHour: number;
  isComplete: boolean;
}
function App() {
  const [selectedBird, setSelectedBird] = useState<string>("Молодняк");
  const [selectedAge, setSelectedAge] = useState<string>("Молодняк до 18 недель");
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isServerRunning, setIsServerRunning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [counterDays, setCounterDays] = useState<number>(1);
  
  const [duration, setDuration] = useState<string>("0");
  const [illumination, setIllumination] = useState<string>("0");
  const [dayLight, setDayLight] = useState<string>("0");
  const [dawn, setDawn] = useState<string>("0");
  const [sunset, setSunset] = useState<string>("0");
  
  const [lightsOn, setLightsOn] = useState<boolean[]>(Array(15).fill(true));
  const [activeTooltip, setActiveTooltip] = useState<{ blockIndex: number; text: string; x: number } | null>(null);
  
  // Каждый блок графика имеет свои уникальные данные
const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([
  { label: "1..3", data: Array(24).fill(null), lastValue: null, currentHour: 0, isComplete: false },
  { label: "4..10", data: Array(24).fill(null), lastValue: null, currentHour: 0, isComplete: false },
  { label: "11..21", data: Array(24).fill(null), lastValue: null, currentHour: 0, isComplete: false },
  { label: "22..23", data: Array(24).fill(null), lastValue: null, currentHour: 0, isComplete: false }
]);

  
  const [events, setEvents] = useState<any[]>([]);
  const [activeBlockIndex, setActiveBlockIndex] = useState<number>(0);
  const [globalCycleDay, setGlobalCycleDay] = useState<number>(1);
  
  // Refs
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const serverCheckRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isServerRunningRef = useRef(false);
  const isPausedRef = useRef(false);
const timeBlocksRef = useRef<TimeBlock[]>(timeBlocks);
  const activeBlockIndexRef = useRef(0);
  const globalCycleDayRef = useRef(1);
  
  const birdTypes = [
    { name: "Родительское стадо", active: false },
    { name: "Молодняк", active: true },
    { name: "Индейка", active: true },
    { name: "Утки", active: true },
    { name: "Гуси", active: true }
  ];
  
  const ageStages = [
    { name: "Продуктивный период", active: false },
    { name: "Молодняк до 18 недель", active: true },
    { name: "1-7 дней", active: true },
    { name: "8-35 дней", active: true }
  ];

  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Добавление события в журнал (только при изменении состояния)
  const addEventToLog = (blockLabel: string, hour: number, newValue: number, lastValue: number | null) => {
    // Если последнее значение такое же - НЕ ЗАПИСЫВАЕМ
    if (lastValue !== null && lastValue === newValue) {
      console.log(`Не записываем: час ${hour}, состояние не изменилось (${newValue} === ${lastValue})`);
      return;
    }
    
    const statusText = newValue === 1 ? 'включен' : 'выключен';
    
    const newEvent = {
      id: Date.now(),
      day: blockLabel,
      hour: hour,
      event: statusText,
      cycleDay: globalCycleDayRef.current,
      timestamp: new Date().toLocaleTimeString()
    };
    
    console.log(`Записываем: час ${hour}, состояние изменилось с ${lastValue} на ${newValue}`);
    setEvents(prev => [newEvent, ...prev].slice(0, 100));
  };

  // Проверка статуса сервера
  const checkServerStatus = async () => {
    try {
      const response = await fetch('http://localhost:8000/server.php?action=getStatus&hour=0');
      if (response.ok) {
        setIsConnected(true);
        return true;
      } else {
        setIsConnected(false);
        return false;
      }
    } catch (error) {
      setIsConnected(false);
      return false;
    }
  };

  // Получение данных для конкретного часа и блока
  const fetchHourDataForBlock = async (hour: number, blockIndex: number): Promise<number | null> => {
    if (!isServerRunningRef.current || isPausedRef.current) return null;
    
    try {
      const response = await fetch(`http://localhost:8000/server.php?action=getStatus&hour=${hour}&block=${blockIndex}`);
      const result = await response.json();
      
      if (result.success) {
        return result.value;
      }
    } catch (error) {
      setIsConnected(false);
    }
    return null;
  };

  // Проверка, все ли блоки завершили построение
  const checkAllBlocksComplete = () => {
    let allComplete = true;
    for (let i = 0; i < timeBlocksRef.current.length; i++) {
      if (!timeBlocksRef.current[i].isComplete) {
        allComplete = false;
        break;
      }
    }
    
    if (allComplete) {
      // Все блоки завершили построение - начинаем новый цикл
      const newCycleDay = globalCycleDayRef.current + 1;
      globalCycleDayRef.current = newCycleDay;
      setGlobalCycleDay(newCycleDay);
      
      // Сбрасываем все блоки для нового цикла
      setTimeBlocks(prevBlocks => {
        const newBlocks = [...prevBlocks];
        for (let i = 0; i < newBlocks.length; i++) {
          newBlocks[i].data = Array(24).fill(null);
          newBlocks[i].lastValue = null;
          newBlocks[i].currentHour = 0;
          newBlocks[i].isComplete = false;
        }
        return newBlocks;
      });
      
      // Начинаем с первого блока
      activeBlockIndexRef.current = 0;
      setActiveBlockIndex(0);
    }
  };

  // Построение следующего часа для текущего активного блока
  const buildNextHour = async () => {
    if (!isServerRunningRef.current || isPausedRef.current) return;
    
    const currentBlock = activeBlockIndexRef.current;
    const blockData = timeBlocksRef.current[currentBlock];
    
    if (!blockData || blockData.isComplete) {
      const nextBlock = currentBlock + 1;
      if (nextBlock < timeBlocksRef.current.length) {
        activeBlockIndexRef.current = nextBlock;
        setActiveBlockIndex(nextBlock);
      } else {
        checkAllBlocksComplete();
      }
      return;
    }
    
    const currentHour = blockData.currentHour;
    
    // Получаем значение для текущего часа этого блока
    const value = await fetchHourDataForBlock(currentHour, currentBlock);
    
    if (value !== null) {
      // Добавляем в журнал ТОЛЬКО если значение изменилось относительно ПОСЛЕДНЕГО ЗНАЧЕНИЯ
      addEventToLog(blockData.label, currentHour, value, blockData.lastValue);
      
      // Обновляем данные блока
      setTimeBlocks(prevBlocks => {
        const newBlocks = [...prevBlocks];
        newBlocks[currentBlock].data[currentHour] = value;
       newBlocks[currentBlock].lastValue  = value; // Сохраняем последнее значение
        
        // Обновляем текущий час
        const nextHour = currentHour + 1;
        if (nextHour >= 24) {
          newBlocks[currentBlock].isComplete = true;
          newBlocks[currentBlock].currentHour = 0;
        } else {
          newBlocks[currentBlock].currentHour = nextHour;
        }
        
        return newBlocks;
      });
      
      // Обновляем ref
      setTimeout(() => {
        timeBlocksRef.current = timeBlocks;
      }, 0);
    }
  };

  // Запуск периодической проверки сервера
  const startServerCheck = () => {
    if (serverCheckRef.current) clearInterval(serverCheckRef.current);
    
    serverCheckRef.current = setInterval(() => {
      checkServerStatus();
    }, 2000);
  };

  const handleStart = () => {
    if (isServerRunningRef.current) return;
    
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    setIsServerRunning(true);
    isServerRunningRef.current = true;
    setIsPaused(false);
    isPausedRef.current = false;
    setGlobalCycleDay(1);
    globalCycleDayRef.current = 1;
    setActiveBlockIndex(0);
    activeBlockIndexRef.current = 0;
    
    setTimeBlocks(prev => {
      const newBlocks = [...prev];
      for (let i = 0; i < newBlocks.length; i++) {
        newBlocks[i].data = Array(24).fill(null);
        newBlocks[i].lastValue = null;
        newBlocks[i].currentHour = 0;
        newBlocks[i].isComplete = false;
      }
      return newBlocks;
    });
    
    setEvents([]);
    
    startServerCheck();
    checkServerStatus();
    
    intervalRef.current = setInterval(() => {
      buildNextHour();
    }, 1000);
  };
  
  const handleStopReset = () => {
    if (!isPausedRef.current && isServerRunningRef.current) {
      setIsPaused(true);
      isPausedRef.current = true;
      setIsServerRunning(false);
      isServerRunningRef.current = false;
      
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
    } else {
      setIsPaused(false);
      isPausedRef.current = false;
      setIsServerRunning(false);
      isServerRunningRef.current = false;
      setIsConnected(false);
      setGlobalCycleDay(1);
      globalCycleDayRef.current = 1;
      setActiveBlockIndex(0);
      activeBlockIndexRef.current = 0;
      
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (serverCheckRef.current) clearInterval(serverCheckRef.current);
      intervalRef.current = null;
      serverCheckRef.current = null;
      
      setTimeBlocks(prev => {
        const newBlocks = [...prev];
        for (let i = 0; i < newBlocks.length; i++) {
          newBlocks[i].data = Array(24).fill(null);
          newBlocks[i].lastValue = null;
          newBlocks[i].currentHour = 0;
          newBlocks[i].isComplete = false;
        }
        return newBlocks;
      });
      
      setEvents([]);
    }
  };

  const toggleLight = (index: number) => {
    setLightsOn(prev => {
      const newState = [...prev];
      newState[index] = !newState[index];
      return newState;
    });
  };

  const getTooltipText = (blockIndex: number, mouseX: number, rectWidth: number) => {
    const block = timeBlocks[blockIndex];
    const hourIndex = Math.floor((mouseX / rectWidth) * 24);
    
    if (hourIndex < 0 || hourIndex >= 24) return null;
    
    const value = block.data[hourIndex];
    
    if (value === 1) {
      let startHour = hourIndex;
      let endHour = hourIndex;
      
      for (let i = hourIndex; i >= 0; i--) {
        if (block.data[i] === 1) startHour = i;
        else break;
      }
      
      for (let i = hourIndex; i < block.data.length; i++) {
        if (block.data[i] === 1) endHour = i;
        else break;
      }
      
      const hoursCount = endHour - startHour + 1;
      const hoursText = hoursCount === 1 ? `${hoursCount} час` : `${hoursCount} часов`;
      
      return { text: `свет включен с ${startHour} по ${endHour} (${hoursText})`, x: mouseX };
    } else if (value === 0) {
      return { text: `свет выключен в ${hourIndex} час`, x: mouseX };
    }
    
    return null;
  };

  const handleAddOperation = () => console.log("Добавить операцию");
  const handleSaveOperation = () => console.log("Сохранить операцию");
  const handleDeleteOperation = () => console.log("Удалить операцию");
  const handleManualMode = () => console.log("Ручной режим");
  const toggleConnection = () => setIsConnected(!isConnected);

  const getCurrentBuildInfo = () => {
    if (activeBlockIndexRef.current < timeBlocks.length) {
      const block = timeBlocks[activeBlockIndexRef.current];
      return `${block.label} шкала: час ${block.currentHour}/23`;
    }
    return "Построение завершено";
  };

  useEffect(() => {
    timeBlocksRef.current = timeBlocks;
  }, [timeBlocks]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (serverCheckRef.current) clearInterval(serverCheckRef.current);
    };
  }, []);

  return (
    <div className="app-container">
      <div className="main-container">
        <h1 className="main-title">БЛОК СИСТЕМЫ УПРАВЛЕНИЯ ОСВЕЩЕНИЕМ ПТИЧНИКА</h1>
        
        <div className="inner-content">
          <div className="left-half">
            <div className="lighting-control-block">
              <div className="poles-stack">
                <div className="pole-with-lamps">
                  <img src="/Vector 301 (1).png" alt="Черная палка" className="pole-image" />
                  <div className="lamps-container">
                    {[0, 1, 2, 3, 4].map((idx) => {
                      const globalIndex = idx;
                      return (
                        <div key={idx} className="lamp-item" onClick={() => toggleLight(globalIndex)}>
                          <div className="small-stick"></div>
                          <div className="flashlight-container">
                            <img src="/Group 60.png" alt="Фонарик" className="flashlight-off-img" />
                            {lightsOn[globalIndex] && (
                              <img src="/Rectangle 5447.png" alt="Свет" className="flashlight-light-img" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pole-with-lamps">
                  <img src="/Vector 301 (1).png" alt="Черная палка" className="pole-image" />
                  <div className="lamps-container">
                    {[0, 1, 2, 3, 4].map((idx) => {
                      const globalIndex = 5 + idx;
                      return (
                        <div key={idx} className="lamp-item" onClick={() => toggleLight(globalIndex)}>
                          <div className="small-stick"></div>
                          <div className="flashlight-container">
                            <img src="/Group 60.png" alt="Фонарик" className="flashlight-off-img" />
                            {lightsOn[globalIndex] && (
                              <img src="/Rectangle 5447.png" alt="Свет" className="flashlight-light-img" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pole-with-lamps">
                  <img src="/Vector 301 (1).png" alt="Черная палка" className="pole-image" />
                  <div className="lamps-container">
                    {[0, 1, 2, 3, 4].map((idx) => {
                      const globalIndex = 10 + idx;
                      return (
                        <div key={idx} className="lamp-item" onClick={() => toggleLight(globalIndex)}>
                          <div className="small-stick"></div>
                          <div className="flashlight-container">
                            <img src="/Group 60.png" alt="Фонарик" className="flashlight-off-img" />
                            {lightsOn[globalIndex] && (
                              <img src="/Rectangle 5447.png" alt="Свет" className="flashlight-light-img" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="panel-bottom">
                  <img src="/Group 731.png" alt="Пульт" className="panel-image" />
                </div>
              </div>

              <div className="wires-right">
                <img src="/Vector 305.png" alt="Провода" className="wires-image" />
              </div>
            </div>

            <div className="days-hours-table">
              <div className="days-hours-container">
                <div className="days-column">
                  <div className="day-header">ДЕНЬ</div>
                  {timeBlocks.map((block, idx) => (
                    <div 
                      key={idx} 
                      className="time-label"
                      style={{
                        background: activeBlockIndex === idx && isServerRunning ? '#F36035' : 'transparent',
                        color: activeBlockIndex === idx && isServerRunning ? 'white' : 'black',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {block.label}
                    </div>
                  ))}
                </div>

                <div className="charts-column">
                  <div className="hours-header">
                    <div className="hours-title">
                      ЧАСЫ (построение: {getCurrentBuildInfo()})
                    </div>
                    <div className="hours-scale">
                      {hours.map((hour) => (
                        <div key={hour} className="hour-segment">
                          {hour}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="charts-wrapper">
                    {timeBlocks.map((block, blockIdx) => (
                      <div 
                        key={blockIdx} 
                        className="chart-row"
                        style={{
                          opacity: blockIdx === activeBlockIndex && isServerRunning && !block.isComplete ? 1 : 0.7,
                          transition: 'opacity 0.3s ease'
                        }}
                        onMouseMove={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const x = e.clientX - rect.left;
                          const tooltipData = getTooltipText(blockIdx, x, rect.width);
                          if (tooltipData) {
                            setActiveTooltip({ blockIndex: blockIdx, text: tooltipData.text, x: tooltipData.x });
                          } else {
                            setActiveTooltip(null);
                          }
                        }}
                        onMouseLeave={() => {
                          setActiveTooltip(null);
                        }}
                      >
                        <svg className="row-svg" viewBox="0 0 800 30" preserveAspectRatio="none">
                          <polyline
                            points={(() => {
                              const points = [];
                              for (let i = 0; i <= block.data.length; i++) {
                                let x, y;
                                if (i === 0) {
                                  x = 0;
                                  y = block.data[0] === 1 ? 5 : (block.data[0] === 0 ? 25 : 15);
                                  points.push(`${x},${y}`);
                                }
                                
                                if (i < block.data.length) {
                                  x = i * (800 / 24);
                                  
                                  if (i > 0 && block.data[i] !== block.data[i - 1]) {
                                    if (block.data[i] === 1) {
                                      points.push(`${x},25`);
                                      points.push(`${x},5`);
                                    } else if (block.data[i] === 0) {
                                      points.push(`${x},5`);
                                      points.push(`${x},25`);
                                    }
                                  }
                                  
                                  y = block.data[i] === 1 ? 5 : (block.data[i] === 0 ? 25 : 15);
                                  points.push(`${x},${y}`);
                                }
                              }
                              return points.join(' ');
                            })()}
                            fill="none"
                            stroke="#B999EC"
                            strokeWidth="2"
                            strokeLinejoin="miter"
                            strokeLinecap="butt"
                          />
                          <polygon
                            points={`0,30 ${(() => {
                              const points = [];
                              for (let i = 0; i <= block.data.length; i++) {
                                let x, y;
                                if (i === 0) {
                                  x = 0;
                                  y = block.data[0] === 1 ? 5 : (block.data[0] === 0 ? 25 : 15);
                                  points.push(`${x},${y}`);
                                }
                                
                                if (i < block.data.length) {
                                  x = i * (800 / 24);
                                  
                                  if (i > 0 && block.data[i] !== block.data[i - 1]) {
                                    if (block.data[i] === 1) {
                                      points.push(`${x},25`);
                                      points.push(`${x},5`);
                                    } else if (block.data[i] === 0) {
                                      points.push(`${x},5`);
                                      points.push(`${x},25`);
                                    }
                                  }
                                  
                                  y = block.data[i] === 1 ? 5 : (block.data[i] === 0 ? 25 : 15);
                                  points.push(`${x},${y}`);
                                }
                              }
                              return points.join(' ');
                            })()} 800,30`}
                            fill="rgba(185, 153, 236, 0.25)"
                          />
                        </svg>
                        {activeTooltip && activeTooltip.blockIndex === blockIdx && (
                          <div 
                            className="chart-tooltip"
                            style={{ left: `${activeTooltip.x}px` }}
                          >
                            {activeTooltip.text}
                          </div>
                        )}
                        {block.isComplete && (
                          <div className="block-complete-badge">
                            ✓
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bottom-control-panel">
                <button className="manual-mode-btn" onClick={handleManualMode}>
                  Ручной режим
                </button>
                <div className="connection-status">
                  <div 
                    className={`status-circle ${isConnected ? 'connected' : 'disconnected'}`}
                    onClick={toggleConnection}
                  ></div>
                  <span className="status-text">
                    Стенд {isConnected ? 'Подключен' : 'Отключен'}
                  </span>
                </div>
              </div>

              <div className="event-log">
                <div className="event-log-header">
                  ЖУРНАЛ СОБЫТИЙ (Цикл {globalCycleDay})
                </div>
                <div className="event-log-table">
                  <div className="event-table-header">
                    <div className="col-1">День</div>
                    <div className="col-2">Час</div>
                    <div className="col-3">Событие</div>
                    <div className="col-4">День цикла</div>
                  </div>
                  <div className="event-table-body">
                    {events.map((event, idx) => (
                      <div key={idx} className="event-table-row">
                        <div className="col-1">{event.day}</div>
                        <div className="col-2">{event.hour}</div>
                        <div className="col-3">{event.event}</div>
                        <div className="col-4">{event.cycleDay}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="right-panel">
            <div className="buttons-container">
              <button className="btn-start" onClick={handleStart}>Старт</button>
              <button className="btn-stop-reset" onClick={handleStopReset}>Стоп/Сброс</button>
            </div>

            <div className="selection-section">
              <h2 className="section-title">ВИД ПТИЦЫ</h2>
              <div className="options-container">
                {birdTypes.map((bird) => (
                  <button
                    key={bird.name}
                    className={`option-btn ${!bird.active ? 'disabled' : ''} ${selectedBird === bird.name && bird.active ? 'selected' : ''}`}
                    onClick={() => bird.active && setSelectedBird(bird.name)}
                    disabled={!bird.active}
                  >
                    {bird.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="selection-section">
              <h2 className="section-title">ВОЗРАСТ/СТАДИЯ</h2>
              <div className="options-container">
                {ageStages.map((stage) => (
                  <button
                    key={stage.name}
                    className={`option-btn ${!stage.active ? 'disabled' : ''} ${selectedAge === stage.name && stage.active ? 'selected' : ''}`}
                    onClick={() => stage.active && setSelectedAge(stage.name)}
                    disabled={!stage.active}
                  >
                    {stage.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="program-container">
              <h3 className="program-title">ПРОГРАММА №1</h3>
              <div className="program-blocks">
                <div className="program-row">
                  <div className="program-block">
                    <div className="block-title">Длительность программы (день)</div>
                    <div className="block-input">
                      <span className="min-value">0</span>
                      <input type="number" className="number-input" value={duration} onChange={(e) => {
                        let value = parseInt(e.target.value);
                        if (isNaN(value)) value = 0;
                        if (value < 0) value = 0;
                        if (value > 100) value = 100;
                        setDuration(value.toString());
                      }} min="0" max="100"/>
                      <span className="max-value">100</span>
                    </div>
                  </div>
                  <div className="program-block">
                    <div className="block-title">Освещенность (лк)</div>
                    <div className="block-input">
                      <span className="min-value">0</span>
                      <input type="number" className="number-input" value={illumination} onChange={(e) => {
                        let value = parseInt(e.target.value);
                        if (isNaN(value)) value = 0;
                        if (value < 0) value = 0;
                        if (value > 100) value = 100;
                        setIllumination(value.toString());
                      }} min="0" max="100"/>
                      <span className="max-value">100</span>
                    </div>
                  </div>
                </div>
                <div className="program-row">
                  <div className="program-block">
                    <div className="block-title">Световой день (ч)</div>
                    <div className="block-input">
                      <span className="min-value">0</span>
                      <input type="number" className="number-input" value={dayLight} onChange={(e) => {
                        let value = parseInt(e.target.value);
                        if (isNaN(value)) value = 0;
                        if (value < 0) value = 0;
                        if (value > 24) value = 24;
                        setDayLight(value.toString());
                      }} min="0" max="24"/>
                      <span className="max-value">24</span>
                    </div>
                  </div>
                  <div className="program-block">
                    <div className="block-title">Рассвет (ч)</div>
                    <div className="block-input">
                      <span className="min-value">0</span>
                      <input type="number" className="number-input" value={dawn} onChange={(e) => {
                        let value = parseInt(e.target.value);
                        if (isNaN(value)) value = 0;
                        if (value < 0) value = 0;
                        if (value > 24) value = 24;
                        setDawn(value.toString());
                      }} min="0" max="24"/>
                      <span className="max-value">24</span>
                    </div>
                  </div>
                </div>
                <div className="program-row">
                  <div className="program-block">
                    <div className="block-title">Закат (ч)</div>
                    <div className="block-input">
                      <span className="min-value">0</span>
                      <input type="number" className="number-input" value={sunset} onChange={(e) => {
                        let value = parseInt(e.target.value);
                        if (isNaN(value)) value = 0;
                        if (value < 0) value = 0;
                        if (value > 24) value = 24;
                        setSunset(value.toString());
                      }} min="0" max="24"/>
                      <span className="max-value">24</span>
                    </div>
                  </div>
                  <div className="buttons-block">
                    <button className="action-btn add-btn" onClick={handleAddOperation}>Добавить операцию</button>
                    <button className="action-btn save-btn" onClick={handleSaveOperation}>Сохранить операцию</button>
                    <button className="action-btn delete-btn" onClick={handleDeleteOperation}>Удалить операцию</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;