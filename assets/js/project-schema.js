export function generateProjectSchema(projects) {
	return {
		"@context": "https://schema.org",
		"@type": "ItemList",
		"@id": "https://aboutarvin.ir/#projects",
		name: "Arvin Saghafi Software Projects",
		itemListElement: projects.map((project) => ({
			"@type": "SoftwareApplication",
			name: project.folderName,
			description: project.description,
			applicationCategory: project.category,
			author: {
				"@id": "https://aboutarvin.ir/#person",
			},
			programmingLanguage: project.technologies,
			keywords: project.keywords,
		})),
	};
}
