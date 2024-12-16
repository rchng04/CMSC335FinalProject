// Ryan Chng
const http = require('http');
const path = require("path");
const fs = require("fs");
const express = require("express"); 
const app = express(); 
const axios = require("axios");
const { MongoClient, ServerApiVersion } = require('mongodb');
process.stdin.setEncoding("utf8");
  
require("dotenv").config({ path: path.resolve(__dirname, 'credentialsDontPost/.env') }) 
const uri = process.env.MONGO_CONNECTION_STRING;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "templates"));
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

if (process.argv.length != 3) {
	process.stdout.write(`Usage supermarketServer.js jsonFile`);
	process.exit(1);
}

const portNumber = process.argv[2];


app.listen(portNumber);
console.log(`Web server started and running at http://localhost:${portNumber}`);

const prompt = "Stop to shutdown the server: ";
process.stdout.write(prompt);
process.stdin.on("readable", function () {
	const dataInput = process.stdin.read();
	if (dataInput !== null) {
		const command = dataInput.trim();
		if (command === "stop") {
			process.stdout.write("Shutting down the server\n");
			process.exit(0);
		} else {
			process.stdout.write(`Invalid command: ${command}\n`);
		}
	  	process.stdout.write(prompt);
	  	process.stdin.resume();
	}
});



app.get("/", (request, response) => { 
	response.render("index.ejs");
}); 

app.get("/review", (request, response) => { 
	
  	response.render("reviewApplication");
});


app.post("/review", async (req, res) => { 
	const { name } = req.body;

    try {
        // Query the database for an entry matching the provided name
        const application = await client.db(process.env.MONGO_DB_NAME)
            .collection(process.env.MONGO_COLLECTION)
            .findOne({ name });

        if (application) {
            // Render the application data if found in MongoDB
            res.render("applicationData", {
                name: application.name,
                hit_dice: application.hit_dice, 
                hp_at_1st_level: application.hp_at_1st_level, 
                hp_at_higher_levels: application.hp_at_higher_levels, 
                prof_armor: application.prof_armor, 
                prof_weapons: application.prof_weapons, 
                prof_tools: application.prof_tools, 
                prof_skills: application.prof_skills, 
                equipment: application.equipment, 
                spellcasting_ability: application.spellcasting_ability, 
                description: application.description,
            });
        } else {
            console.log("searching in list");

            // Fetch class data from external API if not found in MongoDB
            axios
            .get(`https://api.open5e.com/v1/classes/`) // Endpoint for classes
            .then((response) => {
                const classes = response.data.results;
                const matchedClass = classes.find(
                    (cls) => cls.name.toLowerCase() === name
                );

                if (matchedClass) {
                    // Render the application data with the matched class info
                    res.render("applicationData", {
                        name: matchedClass.name,
                        hit_dice: matchedClass.hit_dice,
                        hp_at_1st_level: matchedClass.hp_at_1st_level,
                        hp_at_higher_levels: matchedClass.hp_at_higher_levels,
                        prof_armor: matchedClass.prof_armor,
                        prof_weapons: matchedClass.prof_weapons,
                        prof_tools: matchedClass.prof_tools,
                        prof_skills: matchedClass.prof_skills,
                        equipment: matchedClass.equipment,
                        spellcasting_ability: matchedClass.spellcasting_ability,
                        description: matchedClass.desc,
                    });
                } else {
                    // Handle case when no match is found in the API
                    res.render("applicationData", {
                        name: "NONE",
                        hit_dice: "NONE",
                        hp_at_1st_level: "NONE",
                        hp_at_higher_levels: "NONE",
                        prof_armor: "NONE",
                        prof_weapons: "NONE",
                        prof_tools: "NONE",
                        prof_skills: "NONE",
                        equipment: "NONE",
                        spellcasting_ability: "NONE",
                        description: "NONE",
                    });
                }
            })
            .catch((error) => {
                console.log("Error fetching classes.");
                console.error(error); // Log any error for debugging
                res.status(500).send("Error fetching classes");
            });
        }
    } catch (e) {
        console.error(e);
        res.status(500).send("Error retrieving application.");
    }
}); 

// displays the placeApplication.ejs template with the table of items available.
app.get("/apply", (req, res) => { 

  	res.render("placeApplication");
}); 

app.post("/apply", async (req, res) => { 
    try {
        // Destructure form data
        const { name, hit_dice , hp_at_1st_level , hp_at_higher_levels , prof_armor , prof_weapons , prof_tools , prof_skills , equipment , spellcasting_ability , description } = req.body;

        // Database operation
        const application = { name, hit_dice , hp_at_1st_level , hp_at_higher_levels , prof_armor , prof_weapons , prof_tools , prof_skills , equipment , spellcasting_ability , description };
        const result = await client.db(process.env.MONGO_DB_NAME)
            .collection(process.env.MONGO_COLLECTION)
            .insertOne(application);

        // console.log(`Application submitted with ID: ${result.insertedId}`);

        res.render("applicationData", { name, hit_dice , hp_at_1st_level , hp_at_higher_levels , prof_armor , prof_weapons , prof_tools , prof_skills , equipment , spellcasting_ability , description });
    } catch (e) {
        console.error(e);
        res.status(500).send("Error submitting application");
    }
}); 

app.get("/remove", (request, response) => { 

    response.render("removeApplication");
}); 

app.post("/remove", async (request, response) => { 

    try {
        // Delete all entries from the collection
        const result = await client.db(process.env.MONGO_DB_NAME)
            .collection(process.env.MONGO_COLLECTION)
            .deleteMany({});

        const deletedCount = result.deletedCount; // Number of entries deleted
        // console.log(`Deleted ${deletedCount} entries from the database.`);

        // Render confirmation page
        response.render("removeConfirmation", { deletedCount });
    } catch (e) {
        console.error(e);
        response.status(500).send("Error removing applications.");
    }
}); 

async function main() {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
    try {
        await client.connect();
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

main().catch(console.error);