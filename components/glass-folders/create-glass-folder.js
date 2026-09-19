const $ = document;

export function createGlassFolder(imageAddress, folderName, main) {
	const folder = $.createElement("div");
	folder.classList.add("folder");

	const folderBack = $.createElement("div");
	folderBack.classList.add("folder-back");

	let folderImage = null;
	if (imageAddress) {
		folderImage = $.createElement("img");
		folderImage.classList.add("folder-image");
		folderImage.src = imageAddress;
		folderImage.loading = "lazy";
		if (folderName) {
			folderImage.alt = folderName;
		} else {
			folderImage.alt = "Project"
		}
	}

	const folderFront = $.createElement("div");
	folderFront.classList.add("folder-front");

	let folderTitle = null;
	if (folderName) {
		folderTitle = $.createElement("div");
		if (main) {
			folderTitle.classList.add("main-folder-title");
		} else {
			folderTitle.classList.add("sub-folder-title");
		}
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