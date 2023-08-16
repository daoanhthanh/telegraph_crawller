import puppeteer from "puppeteer";
import fs from "fs";
import axios from "axios";
import path from "path";

// TODO https://telegra.ph/Album-44-Liuwei-Emperor-Sauce---Toilet-JK-Uncensored-Version-70P-07-15-2

async function title_and_image_source(url) {
	const browser = await puppeteer.launch();
	const page = await browser.newPage();

	await page.goto(url, { timeout: 0, waitUntil: "networkidle2" }); // Wait until the page finishes loading

	// Here you can interact with the page using page.evaluate()
	const data = await page.evaluate(() => {
		const title = document
			.querySelector(".tl_article_header")
			.querySelector("h1")
			.textContent.replace("/", "-");

		const imageSource = Array.from(document.querySelectorAll("figure")).map(
			(el) => el.querySelector("img").src
		);

		return { savePath: title, imageSource };
	});

	await browser.close();

	return data;
}

function isFolderEmpty(path) {
	try {
		const files = fs.readdirSync(path);
		return files.length === 0;
	} catch (error) {
		return false;
	}
}

async function downloadAndSave(url, savePath) {
	try {
		const response = await axios.get(url, { responseType: "arraybuffer" });
		const fileName = path.basename(url);
		const filePath = path.join(savePath, fileName);

		fs.writeFileSync(filePath, response.data);
		console.log(`Downloaded and saved: ${fileName}`);
	} catch (error) {
		console.error(`Error downloading ${url}: ${error.message}`);
	}
}

const websiteUrl = process.argv[2];
if (!websiteUrl) {
	console.error("Usage: yarn start <url>");
} else {
	const { savePath, imageSource } = await title_and_image_source(websiteUrl)
		.then((data) => {
			return data;
		})
		.catch((error) => {
			console.error(error);
		});

	if (fs.existsSync(savePath) && !isFolderEmpty(savePath)) {
		console.log(`Folder ${savePath} already exists`);
	} else {
		if (!fs.existsSync(savePath)) {
			fs.mkdirSync(savePath);
		}

		const promises = imageSource.map((url) => {
			downloadAndSave(url, savePath);
		});

		console.log(typeof promises);

		await Promise.all(promises).then(() => {
			console.log(`Downloaded to ${savePath}`);
		});
	}
}
