const monsterInput = document.getElementById("monsterInput");
const searchButton = document.getElementById("searchButton");
const monsterResult = document.getElementById("monsterResult");

searchButton.addEventListener("click", () => {
  const monsterName = monsterInput.value.toLowerCase();
  if (monsterName) {
    searchMonster(monsterName);
  } else {
    monsterResult.innerHTML = "Please enter a monster name.";
  }
});

function searchMonster(monsterName) {
  monsterResult.innerHTML = "Searching...";

  // Using the new API endpoint
  axios
    .get(`https://api.open5e.com/v1/classes/`) // Endpoint for classes
    .then((response) => {
      const classes = response.data.results; // API response structure differs
      const matchedClass = classes.find(
        (cls) => cls.name.toLowerCase() === monsterName
      );

      if (matchedClass) {
        // Display the details of the matched class
        monsterResult.innerHTML = `
          <h2>${matchedClass.name}</h2>
          <p><strong>Hit Dice:</strong> ${matchedClass.hit_dice}</p>
          <p><strong>HP at 1st Level:</strong> ${matchedClass.hp_at_1st_level}</p>
          <p><strong>HP at Higher Levels:</strong> ${matchedClass.hp_at_higher_levels}</p>
          <p><strong>Armor Proficiencies:</strong> ${matchedClass.prof_armor}</p>
          <p><strong>Weapon Proficiencies:</strong> ${matchedClass.prof_weapons}</p>
          <p><strong>Tool Proficiencies:</strong> ${matchedClass.prof_tools}</p>
          <p><strong>Skill Proficiencies:</strong> ${matchedClass.prof_skills}</p>
          <p><strong>Equipment:</strong> ${matchedClass.equipment}</p>
          <p><strong>Spellcasting Ability:</strong> ${matchedClass.spellcasting_ability}</p>
          <p><strong>Description:</strong> ${matchedClass.desc || "No description available"}</p>
        `;
      } else {
        monsterResult.innerHTML = "Class not found.";
      }
    })
    .catch((error) => {
      monsterResult.innerHTML = "Error fetching classes.";
      console.error(error); // Log any error for debugging
    });
}
