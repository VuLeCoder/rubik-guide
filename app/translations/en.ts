export const en = {
  nav: {
    simulator: "Simulator",
    learn: "Learn",
    timer: "Timer",
    about: "About Me",
    language: "Language",
    theme: "Theme",
    light: "Light",
    dark: "Dark"
  },
  footer: "© 2026 RubikCommunity • Connecting Cubes, Building Community",
  aboutMe: {
    title: "Young Rubik's Cube Coach",
    biography: "Biography",
    personalBest: "Personal Best",
    myStory: "My Story",
    introVideo: "Intro Video",
    bioLabels: {
      location: "Location",
      chess: "Chess",
      robotics: "Robotics",
      highlights: "Highlights"
    },
    bioValues: {
      location: "Hanoi, Vietnam",
      chess: "Started playing chess at the age of 4; achieved numerous accolades from ages 5–7, consistently ranking among the top competitors in national chess championships.",
      robotics: "Pursued robotics since the age of 8 with Huna, EV3, and VEX platforms; participated in various national and international competitions.",
      highlights: "In 2026, served as an Organizing Committee member for the Robotics Summer Camp at the U.S. Embassy."
    },
    story: [
      "At the beginning of 2020, when the COVID-19 pandemic broke out, life came to a near standstill. Schools shut down, kids were isolated at home, and busy streets fell quiet. During this extraordinary time, I started my journey with a Rubik’s cube.",
      "Initially, I was only looking for something to pass the time. I learned how to solve a 3x3x3 cube online, fascinated by the joy of turning scrambled pieces into six solid-colored faces. Later on, I challenged myself with more sophisticated puzzles, including a 10x10x10 cube. With almost no tutorials available, I spent two days figuring it out through countless attempts. This was the time I realized that solving the Rubik’s cube is not just a game; it teaches people patience and perseverance.",
      "During the pandemic, I realized that many children were also stuck at home, with limited opportunities for meaningful activities. I asked myself: 'If the Rubik's cube has brought me such joy and passion, why not share it with other kids?'",
      "I started teaching Rubik’s cube classes both online and in person. Starting with just ten students, my classes gradually expanded to reach hundreds of children all over Vietnam. What made me happiest was not the growing popularity of my classes, but the changes I saw among my students. Many parents messaged me to express gratitude, saying their children were no longer hooked on their phones, had a more meaningful summer, and were motivated to learn something new every day. Some achieved impressive results in school competitions, including one student who won a gold medal.",
      "Inspired by these changes, I redirected my focus to those children who do not have the same opportunities, particularly orphans. Together with friends who shared my vision, I established a volunteer group with an initial goal of donating Rubik’s cubes and providing free guidance at all 17 SOS Children’s Villages across Vietnam.",
      "After achieving that goal, we continued visiting shelters, social protection centers, and remote schools. Each visit brought smiles and excitement as children discovered the joy of solving their first cubes. To date, our journey has taken us through 51 provinces and cities across Vietnam. We have donated thousands of Rubik’s cubes and taught thousands of children to solve them for free.",
      "Beyond teaching algorithms, I hope to give children even more opportunities to explore, challenge themselves, and experience the satisfaction of overcoming difficulties. Seeing how they gain confidence reminds me why I started this journey and motivates me to keep sharing what I love.",
      "Looking back, I realize that my greatest achievement is not solving the most complicated puzzles, but using a tiny cube to connect with people, inspire children, and bring joy to communities that need it most.",
      "Therefore, I will continue this journey, teaching Rubik's cube classes online and in person, bringing Rubik's cubes to more regions, so that more and more children across Vietnam can nurture curiosity, perseverance, and the belief that as long as you don't give up, no matter how tangled things get, there will always be a way to find the solution.",
    ]
  },
  timer: {
    title: "Rubik Timer",
    guideTitle: "How to Use the Timer",
    guideComputer: "Computer:",
    guideComputerDesc: "Hold the Space key to prepare, release to start. Press again to stop. Press once more to clear the time.",
    guidePhone: "Phone:",
    guidePhoneDesc: "Tap and hold the central area (around the timer numbers) to prepare, release to start. Tap it again to stop or clear the result.",
    understood: "Understood",
    statistics: "Statistics",
    best: "Best",
    ao5: "Average (Ao5)",
    mean: "Overall Average",
    history: "History",
    clearAll: "Clear All",
    noData: "No solve data yet",
    clearConfirm: "Clear all history?",
    deleteBtn: "Delete",
    cancelBtn: "Cancel",
    deleteThis: "Delete this solve",
    stoppedHint: "Press Space / Tap to clear result",
    idleHint: "Hold Space / Touch and hold to prepare"
  },
  simulator: {
    historyLog: "History Log",
    noMoves: "No moves",
    resetBtn: "Reset",
    resetCubeBtn: "Reset Cube",
    faceMoves: "Face Moves",
    slices: "Slices"
  },
  learn: {
    stepLabel: "Step",
    loadingLessons: "Loading Lessons...",
    roadmapTitle: "6-Step Roadmap",
    roadmapSubtitle: "Guide for beginners",
    partLabel: "Part",
    formulaLabel: "Algorithm",
    interaction3D: "3D Interaction",
    steps: [
      {
        id: 1,
        title: "Step 1: White Cross",
        subSteps: [
          {
            title: "Make the Daisy",
            content: "Bring 4 white edge pieces around the yellow center on the top face. Disregard the side colors. The goal is to form a daisy pattern."
          },
          {
            title: "Create the White Cross",
            content: "Rotate the top face (U) to align the edge color with the side center, then turn that face 180 degrees (F2, R2...) to move it to the white face."
          }
        ]
      },
      {
        id: 2,
        title: "Step 2: First Layer",
        subSteps: [
          {
            title: "Complete the White Face",
            content: "Put the white corners into their correct positions. Orient the white face downwards (opposite the yellow face). Find a corner piece with white on the 3rd layer and place it directly above its target position.",
            cases: [
              {
                id: 1,
                title: "Case 1: White face pointing right",
                content: "Corner piece is on the 3rd layer, white face is facing right."
              },
              {
                id: 2,
                title: "Case 2: White face pointing front",
                content: "Corner piece is on the 3rd layer, white face is facing you."
              },
              {
                id: 3,
                title: "Case 3: White face pointing up",
                content: "Corner piece is on the 3rd layer, white face is facing up towards the yellow face."
              }
            ]
          }
        ]
      },
      {
        id: 3,
        title: "Step 3: Second Layer",
        subSteps: [
          {
            title: "Solve the Middle Layer",
            content: "Find an edge piece without yellow on the 3rd layer and put it into the correct position on the 2nd layer. Rotate the 3rd layer so that the front color of the edge piece matches the front center.",
            cases: [
              {
                id: 1,
                title: "Case 1: Move to the right",
                content: "The edge piece needs to move to the right position (between Front and Right faces)."
              },
              {
                id: 2,
                title: "Case 2: Move to the left",
                content: "The edge piece needs to move to the left position (between Front and Left faces)."
              }
            ]
          }
        ]
      },
      {
        id: 4,
        title: "Step 4: Yellow Cross",
        subSteps: [
          {
            title: "Create the Yellow Cross",
            content: "Create a yellow cross on the top face. There are 3 cases: Dot, L-shape, and Line. Note: Only focus on the edge pieces, ignore the corner pieces.",
            cases: [
              {
                id: 1,
                title: "Case 1: Dot",
                content: "The center is yellow, but none of the edge pieces have yellow facing up. Ignore the corner pieces."
              },
              {
                id: 2,
                title: "Case 2: Reverse L-shape",
                content: "Two yellow edge pieces form an L-shape. Rotate the top face (U) so these edges are at the Back (UB) and Left (UL) positions."
              },
              {
                id: 3,
                title: "Case 3: Line",
                content: "Two yellow edge pieces form a straight line. Rotate the top face (U) so the line is horizontal."
              }
            ]
          }
        ]
      },
      {
        id: 5,
        title: "Step 5: Yellow Face",
        subSteps: [
          {
            title: "Complete the Yellow Face",
            content: "Use a single algorithm for all 7 cases to orient all yellow corners upwards. Note the orientation of the Rubik's cube before turning so that the yellow pieces match the simulation.",
            cases: [
              {
                id: 1,
                title: "Case 1:",
                content: "There is 1 yellow corner on the top face (placed at front-left). The corner piece at front-right has its yellow face pointing front."
              },
              {
                id: 2,
                title: "Case 2:",
                content: "There is 1 yellow corner on the top face (placed at back-right). The corner piece at front-right has its yellow face pointing right.\nPerforming the moves will lead to **Case 1**"
              },
              {
                id: 3,
                title: "Case 3:",
                content: "No yellow corners on the top face. There are 2 pairs of headlights on the front and back faces.\nPerforming the moves will lead to **Case 1**"
              },
              {
                id: 4,
                title: "Case 4:",
                content: "No yellow corners on the top face. There is 1 pair of headlights on the left, the other 2 corners face front and back.\nPerforming the moves will lead to **Case 1**"
              },
              {
                id: 5,
                title: "Case 5:",
                content: "There are 2 yellow corners on the top face (back). The 2 front corners point front, forming headlights.\nPerforming the moves will lead to **Case 2**"
              },
              {
                id: 6,
                title: "Case 6:",
                content: "There are 2 yellow corners on the top face (right). The 2 left corners face front and back.\nPerforming the moves will lead to **Case 2**"
              },
              {
                id: 7,
                title: "Case 7:",
                content: "There are 2 yellow corners on the top face (diagonally opposite). The remaining corners face different directions.\nPerforming the moves will lead to **Case 2**"
              }
            ]
          }
        ]
      },
      {
        id: 6,
        title: "Step 6: Permutation",
        subSteps: [
          {
            title: "Permute Corners",
            content: "Rearrange the corner pieces on the 3rd layer to their correct positions. Rotate the top layer (U) so that:",
            cases: [
              {
                id: 1,
                title: "Case 1:",
                content: "2 correct corners are adjacent to each other. Place that face on the left side and perform the following algorithm:"
              },
              {
                id: 2,
                title: "Case 2:",
                content: "2 correct corners are diagonally opposite. Select a face with 1 correct edge and 1 correct corner, place it facing you, and perform the following algorithm to lead to **Case 1**"
              }
            ]
          },
          {
            title: "Permute Edges",
            content: "Rearrange the edge pieces on the 3rd layer to their correct positions to complete the Rubik's cube.",
            cases: [
              {
                id: 1,
                title: "Case 1",
                content: "There is 1 completed face (e.g., Red). The remaining edges need to cycle clockwise (Blue center has Orange edge, Orange center has Green edge, Green center has Blue edge)."
              },
              {
                id: 2,
                title: "Case 2",
                content: "There is 1 completed face (e.g., Red). The remaining edges need to cycle counter-clockwise (Blue center has Green edge, Orange center has Blue edge, Green center has Orange edge)."
              },
              {
                id: 3,
                title: "Case 3",
                content: "No completed faces. Use the algorithm from Case 1 or Case 2 to lead to **Case 1** or **Case 2**."
              }
            ]
          }
        ]
      }
    ]
  }
};
