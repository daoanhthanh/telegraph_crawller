import puppeteer from "puppeteer";
import fs from "fs";
import axios from "axios";
import path from "path";

//https://telegra.ph/%E8%A0%A2%E6%B2%AB%E6%B2%AB-%E5%B0%8F%E8%B5%A4%E5%9F%8E-07-09-2

async function title_and_image_source(url) {
	const browser = await puppeteer.launch();
	const page = await browser.newPage();

	await page.goto(url, { waitUntil: "networkidle2" }); // Wait until the page finishes loading

	// Here you can interact with the page using page.evaluate()
	const data = await page.evaluate(() => {
		const title = document
			.querySelector(".tl_article_header")
			.querySelector("h1").textContent;

		const imageSource = Array.from(document.querySelectorAll("figure")).map(
			(el) => el.querySelector("img").src
		);

		return { savePath: title, imageSource };
	});
	console.log("🚀 ~ file: index.js:26 ~ data ~ data:", data)

	await browser.close();
	
	return data;
	console.log("🚀 ~ file: index.js:30 ~ title_and_image_source ~ data:", data)
}

async function downloadAndSave(url, savePath) {
	try {
		const response = await axios.get(url, { responseType: "arraybuffer" });
		const fileName = path.basename(url);
		const filePath = path.join(savePath, fileName);

		fs.writeFileSync(filePath, response.data);
		console.log("🚀 ~ file: index.js:41 ~ downloadAndSave ~ data:", data)
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
			console.log("🚀 ~ file: index.js:55 ~ .then ~ data:", data)
			return data;
			console.log("🚀 ~ file: index.js:57 ~ .then ~ data:", data)
		})
		.catch((error) => {
			console.error(error);
		});

	if (!fs.existsSync(savePath)) {
		fs.mkdirSync(savePath);
	}

	imageSource.forEach((url) => {
		downloadAndSave(url, savePath);
	});
}
