const $ = document;

export function createGlassFolder(imageAddress, altText, folderName, main, pageUrl) {
	const folder = $.createElement(pageUrl ? "a" : "div");
	folder.classList.add("folder");
	if (pageUrl) {
		folder.href = pageUrl;
		folder.setAttribute("aria-label", `${folderName} case study`);
	} else {
		folder.setAttribute("role", "article");
	}

	const folderBack = $.createElement("div");
	folderBack.classList.add("folder-back");

	let folderImage = null;
	if (imageAddress) {
		folderImage = $.createElement("img");
		folderImage.classList.add("folder-image");
		folderImage.src = imageAddress;
		folderImage.loading = "lazy";
		folderImage.decoding = "async";
		folderImage.alt = altText || `${folderName} project by Arvin Saghafi`;
		folderImage.title = folderName;
	}
	const folderFront = $.createElement("div");
	folderFront.classList.add("folder-front");

	let folderTitle = null;
	if (folderName) {
		folderTitle = $.createElement("div");

		folderTitle.classList.add(
			main ? "main-folder-title" : "sub-folder-title",
		);

		folderTitle.textContent = folderName;
	}

	folder.appendChild(folderBack);
	if (folderImage) {
		folder.appendChild(folderImage);
	}
	folder.appendChild(folderFront);
	if (folderTitle) {
		folderFront.appendChild(folderTitle);
	}
	return folder;
}