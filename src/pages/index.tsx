// // src/pages/index.tsx
// import { useState } from "react";
// import "./index.css";

// export const HomePage = () => {
//   const [selectedBird, setSelectedBird] = useState<string>("Молодняк");
//   const [selectedAge, setSelectedAge] = useState<string>("Молодняк до 18 недель");
  
//   // Виды птиц (Родительское стадо неактивно)
//   const birdTypes = [
//     { name: "Родительское стадо", active: false },
//     { name: "Молодняк", active: true },
//     { name: "Индейка", active: true },
//     { name: "Утки", active: true },
//     { name: "Гуси", active: true }
//   ];
  
//   // Возраст/стадия (Продуктивный период неактивен)
//   const ageStages = [
//     { name: "Продуктивный период", active: false },
//     { name: "Молодняк до 18 недель", active: true },
//     { name: "1-7 дней", active: true },
//     { name: "8-35 дней", active: true }
//   ];

//   const handleStart = () => {
//     console.log("Старт", { bird: selectedBird, age: selectedAge });
//   };

//   const handleStopReset = () => {
//     console.log("Стоп/Сброс");
//   };

//   return (
//     <div className="app-container">
//       <div className="main-container">
//         <h1 className="main-title">БЛОК СИСТЕМЫ УПРАВЛЕНИЯ ОСВЕЩЕНИЕМ ПТИЧНИКА</h1>
        
//         <div className="content-wrapper">
//           {/* Правая часть */}
//           <div className="right-panel">
//             <div className="buttons-container">
//               <button className="btn-start" onClick={handleStart}>
//                 Старт
//               </button>
//               <button className="btn-stop-reset" onClick={handleStopReset}>
//                 Стоп/Сброс
//               </button>
//             </div>

//             <div className="selection-section">
//               <h2 className="section-title">ВИД ПТИЦЫ</h2>
//               <div className="options-container">
//                 {birdTypes.map((bird) => (
//                   <button
//                     key={bird.name}
//                     className={`option-btn ${!bird.active ? 'disabled' : ''} ${selectedBird === bird.name && bird.active ? 'selected' : ''}`}
//                     onClick={() => bird.active && setSelectedBird(bird.name)}
//                     disabled={!bird.active}
//                   >
//                     {bird.name}
//                   </button>
//                 ))}
//               </div>
//             </div>

//             <div className="selection-section">
//               <h2 className="section-title">ВОЗРАСТ/СТАДИЯ</h2>
//               <div className="options-container">
//                 {ageStages.map((stage) => (
//                   <button
//                     key={stage.name}
//                     className={`option-btn ${!stage.active ? 'disabled' : ''} ${selectedAge === stage.name && stage.active ? 'selected' : ''}`}
//                     onClick={() => stage.active && setSelectedAge(stage.name)}
//                     disabled={!stage.active}
//                   >
//                     {stage.name}
//                   </button>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };