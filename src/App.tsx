import { useState } from "react";
import "./App.css";

function App() {
  const [selectedBird, setSelectedBird] = useState<string>("Молодняк");
  const [selectedAge, setSelectedAge] = useState<string>("Молодняк до 18 недель");
  const [isConnected, setIsConnected] = useState<boolean>(true);
  
  const [duration, setDuration] = useState<string>("0");
  const [illumination, setIllumination] = useState<string>("0");
  const [dayLight, setDayLight] = useState<string>("0");
  const [dawn, setDawn] = useState<string>("0");
  const [sunset, setSunset] = useState<string>("0");
  
  const [lightsOn, setLightsOn] = useState<boolean[]>(Array(15).fill(true));
  
  const [events] = useState([
    { id: 1, col1: "Текст", col2: "Текст", col3: "Текст", col4: "Текст" },
    { id: 2, col1: "Текст", col2: "Текст", col3: "Текст", col4: "Текст" },
    { id: 3, col1: "Текст", col2: "Текст", col3: "Текст", col4: "Текст" },
    { id: 4, col1: "Текст", col2: "Текст", col3: "Текст", col4: "Текст" },
    { id: 5, col1: "Текст", col2: "Текст", col3: "Текст", col4: "Текст" },
    { id: 6, col1: "Текст", col2: "Текст", col3: "Текст", col4: "Текст" },
    { id: 7, col1: "Текст", col2: "Текст", col3: "Текст", col4: "Текст" },
    { id: 8, col1: "Текст", col2: "Текст", col3: "Текст", col4: "Текст" },
    { id: 9, col1: "Текст", col2: "Текст", col3: "Текст", col4: "Текст" },
    { id: 10, col1: "Текст", col2: "Текст", col3: "Текст", col4: "Текст" },
    { id: 11, col1: "Текст", col2: "Текст", col3: "Текст", col4: "Текст" },
    { id: 12, col1: "Текст", col2: "Текст", col3: "Текст", col4: "Текст" },
    { id: 13, col1: "Текст", col2: "Текст", col3: "Текст", col4: "Текст" },
    { id: 14, col1: "Текст", col2: "Текст", col3: "Текст", col4: "Текст" }
  ]);
  
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

  const timeBlocks = [
    { label: "1..3", data: [0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1] },
    { label: "4..10", data: [0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0] },
    { label: "11..21", data: [0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0] },
    { label: "22..23", data: [0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0] }
  ];

  const hours = Array.from({ length: 24 }, (_, i) => i);

  const toggleLight = (index: number) => {
    setLightsOn(prev => {
      const newState = [...prev];
      newState[index] = !newState[index];
      return newState;
    });
  };

  const handleStart = () => console.log("Старт");
  const handleStopReset = () => console.log("Стоп/Сброс");
  const handleAddOperation = () => console.log("Добавить операцию");
  const handleSaveOperation = () => console.log("Сохранить операцию");
  const handleDeleteOperation = () => console.log("Удалить операцию");
  const handleManualMode = () => console.log("Ручной режим");
  const toggleConnection = () => setIsConnected(!isConnected);

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
                    <div key={idx} className="time-label">
                      {block.label}
                    </div>
                  ))}
                </div>

                <div className="charts-column">
                  <div className="hours-header">
                    <div className="hours-title">ЧАСЫ</div>
                    <div className="hours-scale">
                      {hours.map((hour) => (
                        <div key={hour} className="hour-segment">
                          {hour}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="charts-wrapper">
                    {timeBlocks.map((block, idx) => (
                      <div key={idx} className="chart-row">
                        <svg className="row-svg" viewBox="0 0 800 30" preserveAspectRatio="none">
                          <polyline
                            points={block.data.map((value, index) => {
                              const x = (index * (800 / 23));
                              const y = value === 1 ? 5 : 25;
                              return `${x},${y}`;
                            }).join(' ')}
                            fill="none"
                            stroke="#B999EC"
                            strokeWidth="2"
                          />
                          <polygon
                            points={`0,30 ${block.data.map((value, index) => {
                              const x = (index * (800 / 23));
                              const y = value === 1 ? 5 : 25;
                              return `${x},${y}`;
                            }).join(' ')} 800,30`}
                            fill="rgba(185, 153, 236, 0.25)"
                          />
                        </svg>
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
                  ЖУРНАЛ СОБЫТИЙ
                </div>
                <div className="event-log-table">
                  <div className="event-table-header">
                    <div className="col-1">Название</div>
                    <div className="col-2">Название</div>
                    <div className="col-3">Название</div>
                    <div className="col-4">Название</div>
                  </div>
                  <div className="event-table-body">
                    {events.map((event) => (
                      <div key={event.id} className="event-table-row">
                        <div className="col-1">{event.col1}</div>
                        <div className="col-2">{event.col2}</div>
                        <div className="col-3">{event.col3}</div>
                        <div className="col-4">{event.col4}</div>
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