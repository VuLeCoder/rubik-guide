import { Step } from './types';

export const STEPS: Step[] = [
  { 
    id: 1, 
    title: "B1: Dấu cộng trắng", 
    subSteps: [
      { 
        title: "Làm bông hoa cúc", 
        content: "Đưa 4 viên cạnh trắng về quanh tâm vàng ở mặt trên. Không cần quan tâm màu các mặt bên. Mục tiêu là tạo ra hình bông hoa cúc.",
      },
      { 
        title: "Tạo dấu cộng trắng", 
        content: "Xoay mặt trên (U) để màu cạnh trùng với tâm mặt bên, sau đó xoay mặt đó 180 độ (F2, R2...) để đưa về mặt trắng.",
      }
    ],
    color: "bg-slate-400", 
    border: "border-slate-400" 
  },
  { 
    id: 2, 
    title: "B2: Tầng 1", 
    subSteps: [
      {
        title: "Hoàn thiện mặt trắng",
        content: "Đưa các góc trắng về đúng vị trí. Hướng mặt trắng xuống dưới (đối diện mặt vàng). Tìm viên góc có màu trắng ở tầng 3 và đưa về phía trên vị trí nó cần xuống.",
        cases: [
          {
            id: 1,
            title: "Trường hợp 1: Mặt trắng sang phải",
            content: "Viên góc ở tầng 3, mặt trắng hướng sang bên phải.",
            formula: "R U R'",
            initMoves: ["R", "U'", "R'"]
          },
          {
            id: 2,
            title: "Trường hợp 2: Mặt trắng hướng về trước",
            content: "Viên góc ở tầng 3, mặt trắng hướng về phía bạn.",
            formula: "U R U' R'",
            initMoves: ["R", "U", "R'", "U'"]
          },
          {
            id: 3,
            title: "Trường hợp 3: Mặt trắng hướng lên trên",
            content: "Viên góc ở tầng 3, mặt trắng hướng lên mặt vàng.",
            formula: "R U2 R' U' R U R'",
            initMoves: ["R", "U", "R'", "U'", "R", "U2", "R'", "U'"]
          }
        ]
      }
    ],
    color: "bg-blue-600", 
    border: "border-blue-600" 
  },
  { 
    id: 3, 
    title: "B3: Tầng 2", 
    subSteps: [
      {
        title: "Giải tầng giữa",
        content: "Tìm viên cạnh không có màu vàng ở tầng 3 và đưa về đúng vị trí ở tầng 2.",
        formula: "R U R' U' F' U' F (Phải) | L' U' L U F U F' (Trái)"
      }
    ],
    color: "bg-green-600", 
    border: "border-green-600" 
  },
  { 
    id: 4, 
    title: "B4: Dấu cộng vàng", 
    subSteps: [
      {
        title: "Tạo dấu cộng vàng",
        content: "Tạo dấu cộng màu vàng trên mặt trên cùng. Có 3 trường hợp: Chấm, chữ L, đường thẳng.",
        formula: "F R U R' U' F'"
      }
    ],
    color: "bg-yellow-500", 
    border: "border-yellow-500" 
  },
  { 
    id: 5, 
    title: "B5: Mặt vàng", 
    subSteps: [
      {
        title: "Full mặt vàng",
        content: "Sử dụng công thức để lật các góc vàng lên trên cùng.",
        formula: "R U R' U R U2 R'"
      }
    ],
    color: "bg-orange-500", 
    border: "border-orange-500" 
  },
  { 
    id: 6, 
    title: "B6: Hoán vị", 
    subSteps: [
      {
        title: "Về đích",
        content: "Sắp xếp lại các góc và các cạnh cuối cùng để hoàn thành khối Rubik.",
        formula: "R U R' F' R U R' U' R' F R2 U' R'"
      }
    ],
    color: "bg-red-600", 
    border: "border-red-600" 
  },
];
